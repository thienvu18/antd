const { readdirSync, readFileSync, statSync } = require('fs')
const { join } = require('path')

const roots = ['packages', 'docs/demos']
const extensions = new Set(['.js', '.jsx', '.ts', '.tsx'])
const forbidden = [
  /antd\/lib\//,
  /__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED/,
  /react-dom\/test-utils/,
  /ReactDOM\.(render|hydrate|unmountComponentAtNode)/,
  /Steps\.Step/,
  /destroyTooltipOnHide/,
  /overlayClassName/,
  /overlayStyle/,
  /destroyInactivePanel/,
  /expandIconPosition/,
  /type=["']ghost["']/,
  /size=["']default["']/,
]

function files(path) {
  return readdirSync(path).flatMap((entry) => {
    const target = join(path, entry)
    if (statSync(target).isDirectory()) {
      if (['dist', 'esm', 'lib', 'node_modules'].includes(entry)) return []
      return files(target)
    }
    return extensions.has(target.slice(target.lastIndexOf('.'))) ? [target] : []
  })
}

const violations = []
for (const root of roots) {
  for (const file of files(root)) {
    const source = readFileSync(file, 'utf8')
    for (const pattern of forbidden) {
      if (pattern.test(source)) violations.push(`${file}: ${pattern}`)
    }
  }
}

if (violations.length) {
  console.error(
    'Deprecated React or Ant Design APIs found:\n' + violations.join('\n')
  )
  process.exitCode = 1
}
