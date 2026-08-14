import { afterEach, describe, expect, it, vi } from 'vitest'
import { onDropZone } from '../src/dropzone'

function dragEvent(type: string, files: File[] = []): DragEvent {
	const e = new Event(type, { bubbles: true, cancelable: true }) as DragEvent
	const dt = new DataTransfer()
	for (const f of files) dt.items.add(f)
	Object.defineProperty(e, 'dataTransfer', { value: dt, configurable: true })
	return e
}

describe('onDropZone', () => {
	let el: HTMLElement
	afterEach(() => {
		el?.remove()
	})

	function setup() {
		el = document.createElement('div')
		document.body.appendChild(el)
		return el
	}

	it('adds the drag class on dragenter/dragover and removes it on dragleave', () => {
		const el = setup()
		onDropZone(el, () => {})

		el.dispatchEvent(dragEvent('dragenter'))
		expect(el.classList.contains('oz-dragover')).toBe(true)

		el.dispatchEvent(dragEvent('dragleave'))
		expect(el.classList.contains('oz-dragover')).toBe(false)

		el.dispatchEvent(dragEvent('dragover'))
		expect(el.classList.contains('oz-dragover')).toBe(true)
	})

	it('supports a custom drag class', () => {
		const el = setup()
		onDropZone(el, () => {}, { dragClass: 'is-over' })
		el.dispatchEvent(dragEvent('dragenter'))
		expect(el.classList.contains('is-over')).toBe(true)
		expect(el.classList.contains('oz-dragover')).toBe(false)
	})

	it('calls back with dropped files and clears the drag class', () => {
		const el = setup()
		const cb = vi.fn()
		onDropZone(el, cb)
		el.dispatchEvent(dragEvent('dragenter'))

		const files = [new File(['a'], 'a.txt'), new File(['b'], 'b.txt')]
		el.dispatchEvent(dragEvent('drop', files))

		expect(cb).toHaveBeenCalledOnce()
		const passed = cb.mock.calls[0][0] as File[]
		expect(passed.map((f) => f.name)).toEqual(['a.txt', 'b.txt'])
		expect(el.classList.contains('oz-dragover')).toBe(false)
	})

	it('does not fire the callback for an empty drop', () => {
		const el = setup()
		const cb = vi.fn()
		onDropZone(el, cb)
		el.dispatchEvent(dragEvent('drop', []))
		expect(cb).not.toHaveBeenCalled()
	})

	it('prevents default on drop so the browser does not navigate', () => {
		const el = setup()
		onDropZone(el, () => {})
		const e = dragEvent('drop', [new File(['x'], 'x.txt')])
		el.dispatchEvent(e)
		expect(e.defaultPrevented).toBe(true)
	})

	it('teardown removes listeners and clears the class', () => {
		const el = setup()
		const cb = vi.fn()
		const teardown = onDropZone(el, cb)
		el.dispatchEvent(dragEvent('dragenter'))
		expect(el.classList.contains('oz-dragover')).toBe(true)

		teardown()
		expect(el.classList.contains('oz-dragover')).toBe(false)

		// After teardown, events are ignored.
		el.dispatchEvent(dragEvent('drop', [new File(['x'], 'x.txt')]))
		el.dispatchEvent(dragEvent('dragenter'))
		expect(cb).not.toHaveBeenCalled()
		expect(el.classList.contains('oz-dragover')).toBe(false)
	})
})
