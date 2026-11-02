import { describe, expect, it } from 'vitest'
import { Virtualizer } from '../virtualizer'

describe('Virtualizer', () => {
  it('builds total height and prefix offsets in linear time', () => {
    const virtualizer = new Virtualizer()
    virtualizer.rebuild([10, 20, 30, 40])

    expect(virtualizer.count).toBe(4)
    expect(virtualizer.totalHeight).toBe(100)
    expect([0, 1, 2, 3, 4].map((index) => virtualizer.offsetAt(index))).toEqual([
      0, 10, 30, 60, 100,
    ])
  })

  it('finds the item at an offset, including exact item boundaries', () => {
    const virtualizer = new Virtualizer()
    virtualizer.rebuild([10, 20, 30, 40])

    expect([
      virtualizer.indexAt(-10),
      virtualizer.indexAt(0),
      virtualizer.indexAt(9.9),
      virtualizer.indexAt(10),
      virtualizer.indexAt(59.9),
      virtualizer.indexAt(60),
      virtualizer.indexAt(100),
      virtualizer.indexAt(1_000),
    ]).toEqual([0, 0, 0, 1, 2, 3, 3, 3])
  })

  it('updates one height and keeps all following offsets in sync', () => {
    const virtualizer = new Virtualizer()
    virtualizer.rebuild([10, 20, 30, 40])

    expect(virtualizer.updateHeight(1, 50)).toBe(true)
    expect(virtualizer.totalHeight).toBe(130)
    expect(virtualizer.getHeight(1)).toBe(50)
    expect([0, 1, 2, 3, 4].map((index) => virtualizer.offsetAt(index))).toEqual([
      0, 10, 60, 90, 130,
    ])
    expect(virtualizer.indexAt(59)).toBe(1)
    expect(virtualizer.indexAt(60)).toBe(2)
  })

  it('ignores subpixel changes and invalid update indexes', () => {
    const virtualizer = new Virtualizer()
    virtualizer.rebuild([10, 20])

    expect(virtualizer.updateHeight(0, 10.49)).toBe(false)
    expect(virtualizer.updateHeight(-1, 50)).toBe(false)
    expect(virtualizer.updateHeight(2, 50)).toBe(false)
    expect(virtualizer.updateHeight(1.5, 50)).toBe(false)
    expect(virtualizer.totalHeight).toBe(30)
  })

  it('normalizes invalid heights to one pixel', () => {
    const virtualizer = new Virtualizer()
    virtualizer.rebuild([0, -1, Number.NaN, Number.POSITIVE_INFINITY, 12])

    expect(virtualizer.totalHeight).toBe(16)
    expect([0, 1, 2, 3].map((index) => virtualizer.getHeight(index))).toEqual([1, 1, 1, 1])
  })

  it('handles empty lists and out-of-range offset queries', () => {
    const virtualizer = new Virtualizer()

    expect(virtualizer.count).toBe(0)
    expect(virtualizer.totalHeight).toBe(0)
    expect(virtualizer.indexAt(100)).toBe(0)
    expect(virtualizer.offsetAt(100)).toBe(0)
    expect(virtualizer.getHeight(0)).toBe(0)
  })

  it('matches naive prefix sums across many dynamic updates', () => {
    const heights = Array.from({ length: 1_000 }, (_, index) => ((index * 37) % 17) + 1)
    const virtualizer = new Virtualizer()
    virtualizer.rebuild(heights)

    for (let index = 0; index < heights.length; index += 7) {
      const nextHeight = ((index * 13) % 41) + 1
      heights[index] = nextHeight
      virtualizer.updateHeight(index, nextHeight)
    }

    let expectedOffset = 0
    for (let index = 0; index < heights.length; index += 1) {
      expect(virtualizer.offsetAt(index)).toBeCloseTo(expectedOffset)
      expectedOffset += heights[index] ?? 0
    }
    expect(virtualizer.totalHeight).toBeCloseTo(expectedOffset)
  })
})
