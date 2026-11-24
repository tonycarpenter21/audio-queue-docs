/**
 * Checks the docs:
 *   1. every ```ts example type-checks against audioq's real types (```ts signature blocks, which
 *      show a function's shape, and blocks after <!-- skip-check --> are skipped);
 *   2. every page in docs/ is listed in sidebars.ts.
 *
 * audioq's types come from node_modules/audioq, or from a local checkout:
 *   AUDIOQ_DIR=../audioq npm run check      (run `npm run build` there first)
 */
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const docsDir = join(root, 'docs');

const markdownFiles = (dir) =>
  readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return markdownFiles(path);
    return /\.mdx?$/.test(name) ? [path] : [];
  });

/** Where audioq's type declarations are. */
const audioqTypes = () => {
  const candidates = process.env.AUDIOQ_DIR
    ? [join(resolve(process.env.AUDIOQ_DIR), 'dist', 'types', 'index.d.ts')]
    : [join(root, 'node_modules', 'audioq', 'dist', 'types', 'index.d.ts')];
  const found = candidates.find((path) => existsSync(path));
  if (!found) {
    console.error(
      `audioq types not found (${candidates.join(', ')}).\n` +
        'Install audioq, or point AUDIOQ_DIR at a built checkout: AUDIOQ_DIR=../audioq npm run check'
    );
    process.exit(2);
  }
  return found;
};

/** ```ts blocks with the line they start on. */
const codeBlocks = (text) => {
  const lines = text.split('\n');
  const blocks = [];
  for (let i = 0; i < lines.length; i++) {
    const open = lines[i].match(/^```(ts|typescript)(\s.*)?$/);
    if (!open) continue;
    const skip = /<!--\s*skip-check\s*-->/.test(lines[i - 1] ?? '') || /<!--\s*skip-check\s*-->/.test(lines[i - 2] ?? '');
    const isSignature = /\bsignature\b/.test(open[2] ?? '');
    const start = i + 1;
    let end = start;
    while (end < lines.length && !lines[end].startsWith('```')) end++;
    if (!skip && !isSignature) blocks.push({ code: lines.slice(start, end), line: start + 1 });
    i = end;
  }
  return blocks;
};

const compilerOptions = (typesPath) => ({
  lib: ['lib.es2020.d.ts', 'lib.dom.d.ts'],
  module: ts.ModuleKind.ESNext,
  moduleResolution: ts.ModuleResolutionKind.Bundler,
  noEmit: true,
  paths: { audioq: [typesPath], 'audioq/queue': [join(dirname(typesPath), 'queue.d.ts')] },
  skipLibCheck: true,
  strict: true,
  target: ts.ScriptTarget.ES2020,
  types: []
});

/** Compiles in-memory files with the given options. */
const compile = (files, options) => {
  const host = ts.createCompilerHost(options);
  const getSourceFile = host.getSourceFile.bind(host);
  host.getSourceFile = (name, version, ...rest) =>
    files.has(name) ? ts.createSourceFile(name, files.get(name), version, true) : getSourceFile(name, version, ...rest);
  const fileExists = host.fileExists.bind(host);
  host.fileExists = (name) => files.has(name) || fileExists(name);
  return ts.createProgram([...files.keys()], options, host);
};

/** Every name audioq exports (values and types), so examples can use them without imports. */
const exportedNames = (options) => {
  const probe = join(root, '.check', 'probe.ts');
  const program = compile(new Map([[probe, "import * as audioq from 'audioq';\nexport { audioq };"]]), options);
  const checker = program.getTypeChecker();
  const declaration = program.getSourceFile(probe).statements[0].importClause.namedBindings;
  const moduleSymbol = checker.getAliasedSymbol(checker.getSymbolAtLocation(declaration.name));
  return checker.getExportsOfModule(moduleSymbol).map((symbol) => symbol.getName());
};

const checkExamples = () => {
  const options = compilerOptions(audioqTypes());
  const names = exportedNames(options);
  const files = new Map();
  const origins = new Map();
  for (const page of markdownFiles(docsDir)) {
    codeBlocks(readFileSync(page, 'utf8')).forEach((block, index) => {
      const imports = block.code.filter((line) => /^import\s/.test(line) && !/from 'audioq'/.test(line));
      const body = block.code.filter((line) => !/^import\s/.test(line));
      // Names the example imports itself (from 'audioq/queue', say) are left out of 'audioq'.
      const ownImports = new Set(
        imports.flatMap((line) => (/\{([^}]*)\}/.exec(line)?.[1] ?? '').split(',')).map((n) => n.trim())
      );
      const header = [
        `import { ${names.filter((name) => !ownImports.has(name)).join(', ')} } from 'audioq';`,
        ...imports,
        'declare const button: HTMLButtonElement;',
        'export async function example(): Promise<void> {'
      ];
      const name = join(root, '.check', `${relative(docsDir, page)}-${index}.ts`);
      files.set(name, [...header, ...body, '}'].join('\n'));
      origins.set(name, { headerLines: header.length, line: block.line, page: relative(root, page) });
    });
  }
  const program = compile(files, options);
  const problems = [];
  for (const [name, origin] of origins) {
    for (const diagnostic of ts.getPreEmitDiagnostics(program, program.getSourceFile(name))) {
      const { line } = diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start ?? 0);
      problems.push(
        `${origin.page}:${origin.line + line - origin.headerLines} ${ts.flattenDiagnosticMessageText(diagnostic.messageText, ' ')}`
      );
    }
  }
  return { count: files.size, problems };
};

const checkSidebar = () => {
  const sidebar = readFileSync(join(root, 'sidebars.ts'), 'utf8')
    .split('\n')
    .filter((line) => !/^\s*\/\//.test(line))
    .join('\n');
  const problems = [];
  for (const page of markdownFiles(docsDir)) {
    const text = readFileSync(page, 'utf8');
    const id = text.match(/^---[\s\S]*?\nid:\s*(\S+)[\s\S]*?\n---/)?.[1];
    const docId = relative(docsDir, page).replace(/\.mdx?$/, '').split('\\').join('/');
    const fullId = id ? docId.replace(/[^/]+$/, id) : docId;
    if (!sidebar.includes(`'${fullId}'`)) problems.push(`docs/${relative(docsDir, page)} is not listed in sidebars.ts`);
  }
  return problems;
};

/** Compiler options tsconfig.json must keep (npm run typecheck covers the site's own code). */
const checkStrictness = () => {
  const text = readFileSync(join(root, 'tsconfig.json'), 'utf8').replace(/^\s*\/\/.*$/gm, '');
  const options = JSON.parse(text).compilerOptions ?? {};
  const on = ['strict', 'noUncheckedIndexedAccess', 'exactOptionalPropertyTypes', 'noImplicitReturns', 'noPropertyAccessFromIndexSignature', 'noUnusedLocals', 'noUnusedParameters'];
  const off = ['allowUnreachableCode', 'allowUnusedLabels'];
  return [
    ...on.filter((flag) => options[flag] !== true).map((flag) => `tsconfig.json: "${flag}" must be true`),
    ...off.filter((flag) => options[flag] !== false).map((flag) => `tsconfig.json: "${flag}" must be false`)
  ];
};

const examples = checkExamples();
const sidebarProblems = checkSidebar();
const problems = [...examples.problems, ...sidebarProblems, ...checkStrictness()];
problems.forEach((problem) => console.log(problem));
console.log(
  `${examples.count} examples type-checked, ${markdownFiles(docsDir).length} pages checked against the sidebar: ` +
    `${problems.length} problem(s)`
);
process.exit(problems.length === 0 ? 0 : 1);
