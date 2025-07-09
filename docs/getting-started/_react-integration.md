---
title: React Integration
description: Complete React integration with hooks, state management, and UI components
sidebar_position: 5
---

# React Integration

Build sophisticated audio applications with React using modern hooks, state management, and responsive UI components.

## Basic React Hook Integration

Create custom hooks for audio management:

```typescript
import { useState, useEffect, useCallback } from 'react';
import { 
  queueAudio, 
  queueAudioPriority,
  pauseChannel, 
  resumeChannel,
  setChannelVolume,
  setVolumeDucking,
  getCurrentAudioInfo,
  getQueueSnapshot,
  onAudioStart,
  onAudioComplete,
  onAudioProgress,
  onQueueChange,
  onAudioPause,
  onAudioResume,
  type AudioInfo,
  type AudioQueueOptions,
  type QueueSnapshot
} from 'audio-channel-queue';

// Custom hook for audio control
export function useAudioChannel(channel: number = 0) {
  const [audioInfo, setAudioInfo] = useState<AudioInfo | null>(null);
  const [queueSnapshot, setQueueSnapshot] = useState<QueueSnapshot | null>(null);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    // Set up event listeners
    const unsubscribeStart = onAudioStart(channel, setAudioInfo);
    const unsubscribeProgress = onAudioProgress(channel, setAudioInfo);
    const unsubscribeComplete = onAudioComplete(channel, () => setAudioInfo(null));
    const unsubscribeQueueChange = onQueueChange(channel, setQueueSnapshot);
    const unsubscribePause = onAudioPause(channel, () => setIsPaused(true));
    const unsubscribeResume = onAudioResume(channel, () => setIsPaused(false));

    return () => {
      // Cleanup event listeners
      unsubscribeStart?.();
      unsubscribeProgress?.();
      unsubscribeComplete?.();
      unsubscribeQueueChange?.();
      unsubscribePause?.();
      unsubscribeResume?.();
    };
  }, [channel]);

  const playAudio = useCallback(async (audioUrl: string, options?: AudioQueueOptions) => {
    try {
      await queueAudio(audioUrl, channel, options);
      return true;
    } catch (error) {
      console.error('Failed to play audio:', error);
      return false;
    }
  }, [channel]);

  const playPriorityAudio = useCallback(async (audioUrl: string, options?: AudioQueueOptions) => {
    try {
      await queueAudioPriority(audioUrl, channel, options);
      return true;
    } catch (error) {
      console.error('Failed to play priority audio:', error);
      return false;
    }
  }, [channel]);

  const pause = useCallback(async () => {
    await pauseChannel(channel);
  }, [channel]);

  const resume = useCallback(async () => {
    await resumeChannel(channel);
  }, [channel]);

  const setVolume = useCallback(async (volume: number) => {
    await setChannelVolume(channel, volume);
  }, [channel]);

  return {
    audioInfo,
    queueSnapshot,
    isPaused,
    playAudio,
    playPriorityAudio,
    pause,
    resume,
    setVolume
  };
}
```

## Complete Audio Player Component

A full-featured audio player with controls and visualizations:

```tsx
import React, { useState, useEffect } from 'react';
import { useAudioChannel } from './hooks/useAudioChannel';

interface AudioPlayerProps {
  playlist: string[];
  channel?: number;
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({ 
  playlist, 
  channel = 0 
}) => {
  const { 
    audioInfo, 
    queueSnapshot, 
    isPaused, 
    playAudio, 
    pause, 
    resume, 
    setVolume 
  } = useAudioChannel(channel);

  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [volume, setVolumeState] = useState(1.0);

  // Load initial playlist
  useEffect(() => {
    if (playlist.length > 0) {
      playlist.forEach(track => playAudio(track));
    }
  }, [playlist, playAudio]);

  const handleVolumeChange = async (newVolume: number) => {
    setVolumeState(newVolume);
    await setVolume(newVolume);
  };

  const togglePlayPause = async () => {
    if (isPaused) {
      await resume();
    } else {
      await pause();
    }
  };

  const formatTime = (milliseconds: number): string => {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="audio-player">
      {/* Now Playing Display */}
      {audioInfo && (
        <div className="now-playing">
          <h3>Now Playing</h3>
          <div className="track-info">
            <div className="track-name">{audioInfo.fileName}</div>
            <div className="time-info">
              {formatTime(audioInfo.currentTime)} / {formatTime(audioInfo.duration)}
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="progress-container">
            <div 
              className="progress-bar"
              style={{ width: `${audioInfo.progress * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="controls">
        <button onClick={togglePlayPause} className="play-pause-btn">
          {isPaused ? '▶️' : '⏸️'}
        </button>
        
        <div className="volume-control">
          <label>🔊 Volume: {Math.round(volume * 100)}%</label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={volume}
            onChange={(e) => handleVolumeChange(Number(e.target.value))}
          />
        </div>
      </div>

      {/* Queue Display */}
      {queueSnapshot && (
        <div className="queue-display">
          <h4>Queue ({queueSnapshot.totalItems} items)</h4>
          <div className="queue-items">
            {queueSnapshot.items.map((item, index) => (
              <div 
                key={index} 
                className={`queue-item ${item.isCurrentlyPlaying ? 'playing' : ''}`}
              >
                <span className="position">{index + 1}.</span>
                <span className="filename">{item.fileName}</span>
                <span className="duration">{formatTime(item.duration)}</span>
                {item.isCurrentlyPlaying && <span className="playing-indicator">🔊</span>}
                {item.isLooping && <span className="loop-indicator">🔁</span>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
```

## Multi-Channel Audio Dashboard

Manage multiple audio channels in a dashboard interface:

```tsx
import React, { useState, useEffect } from 'react';
import { 
  getAllChannelsInfo, 
  getAllChannelsPauseState,
  setAllChannelsVolume,
  pauseAllChannels,
  resumeAllChannels,
  type AudioInfo
} from 'audio-channel-queue';
import { useAudioChannel } from './hooks/useAudioChannel';

export const AudioDashboard: React.FC = () => {
  const [allChannelsInfo, setAllChannelsInfo] = useState<(AudioInfo | null)[]>([]);
  const [allPauseStates, setAllPauseStates] = useState<boolean[]>([]);
  const [masterVolume, setMasterVolume] = useState(1.0);

  // Individual channel hooks for primary channels
  const backgroundMusic = useAudioChannel(0);
  const soundEffects = useAudioChannel(1);
  const voiceAnnouncements = useAudioChannel(2);

  useEffect(() => {
    // Update all channels info periodically
    const interval = setInterval(() => {
      setAllChannelsInfo(getAllChannelsInfo());
      setAllPauseStates(getAllChannelsPauseState());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleMasterVolumeChange = async (volume: number) => {
    setMasterVolume(volume);
    await setAllChannelsVolume(volume);
  };

  const handleMasterPause = async () => {
    await pauseAllChannels();
  };

  const handleMasterResume = async () => {
    await resumeAllChannels();
  };

  return (
    <div className="audio-dashboard">
      <h2>Audio Control Center</h2>
      
      {/* Master Controls */}
      <div className="master-controls">
        <h3>Master Controls</h3>
        <div className="control-group">
          <button onClick={handleMasterPause} className="master-pause">
            ⏸️ Pause All
          </button>
          <button onClick={handleMasterResume} className="master-resume">
            ▶️ Resume All
          </button>
        </div>
        
        <div className="volume-control">
          <label>Master Volume: {Math.round(masterVolume * 100)}%</label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={masterVolume}
            onChange={(e) => handleMasterVolumeChange(Number(e.target.value))}
          />
        </div>
      </div>

      {/* Individual Channel Controls */}
      <div className="channels-grid">
        <ChannelCard
          title="Background Music"
          channel={0}
          audioHook={backgroundMusic}
          color="#4CAF50"
        />
        
        <ChannelCard
          title="Sound Effects"
          channel={1}
          audioHook={soundEffects}
          color="#FF9800"
        />
        
        <ChannelCard
          title="Voice Announcements"
          channel={2}
          audioHook={voiceAnnouncements}
          color="#2196F3"
        />
      </div>

      {/* All Channels Overview */}
      <div className="all-channels-overview">
        <h3>All Channels Status</h3>
        <div className="channels-list">
          {allChannelsInfo.map((info, channelIndex) => (
            <div key={channelIndex} className="channel-status">
              <div className="channel-number">Channel {channelIndex}</div>
              {info ? (
                <div className="channel-info">
                  <div>🎵 {info.fileName}</div>
                  <div>🔊 {Math.round(info.volume * 100)}%</div>
                  <div>{allPauseStates[channelIndex] ? '⏸️ Paused' : '▶️ Playing'}</div>
                </div>
              ) : (
                <div className="no-audio">No audio</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

interface ChannelCardProps {
  title: string;
  channel: number;
  audioHook: ReturnType<typeof useAudioChannel>;
  color: string;
}

const ChannelCard: React.FC<ChannelCardProps> = ({ title, channel, audioHook, color }) => {
  const { audioInfo, queueSnapshot, isPaused, pause, resume, setVolume } = audioHook;
  const [volume, setVolumeState] = useState(1.0);

  const handleVolumeChange = async (newVolume: number) => {
    setVolumeState(newVolume);
    await setVolume(newVolume);
  };

  return (
    <div className="channel-card" style={{ borderColor: color }}>
      <h4 style={{ color }}>{title}</h4>
      
      {audioInfo ? (
        <div className="channel-active">
          <div className="now-playing">
            <div className="filename">{audioInfo.fileName}</div>
            <div className="progress">
              Progress: {Math.round(audioInfo.progress * 100)}%
            </div>
          </div>
          
          <div className="controls">
            <button onClick={async () => isPaused ? await resume() : await pause()}>
              {isPaused ? '▶️' : '⏸️'}
            </button>
            
            <div className="volume-control">
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={volume}
                onChange={(e) => handleVolumeChange(Number(e.target.value))}
              />
            </div>
          </div>
        </div>
      ) : (
        <div className="channel-inactive">
          <div className="no-audio">No audio playing</div>
        </div>
      )}
      
      {queueSnapshot && (
        <div className="queue-info">
          <small>{queueSnapshot.totalItems} items in queue</small>
        </div>
      )}
    </div>
  );
};
```

## Advanced React Example with Volume Ducking

Implement sophisticated audio mixing with automatic volume ducking:

```tsx
import React, { useState, useEffect } from 'react';
import { 
  setVolumeDucking, 
  clearVolumeDucking,
  queueAudio
} from 'audio-channel-queue';

export const SmartAudioMixer: React.FC = () => {
  const [isDuckingEnabled, setIsDuckingEnabled] = useState(false);
  const [backgroundTrack] = useState('./audio/background-music.mp3');
  const [announcement] = useState('./audio/announcement.mp3');

  useEffect(() => {
    // Set up volume ducking when voice announcements play
    if (isDuckingEnabled) {
      setVolumeDucking({
        priorityChannel: 1,      // Announcements channel
        priorityVolume: 1.0,     // Full volume for announcements
        duckingVolume: 0.1       // Reduce background to 10%
      });
    } else {
      clearVolumeDucking();
    }

    return () => {
      clearVolumeDucking();
    };
  }, [isDuckingEnabled]);

  const startBackgroundMusic = async () => {
    await queueAudio(backgroundTrack, 0, { loop: true, volume: 0.7 });
  };

  const playAnnouncement = async () => {
    // Play announcement on priority channel
    // When this plays, all other channels will automatically reduce to 10% volume
    await queueAudio(announcement, 1);
    // When the announcement finishes, other channels will return to their original volume
  };

  return (
    <div className="smart-audio-mixer">
      <h2>Smart Audio Mixer</h2>
      
      <div className="ducking-control">
        <label>
          <input
            type="checkbox"
            checked={isDuckingEnabled}
            onChange={(e) => setIsDuckingEnabled(e.target.checked)}
          />
          Enable Volume Ducking
        </label>
        <p className="description">
          When enabled, announcements will automatically reduce background music volume
        </p>
      </div>

      <div className="audio-controls">
        <button onClick={startBackgroundMusic} className="start-bg">
          🎵 Start Background Music
        </button>
        
        <button onClick={playAnnouncement} className="play-announcement">
          📢 Play Announcement
          {isDuckingEnabled && ' (Auto-ducks background)'}
        </button>
      </div>

      <div className="status">
        <p>
          Volume Ducking: {isDuckingEnabled ? '✅ Enabled' : '❌ Disabled'}
        </p>
        <p className="info">
          With ducking enabled, the background music will automatically reduce to 10% volume 
          when announcements play, then return to normal when they finish.
        </p>
      </div>
    </div>
  );
};
```

## React Context for Global Audio State

Create a context provider for managing audio state across your entire application:

```tsx
import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { 
  getAllChannelsInfo, 
  getAllChannelsPauseState,
  onAudioStart,
  onAudioComplete,
  onQueueChange,
  type AudioInfo
} from 'audio-channel-queue';

interface AudioState {
  channels: (AudioInfo | null)[];
  pauseStates: boolean[];
  globalMuted: boolean;
  isInitialized: boolean;
}

type AudioAction = 
  | { type: 'UPDATE_CHANNELS'; channels: (AudioInfo | null)[] }
  | { type: 'UPDATE_PAUSE_STATES'; pauseStates: boolean[] }
  | { type: 'TOGGLE_GLOBAL_MUTE' }
  | { type: 'INITIALIZE' };

const initialState: AudioState = {
  channels: [],
  pauseStates: [],
  globalMuted: false,
  isInitialized: false
};

function audioReducer(state: AudioState, action: AudioAction): AudioState {
  switch (action.type) {
    case 'UPDATE_CHANNELS':
      return { ...state, channels: action.channels };
    case 'UPDATE_PAUSE_STATES':
      return { ...state, pauseStates: action.pauseStates };
    case 'TOGGLE_GLOBAL_MUTE':
      return { ...state, globalMuted: !state.globalMuted };
    case 'INITIALIZE':
      return { ...state, isInitialized: true };
    default:
      return state;
  }
}

const AudioContext = createContext<{
  state: AudioState;
  dispatch: React.Dispatch<AudioAction>;
} | null>(null);

export const AudioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(audioReducer, initialState);

  useEffect(() => {
    // Initialize audio system
    dispatch({ type: 'INITIALIZE' });

    // Set up global listeners
    const updateState = () => {
      dispatch({ type: 'UPDATE_CHANNELS', channels: getAllChannelsInfo() });
      dispatch({ type: 'UPDATE_PAUSE_STATES', pauseStates: getAllChannelsPauseState() });
    };

    // Update state periodically
    const interval = setInterval(updateState, 1000);

    // Set up event listeners for real-time updates
    const unsubscribers = [
      onAudioStart(0, updateState),
      onAudioStart(1, updateState),
      onAudioStart(2, updateState),
      onAudioComplete(0, updateState),
      onAudioComplete(1, updateState),
      onAudioComplete(2, updateState),
      onQueueChange(0, updateState),
      onQueueChange(1, updateState),
      onQueueChange(2, updateState)
    ];

    return () => {
      clearInterval(interval);
      unsubscribers.forEach(unsub => unsub?.());
    };
  }, []);

  return (
    <AudioContext.Provider value={{ state, dispatch }}>
      {children}
    </AudioContext.Provider>
  );
};

export const useAudioContext = () => {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error('useAudioContext must be used within an AudioProvider');
  }
  return context;
};

// Usage in components
export const AudioStatusBar: React.FC = () => {
  const { state } = useAudioContext();

  return (
    <div className="audio-status-bar">
      <div className="active-channels">
        Active Channels: {state.channels.filter(channel => channel !== null).length}
      </div>
      <div className="global-status">
        {state.globalMuted ? '🔇 Muted' : '🔊 Audio Active'}
      </div>
    </div>
  );
};
```

## Styling with CSS

Add beautiful styling for your audio components:

```css
/* Audio Player Styles */
.audio-player {
  background: #2c3e50;
  color: white;
  padding: 20px;
  border-radius: 8px;
  max-width: 600px;
  margin: 20px auto;
}

.now-playing {
  margin-bottom: 20px;
}

.track-info {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
}

.track-name {
  font-weight: bold;
  font-size: 1.1em;
}

.progress-container {
  background: #34495e;
  height: 4px;
  border-radius: 2px;
  overflow: hidden;
}

.progress-bar {
  background: #3498db;
  height: 100%;
  transition: width 0.1s ease;
}

.controls {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 20px;
}

.play-pause-btn {
  background: #3498db;
  border: none;
  color: white;
  padding: 12px 24px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 1.2em;
}

.play-pause-btn:hover {
  background: #2980b9;
}

.volume-control {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.volume-control input[type="range"] {
  width: 100px;
}

/* Dashboard Styles */
.audio-dashboard {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.master-controls {
  background: #ecf0f1;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 30px;
}

.control-group {
  display: flex;
  gap: 10px;
  margin-bottom: 15px;
}

.master-pause, .master-resume {
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
}

.master-pause {
  background: #e74c3c;
  color: white;
}

.master-resume {
  background: #27ae60;
  color: white;
}

.channels-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.channel-card {
  background: white;
  border: 2px solid #bdc3c7;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.channel-active {
  color: #2c3e50;
}

.channel-inactive {
  color: #7f8c8d;
  text-align: center;
  padding: 20px 0;
}

.queue-display {
  background: #f8f9fa;
  padding: 15px;
  border-radius: 6px;
  margin-top: 20px;
}

.queue-item {
  display: grid;
  grid-template-columns: auto 1fr auto auto;
  gap: 10px;
  padding: 8px 0;
  border-bottom: 1px solid #e9ecef;
  align-items: center;
}

.queue-item.playing {
  background: #e3f2fd;
  font-weight: bold;
}

.playing-indicator {
  color: #2196f3;
}

.loop-indicator {
  color: #ff9800;
}

/* Smart Mixer Styles */
.smart-audio-mixer {
  background: #f5f5f5;
  padding: 30px;
  border-radius: 8px;
  max-width: 600px;
  margin: 20px auto;
}

.ducking-control {
  background: white;
  padding: 20px;
  border-radius: 6px;
  margin-bottom: 20px;
}

.ducking-control label {
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: bold;
  cursor: pointer;
}

.description {
  margin-top: 10px;
  color: #666;
  font-size: 0.9em;
}

.audio-controls {
  display: flex;
  gap: 15px;
  margin-bottom: 20px;
}

.start-bg, .play-announcement {
  padding: 12px 24px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: bold;
}

.start-bg {
  background: #4caf50;
  color: white;
}

.play-announcement {
  background: #ff9800;
  color: white;
}

.status {
  background: white;
  padding: 15px;
  border-radius: 6px;
}

.info {
  color: #666;
  font-size: 0.9em;
  margin-top: 10px;
}
```

## Integration with Popular React Libraries

### With React Router

```tsx
import React, { useEffect } from 'react';
import { useAudioChannel } from './hooks/useAudioChannel';
import { useLocation } from 'react-router-dom';

export const RouteAudioManager: React.FC = () => {
  const location = useLocation();
  const backgroundMusic = useAudioChannel(0);

  useEffect(() => {
    // Change background music based on route
    const routeMusic: Record<string, string> = {
      '/': './audio/home.mp3',
      '/game': './audio/game-music.mp3',
      '/settings': './audio/ambient.mp3'
    };

    const musicUrl = routeMusic[location.pathname];
    if (musicUrl) {
      backgroundMusic.playAudio(musicUrl, { loop: true });
    }
  }, [location.pathname, backgroundMusic]);

  return null; // This component just manages audio
};
```

### With Redux Toolkit

```typescript
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AudioState {
  isPlaying: boolean;
  currentTrack: string | null;
  volume: number;
  queue: string[];
}

const initialState: AudioState = {
  isPlaying: false,
  currentTrack: null,
  volume: 1.0,
  queue: []
};

const audioSlice = createSlice({
  name: 'audio',
  initialState,
  reducers: {
    play: (state, action: PayloadAction<string>) => {
      state.isPlaying = true;
      state.currentTrack = action.payload;
    },
    pause: (state) => {
      state.isPlaying = false;
    },
    setVolume: (state, action: PayloadAction<number>) => {
      state.volume = action.payload;
    },
    addToQueue: (state, action: PayloadAction<string>) => {
      state.queue.push(action.payload);
    }
  }
});

export const { play, pause, setVolume, addToQueue } = audioSlice.actions;
export default audioSlice.reducer;
```

## Testing Audio Components

```tsx
import { render, fireEvent, waitFor } from '@testing-library/react';
import { AudioPlayer } from './AudioPlayer';

// Mock the audio-channel-queue module
jest.mock('audio-channel-queue', () => ({
  queueAudio: jest.fn().mockResolvedValue(undefined),
  pauseChannel: jest.fn().mockResolvedValue(undefined),
  resumeChannel: jest.fn().mockResolvedValue(undefined),
  setChannelVolume: jest.fn().mockResolvedValue(undefined),
  onAudioStart: jest.fn(() => () => {}),
  onAudioComplete: jest.fn(() => () => {}),
  onAudioProgress: jest.fn(() => () => {}),
  onQueueChange: jest.fn(() => () => {}),
  onAudioPause: jest.fn(() => () => {}),
  onAudioResume: jest.fn(() => () => {})
}));

describe('AudioPlayer', () => {
  test('renders and plays audio', async () => {
    const playlist = ['./audio/track1.mp3', './audio/track2.mp3'];
    const { getByText } = render(<AudioPlayer playlist={playlist} />);
    
    await waitFor(() => {
      expect(getByText('▶️')).toBeInTheDocument();
    });
  });

  test('toggles play/pause', () => {
    const { getByRole } = render(<AudioPlayer playlist={[]} />);
    const playButton = getByRole('button');
    
    fireEvent.click(playButton);
    // Add assertions based on your implementation
  });
});
```


### Media Player & Playlist Manager (React)

```typescript
import React, { useState, useEffect, useCallback } from 'react';
import {
  onQueueChange,
  onAudioStart,
  onAudioComplete,
  onAudioProgress,
  queueAudio,
  pauseChannel,
  resumeChannel,
  removeQueuedItem,
  getCurrentAudioInfo,
  getQueueSnapshot,
  QueueSnapshot,
  AudioInfo,
  AudioStartInfo,
  AudioCompleteInfo
} from 'audio-channel-queue';

interface MediaPlayerProps {
  channelNumber?: number;
}

const MediaPlayerWithPlaylist: React.FC<MediaPlayerProps> = ({ channelNumber = 0 }) => {
  const [queue, setQueue] = useState<QueueSnapshot | null>(null);
  const [currentAudio, setCurrentAudio] = useState<AudioInfo | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(1);

  // Format duration helper
  const formatDuration = useCallback((ms: number): string => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }, []);

  // Set up event listeners
  useEffect(() => {
    const cleanupFunctions: (() => void)[] = [];

    // Queue change listener
    const queueCleanup = onQueueChange(channelNumber, (snapshot: QueueSnapshot) => {
      setQueue(snapshot);
    });
    cleanupFunctions.push(queueCleanup);

    // Audio start listener
    const startCleanup = onAudioStart(channelNumber, (info: AudioStartInfo) => {
      setIsPlaying(true);
      setIsPaused(false);
      setCurrentAudio({
        channelNumber: info.channelNumber,
        currentTime: 0,
        duration: info.duration,
        fileName: info.fileName,
        isLooping: false,
        isPaused: false,
        src: info.src,
        volume: 1
      });
    });
    cleanupFunctions.push(startCleanup);

    // Audio complete listener
    const completeCleanup = onAudioComplete(channelNumber, (info: AudioCompleteInfo) => {
      setIsPlaying(false);
      setIsPaused(false);
      setProgress(0);
      setCurrentAudio(null);
    });
    cleanupFunctions.push(completeCleanup);

    // Audio progress listener
    const progressCleanup = onAudioProgress(channelNumber, (info: AudioInfo) => {
      setCurrentAudio(info);
      setProgress(info.currentTime / info.duration);
      setIsPaused(info.isPaused);
      setIsPlaying(!info.isPaused);
    });
    cleanupFunctions.push(progressCleanup);

    // Initial queue load
    const initialQueue = getQueueSnapshot(channelNumber);
    if (initialQueue) {
      setQueue(initialQueue);
    }

    // Cleanup on unmount
    return () => {
      cleanupFunctions.forEach(cleanup => cleanup());
    };
  }, [channelNumber]);

  // Player controls
  const handlePlayPause = useCallback(async () => {
    if (isPaused) {
      await resumeChannel(channelNumber);
    } else if (isPlaying) {
      await pauseChannel(channelNumber);
    }
  }, [isPaused, isPlaying, channelNumber]);

  const handleAddTrack = useCallback(async (audioUrl: string) => {
    try {
      await queueAudio(audioUrl, channelNumber);
    } catch (error) {
      console.error('Failed to add track:', error);
    }
  }, [channelNumber]);

  const handleRemoveTrack = useCallback(async (index: number) => {
    if (index > 0) { // Can't remove currently playing track
      const result = removeQueuedItem(index, channelNumber);
      if (!result.success) {
        console.error('Failed to remove track:', result.error);
      }
    }
  }, [channelNumber]);

  // Calculate total playlist duration
  const totalDuration = queue?.items.reduce((sum, item) => sum + item.duration, 0) || 0;

  return (
    <div className="media-player-container">
      {/* Player Controls */}
      <div className="player-controls">
        <div className="now-playing">
          {currentAudio ? (
            <div className="track-info">
              <h3>{currentAudio.fileName}</h3>
              <div className="time-info">
                {formatDuration(currentAudio.currentTime)} / {formatDuration(currentAudio.duration)}
              </div>
            </div>
          ) : (
            <div className="no-track">No track playing</div>
          )}
        </div>

        <div className="controls">
          <button 
            className="play-pause-btn"
            onClick={handlePlayPause}
            disabled={!currentAudio}
          >
            {isPaused ? '▶️' : (isPlaying ? '⏸️' : '▶️')}
          </button>
        </div>

        {/* Progress Bar */}
        <div className="progress-container">
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${progress * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Playlist */}
      <div className="playlist-container">
        <div className="playlist-header">
          <h4>Playlist</h4>
          <div className="playlist-stats">
            <span>{queue?.totalItems || 0} tracks</span>
            <span>{formatDuration(totalDuration)}</span>
          </div>
        </div>

        <div className="playlist">
          {queue?.items.length === 0 ? (
            <div className="empty-playlist">No songs in queue</div>
          ) : (
            queue?.items.map((item, index) => (
              <div 
                key={`${item.src}-${index}`}
                className={`playlist-item ${item.isCurrentlyPlaying ? 'playing' : ''}`}
              >
                <div className="track-number">
                  {item.isCurrentlyPlaying ? '▶️' : index + 1}
                </div>
                <div className="track-info">
                  <div className="track-name">{item.fileName}</div>
                  <div className="track-duration">{formatDuration(item.duration)}</div>
                </div>
                {!item.isCurrentlyPlaying && (
                  <button 
                    className="remove-btn"
                    onClick={() => handleRemoveTrack(index)}
                  >
                    ✖️
                  </button>
                )}
              </div>
            ))
          )}
        </div>

        {/* Add Track Input */}
        <div className="add-track">
          <input 
            type="text" 
            placeholder="Enter audio URL"
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleAddTrack(e.currentTarget.value);
                e.currentTarget.value = '';
              }
            }}
          />
          <button onClick={() => {
            const input = document.querySelector('.add-track input') as HTMLInputElement;
            if (input?.value) {
              handleAddTrack(input.value);
              input.value = '';
            }
          }}>
            Add Track
          </button>
        </div>
      </div>
    </div>
  );
};

export default MediaPlayerWithPlaylist;
```

### Media Player & Playlist Manager (Vue 3)

```vue
<template>
  <div class="media-player-container">
    <!-- Player Controls -->
    <div class="player-controls">
      <div class="now-playing">
        <div v-if="currentAudio" class="track-info">
          <h3>{{ currentAudio.fileName }}</h3>
          <div class="time-info">
            {{ formatDuration(currentAudio.currentTime) }} / {{ formatDuration(currentAudio.duration) }}
          </div>
        </div>
        <div v-else class="no-track">No track playing</div>
      </div>

      <div class="controls">
        <button 
          class="play-pause-btn"
          @click="handlePlayPause"
          :disabled="!currentAudio"
        >
          {{ isPaused ? '▶️' : (isPlaying ? '⏸️' : '▶️') }}
        </button>
      </div>

      <!-- Progress Bar -->
      <div class="progress-container">
        <div class="progress-bar">
          <div 
            class="progress-fill" 
            :style="{ width: `${progress * 100}%` }"
          />
        </div>
      </div>
    </div>

    <!-- Playlist -->
    <div class="playlist-container">
      <div class="playlist-header">
        <h4>Playlist</h4>
        <div class="playlist-stats">
          <span>{{ queue?.totalItems || 0 }} tracks</span>
          <span>{{ formatDuration(totalDuration) }}</span>
        </div>
      </div>

      <div class="playlist">
        <div v-if="queue?.items.length === 0" class="empty-playlist">
          No songs in queue
        </div>
        <div 
          v-else
          v-for="(item, index) in queue?.items" 
          :key="`${item.src}-${index}`"
          :class="['playlist-item', { playing: item.isCurrentlyPlaying }]"
        >
          <div class="track-number">
            {{ item.isCurrentlyPlaying ? '▶️' : index + 1 }}
          </div>
          <div class="track-info">
            <div class="track-name">{{ item.fileName }}</div>
            <div class="track-duration">{{ formatDuration(item.duration) }}</div>
          </div>
          <button 
            v-if="!item.isCurrentlyPlaying"
            class="remove-btn"
            @click="handleRemoveTrack(index)"
          >
            ✖️
          </button>
        </div>
      </div>

      <!-- Add Track Input -->
      <div class="add-track">
        <input 
          v-model="newTrackUrl"
          type="text" 
          placeholder="Enter audio URL"
          @keypress.enter="addTrack"
        />
        <button @click="addTrack">Add Track</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import {
  onQueueChange,
  onAudioStart,
  onAudioComplete,
  onAudioProgress,
  queueAudio,
  pauseChannel,
  resumeChannel,
  removeQueuedItem,
  getCurrentAudioInfo,
  getQueueSnapshot,
  type QueueSnapshot,
  type AudioInfo,
  type AudioStartInfo,
  type AudioCompleteInfo
} from 'audio-channel-queue';

interface Props {
  channelNumber?: number;
}

const props = withDefaults(defineProps<Props>(), {
  channelNumber: 0
});

// Reactive state
const queue = ref<QueueSnapshot | null>(null);
const currentAudio = ref<AudioInfo | null>(null);
const isPlaying = ref(false);
const isPaused = ref(false);
const progress = ref(0);
const volume = ref(1);
const newTrackUrl = ref('');

// Cleanup functions
const cleanupFunctions: (() => void)[] = [];

// Computed properties
const totalDuration = computed(() => 
  queue.value?.items.reduce((sum, item) => sum + item.duration, 0) || 0
);

// Helper functions
const formatDuration = (ms: number): string => {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

// Player controls
const handlePlayPause = async () => {
  if (isPaused.value) {
    await resumeChannel(props.channelNumber);
  } else if (isPlaying.value) {
    await pauseChannel(props.channelNumber);
  }
};

const handleRemoveTrack = async (index: number) => {
  if (index > 0) { // Can't remove currently playing track
    const result = removeQueuedItem(index, props.channelNumber);
    if (!result.success) {
      console.error('Failed to remove track:', result.error);
    }
  }
};

const addTrack = async () => {
  if (newTrackUrl.value.trim()) {
    try {
      await queueAudio(newTrackUrl.value, props.channelNumber);
      newTrackUrl.value = '';
    } catch (error) {
      console.error('Failed to add track:', error);
    }
  }
};

// Setup event listeners
onMounted(() => {
  // Queue change listener
  const queueCleanup = onQueueChange(props.channelNumber, (snapshot: QueueSnapshot) => {
    queue.value = snapshot;
  });
  cleanupFunctions.push(queueCleanup);

  // Audio start listener
  const startCleanup = onAudioStart(props.channelNumber, (info: AudioStartInfo) => {
    isPlaying.value = true;
    isPaused.value = false;
    currentAudio.value = {
      channelNumber: info.channelNumber,
      currentTime: 0,
      duration: info.duration,
      fileName: info.fileName,
      isLooping: false,
      isPaused: false,
      src: info.src,
      volume: 1
    };
  });
  cleanupFunctions.push(startCleanup);

  // Audio complete listener
  const completeCleanup = onAudioComplete(props.channelNumber, (info: AudioCompleteInfo) => {
    isPlaying.value = false;
    isPaused.value = false;
    progress.value = 0;
    currentAudio.value = null;
  });
  cleanupFunctions.push(completeCleanup);

  // Audio progress listener
  const progressCleanup = onAudioProgress(props.channelNumber, (info: AudioInfo) => {
    currentAudio.value = info;
    progress.value = info.currentTime / info.duration;
    isPaused.value = info.isPaused;
    isPlaying.value = !info.isPaused;
  });
  cleanupFunctions.push(progressCleanup);

  // Initial queue load
  const initialQueue = getQueueSnapshot(props.channelNumber);
  if (initialQueue) {
    queue.value = initialQueue;
  }
});

// Cleanup on unmount
onUnmounted(() => {
  cleanupFunctions.forEach(cleanup => cleanup());
});
</script>

<style scoped>
.media-player-container {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
  background: #f5f5f5;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.player-controls {
  background: white;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.now-playing {
  margin-bottom: 15px;
}

.track-info h3 {
  margin: 0 0 5px 0;
  font-size: 1.1em;
  color: #333;
}

.time-info {
  color: #666;
  font-size: 0.9em;
}

.no-track {
  color: #999;
  font-style: italic;
}

.controls {
  display: flex;
  justify-content: center;
  margin-bottom: 15px;
}

.play-pause-btn {
  background: #007bff;
  color: white;
  border: none;
  border-radius: 50%;
  width: 50px;
  height: 50px;
  font-size: 1.2em;
  cursor: pointer;
  transition: background-color 0.2s;
}

.play-pause-btn:hover:not(:disabled) {
  background: #0056b3;
}

.play-pause-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.progress-container {
  width: 100%;
}

.progress-bar {
  width: 100%;
  height: 6px;
  background: #e0e0e0;
  border-radius: 3px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: #007bff;
  transition: width 0.1s ease;
}

.playlist-container {
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.playlist-header {
  padding: 15px 20px;
  background: #f8f9fa;
  border-bottom: 1px solid #e9ecef;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.playlist-header h4 {
  margin: 0;
  color: #333;
}

.playlist-stats {
  display: flex;
  gap: 15px;
  color: #666;
  font-size: 0.9em;
}

.playlist {
  max-height: 400px;
  overflow-y: auto;
}

.empty-playlist {
  padding: 40px;
  text-align: center;
  color: #999;
  font-style: italic;
}

.playlist-item {
  display: flex;
  align-items: center;
  padding: 12px 20px;
  border-bottom: 1px solid #f0f0f0;
  transition: background-color 0.2s;
}

.playlist-item:hover {
  background: #f8f9fa;
}

.playlist-item.playing {
  background: #e3f2fd;
  border-left: 4px solid #007bff;
}

.track-number {
  width: 30px;
  text-align: center;
  font-weight: bold;
  color: #666;
}

.playlist-item.playing .track-number {
  color: #007bff;
}

.track-info {
  flex: 1;
  margin-left: 15px;
}

.track-name {
  font-weight: 500;
  color: #333;
  margin-bottom: 2px;
}

.track-duration {
  color: #666;
  font-size: 0.9em;
}

.remove-btn {
  background: none;
  border: none;
  color: #dc3545;
  cursor: pointer;
  padding: 5px;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.remove-btn:hover {
  background: #f8d7da;
}

.add-track {
  padding: 15px 20px;
  background: #f8f9fa;
  border-top: 1px solid #e9ecef;
  display: flex;
  gap: 10px;
}

.add-track input {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 0.9em;
}

.add-track button {
  background: #28a745;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9em;
  transition: background-color 0.2s;
}

.add-track button:hover {
  background: #218838;
}
</style>
```

This comprehensive React integration guide provides everything you need to build sophisticated audio applications with React and the audio-channel-queue library. The examples show modern React patterns, TypeScript integration, and production-ready component architecture. 

## Related Documentation

- **[Basic Usage](./basic-usage)** - Getting started with the library
- **[Event System](../core-concepts/event-system)** - Understanding audio events
- **[Volume Control](../api-reference/volume-control)** - Volume management
- **[Error Handling](../api-reference/error-handling)** - Robust error handling 