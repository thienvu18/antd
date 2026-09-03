import { calcFactor } from '../form-layout/useResponsiveFormLayout'

describe('calcFactor', () => {
  it('uses the first responsive value at breakpoint index zero', () => {
    expect(calcFactor(['first', 'second', 'third'], 0)).toBe('first')
  })

  it('uses the final responsive value when no breakpoint matches', () => {
    expect(calcFactor(['first', 'second', 'third'])).toBe('third')
  })
})
