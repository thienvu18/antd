const { execFileSync } = require('child_process')
const {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
} = require('fs')
const { join } = require('path')
const { tmpdir } = require('os')

const packages = [
  '@thienvu18/formily-antd-v6',
  '@thienvu18/formily-antd-v6-prototypes',
  '@thienvu18/formily-antd-v6-renderer',
  '@thienvu18/formily-antd-v6-setters',
  '@thienvu18/formily-antd-v6-settings-form',
]
const packageImports = packages.map((name, index) => ({
  name,
  identifier: `package${index}`,
}))

const root = process.cwd()
const workDir = mkdtempSync(join(tmpdir(), 'formily-antd-v6-pack-'))
const packDir = join(workDir, 'packs')
const consumerDir = join(workDir, 'consumer')
mkdirSync(packDir)
mkdirSync(consumerDir)

function run(command, args, cwd = root) {
  execFileSync(command, args, {
    cwd,
    env: npmEnvironment(),
    stdio: 'inherit',
  })
}

function npmEnvironment() {
  const environment = Object.fromEntries(
    Object.entries(process.env).filter(
      ([key]) => !key.toLowerCase().startsWith('npm_config_')
    )
  )
  return {
    ...environment,
    npm_config_cache: join(workDir, 'npm-cache'),
    npm_config_audit: 'false',
    npm_config_fund: 'false',
  }
}

try {
  const tarballs = packages.map((name) => {
    const existingFiles = new Set(readdirSync(packDir))
    const output = execFileSync(
      'npm',
      ['pack', '--json', '--pack-destination', packDir, '--workspace', name],
      {
        cwd: root,
        env: npmEnvironment(),
      }
    )
    const packed = JSON.parse(output.toString())[0]
    const required = [
      'package.json',
      'lib/index.js',
      'lib/index.d.ts',
      'esm/index.js',
      'esm/index.d.ts',
    ]
    const paths = new Set(packed.files.map((file) => file.path))
    const missing = required.filter((file) => !paths.has(file))
    if (missing.length) {
      throw new Error(`${name} pack is missing ${missing.join(', ')}`)
    }
    const tarball = readdirSync(packDir).find(
      (file) => !existingFiles.has(file) && file.endsWith('.tgz')
    )
    if (!tarball) {
      throw new Error(`${name} pack did not create a tarball`)
    }
    return join(packDir, tarball)
  })

  writeFileSync(
    join(consumerDir, 'package.json'),
    JSON.stringify(
      {
        private: true,
        type: 'commonjs',
        dependencies: {
          '@ant-design/icons': '^6.3.4',
          '@types/react': '^19.2.14',
          '@types/react-dom': '^19.2.3',
          antd: '^6.6.2',
          'happy-dom': '^20.0.0',
          react: '^19.2.8',
          'react-dom': '^19.2.8',
          'react-is': '^19.2.8',
          typescript: '5.2.2',
          vite: '^8.2.2',
        },
      },
      null,
      2
    )
  )
  writeFileSync(
    join(consumerDir, 'tsconfig.json'),
    JSON.stringify(
      {
        compilerOptions: {
          jsx: 'react-jsx',
          module: 'commonjs',
          moduleResolution: 'node',
          esModuleInterop: true,
          noEmit: true,
          strict: true,
          skipLibCheck: true,
        },
      },
      null,
      2
    )
  )
  writeFileSync(
    join(consumerDir, 'index.tsx'),
    [
      "import { Input } from '@thienvu18/formily-antd-v6'",
      "import React from 'react'",
      'export const Consumer = () => <Input placeholder="React 19 consumer" />',
      '',
    ].join('\n')
  )
  writeFileSync(
    join(consumerDir, 'render.cjs'),
    [
      "const { Window } = require('happy-dom')",
      "const React = require('react')",
      "const { createRoot } = require('react-dom/client')",
      "const { flushSync } = require('react-dom')",
      "const { ConfigProvider } = require('antd')",
      "const { Input } = require('@thienvu18/formily-antd-v6')",
      ...packages.map((name) => `if (require('${name}') === undefined) throw new Error('packed ${name} did not resolve as CommonJS')`),
      'const window = new Window()',
      'global.window = window',
      'global.document = window.document',
      'global.navigator = window.navigator',
      'global.HTMLElement = window.HTMLElement',
      'global.Element = window.Element',
      'global.getComputedStyle = window.getComputedStyle',
      'global.ResizeObserver = class { observe() {} disconnect() {} }',
      "const host = document.body.appendChild(document.createElement('div'))",
      'const root = createRoot(host)',
      "flushSync(() => root.render(React.createElement(ConfigProvider, null, React.createElement(Input, { placeholder: 'packed consumer' }))))",
      "if (!host.querySelector('input')) throw new Error('packed adapter did not render')",
      'root.unmount()',
      "if (host.textContent) throw new Error('packed adapter did not unmount')",
      '',
    ].join('\n')
  )
  writeFileSync(
    join(consumerDir, 'index.html'),
    '<div id="root"></div><script type="module" src="/vite-entry.tsx"></script>\n'
  )
  writeFileSync(
    join(consumerDir, 'vite-entry.tsx'),
    [
      ...packageImports.map(({ name, identifier }) => `import * as ${identifier} from '${name}'`),
      "import { Input } from '@thienvu18/formily-antd-v6'",
      "import { createRoot } from 'react-dom/client'",
      "import { createElement } from 'react'",
      `if ([${packageImports.map(({ identifier }) => identifier).join(', ')}].some((module) => module === undefined)) throw new Error('packed package did not resolve as ESM')`,
      "createRoot(document.getElementById('root')!).render(createElement(Input))",
      '',
    ].join('\n')
  )

  run(
    'npm',
    ['install', '--ignore-scripts', '--no-package-lock', ...tarballs],
    consumerDir
  )
  run(
    join(consumerDir, 'node_modules/.bin/tsc'),
    ['--project', 'tsconfig.json'],
    consumerDir
  )
  run(join(consumerDir, 'node_modules/.bin/vite'), ['build'], consumerDir)
  run(process.execPath, ['render.cjs'], consumerDir)
} finally {
  if (existsSync(workDir)) rmSync(workDir, { recursive: true, force: true })
}
