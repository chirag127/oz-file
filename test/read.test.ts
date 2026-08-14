import { describe, expect, it } from 'vitest'
import {
	readAsArrayBuffer,
	readAsDataURL,
	readAsText,
} from '../src/read'

describe('read helpers', () => {
	it('readAsText decodes a Blob to a UTF-8 string', async () => {
		const blob = new Blob(['hello world'], { type: 'text/plain' })
		await expect(readAsText(blob)).resolves.toBe('hello world')
	})

	it('readAsText reads a File the same way', async () => {
		const file = new File(['line1\nline2'], 'x.txt', { type: 'text/plain' })
		await expect(readAsText(file)).resolves.toBe('line1\nline2')
	})

	it('readAsArrayBuffer returns the exact bytes', async () => {
		const bytes = new Uint8Array([1, 2, 3, 255])
		const blob = new Blob([bytes])
		const buf = await readAsArrayBuffer(blob)
		expect(buf).toBeInstanceOf(ArrayBuffer)
		expect(Array.from(new Uint8Array(buf))).toEqual([1, 2, 3, 255])
	})

	it('readAsArrayBuffer of an empty blob yields a zero-length buffer', async () => {
		const buf = await readAsArrayBuffer(new Blob([]))
		expect(buf.byteLength).toBe(0)
	})

	it('readAsDataURL produces a base64 data URL', async () => {
		const blob = new Blob(['hi'], { type: 'text/plain' })
		const url = await readAsDataURL(blob)
		expect(url).toMatch(/^data:text\/plain(;.*)?;base64,/)
		// "hi" base64-encodes to "aGk="
		expect(url.endsWith('aGk=')).toBe(true)
	})
})
