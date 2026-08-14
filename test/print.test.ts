import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { printToPdf } from '../src/print'

describe('printToPdf', () => {
	beforeEach(() => {
		vi.useFakeTimers()
		window.print = vi.fn()
	})

	afterEach(() => {
		vi.useRealTimers()
		vi.restoreAllMocks()
		document.head.innerHTML = ''
		document.body.innerHTML = ''
	})

	it('calls window.print directly with no node and injects no style', () => {
		printToPdf()
		expect(window.print).toHaveBeenCalledOnce()
		expect(document.querySelector('[data-oz-print-style]')).toBeNull()
	})

	it('marks the target node, injects a print stylesheet, and prints', () => {
		const node = document.createElement('section')
		document.body.appendChild(node)

		printToPdf(node)

		expect(node.getAttribute('data-oz-print')).toBe('target')
		const style = document.querySelector('[data-oz-print-style]')
		expect(style).not.toBeNull()
		expect(style?.textContent).toContain('@media print')
		expect(style?.textContent).toContain('[data-oz-print="target"]')
		expect(window.print).toHaveBeenCalledOnce()
	})

	it('cleans up when afterprint fires', () => {
		const node = document.createElement('section')
		document.body.appendChild(node)
		printToPdf(node)

		window.dispatchEvent(new Event('afterprint'))

		expect(document.querySelector('[data-oz-print-style]')).toBeNull()
		expect(node.hasAttribute('data-oz-print')).toBe(false)
	})

	it('cleans up via the setTimeout fallback if afterprint never fires', () => {
		const node = document.createElement('section')
		document.body.appendChild(node)
		printToPdf(node)

		expect(document.querySelector('[data-oz-print-style]')).not.toBeNull()
		vi.runAllTimers()

		expect(document.querySelector('[data-oz-print-style]')).toBeNull()
		expect(node.hasAttribute('data-oz-print')).toBe(false)
	})
})
