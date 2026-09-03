import { act } from 'react'
import { createPortalRoot } from '../__builtins__/portal'
import { render, unmount } from '../__builtins__/render'

describe('React 19 portal root', () => {
  it('renders, reuses, and unmounts a modern React root', async () => {
    const container = document.createElement('div')

    await act(async () => {
      render(<span>first</span>, container)
    })
    expect(container.textContent).toBe('first')

    await act(async () => {
      render(<span>second</span>, container)
    })
    expect(container.textContent).toBe('second')

    await act(async () => {
      await unmount(container)
    })
    expect(container.textContent).toBe('')

    await expect(unmount(container)).resolves.toBeUndefined()
  })

  it('removes a detached portal host after the React root is unmounted', async () => {
    const host = document.createElement('div')
    document.body.appendChild(host)
    const portal = createPortalRoot(host, 'render-spec-portal')

    await act(async () => {
      portal.render(() => <span>portal</span>)
    })
    expect(host.textContent).toBe('portal')

    await act(async () => {
      await portal.unmount()
    })
    expect(host.isConnected).toBe(false)

    await expect(portal.unmount()).resolves.toBeUndefined()
  })
})
