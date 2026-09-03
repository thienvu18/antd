import prettyFormat from 'pretty-format'

global['prettyFormat'] = prettyFormat

global['sleep'] = (time) => {
  return new Promise((resolve) => setTimeout(resolve, time))
}

global['requestAnimationFrame'] = (fn) => setTimeout(fn)
globalThis.IS_REACT_ACT_ENVIRONMENT = true

global.document.documentElement.style['grid-column-gap'] = true

// Turn React and Ant Design runtime diagnostics into test failures. Keeping the
// original arguments makes a regression actionable instead of silently hiding it.
;(() => {
  const fail = (...messages: unknown[]) => {
    throw new Error(messages.map(String).join(' '))
  }
  const errorSpy = jest.spyOn(console, 'error')
  const warnSpy = jest.spyOn(console, 'warn')
  const previousReportError = globalThis.reportError

  beforeAll(() => {
    errorSpy.mockImplementation(fail)
    warnSpy.mockImplementation(fail)
    globalThis.reportError = fail
  })

  afterAll(() => {
    errorSpy.mockRestore()
    warnSpy.mockRestore()
    globalThis.reportError = previousReportError
  })
})()
