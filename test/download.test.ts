import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { downloadBlob } from '../src/download'

describe('downloadBlob', () => {
	beforeEach(() => {
		vi.useFakeTimers()
		// happy-dom lacks createObjectURL/revokeObjectURL — stub them.
		URL.createObjectURL = vi.fn(() => 'blob:mock-url')
		URL.revokeObjectURL = vi.fn()
	})

	afterEach(() => {
		vi.useRealTimers()
		vi.restoreAllMocks()
		document.body.innerHTML = ''
	})

	it('creates an anchor with the object URL and filename, clicks and removes it', () => {
		const blob = new Blob(['data'], { type: 'text/plain' })
		const clickSpy = vi.fn()
		const realCreate = document.createElement.bind(document)
		let created: HTMLAnchorElement | undefined
		vi.spyOn(document, 'createElement').mockImplementation((tag: string) => {
			const el = realCreate(tag)
			if (tag === 'a') {
				created = el as HTMLAnchorElement
				el.click = clickSpy
			}
			return el
		})

		downloadBlob(blob, 'report.txt')

		expect(URL.createObjectURL).toHaveBeenCalledWith(blob)
		expect(created).toBeDefined()
		expect(created?.href).toBe('blob:mock-url')
		expect(created?.download).toBe('report.txt')
		expect(created?.rel).toBe('noopener')
		expect(clickSpy).toHaveBeenCalledOnce()
		// Anchor is removed from the DOM after clicking.
		expect(document.querySelector('a')).toBeNull()
	})

	it('revokes the object URL on the next tick', () => {
		downloadBlob(new Blob(['x']), 'x.bin')
		expect(URL.revokeObjectURL).not.toHaveBeenCalled()
		vi.runAllTimers()
		expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:mock-url')
	})
})
