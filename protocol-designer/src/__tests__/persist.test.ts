import * as persist from '../persist'

describe('persist', () => {
  let getItemSpy: jest.SpyInstance<any, unknown[]>
  let setItemSpy: jest.SpyInstance<any, unknown[]>

  beforeEach(() => {
    const LocalStorageProto = Object.getPrototypeOf(global.localStorage)
    getItemSpy = jest.spyOn(LocalStorageProto, 'getItem')
    setItemSpy = jest.spyOn(LocalStorageProto, 'setItem')
  })

  afterEach(() => {
    jest.restoreAllMocks()
    localStorage.clear()
  })

  describe('getLocalStorageItem', () => {
    it('retrieves localStorage data by key and parses data when it exists', () => {
      const value = { test: 'some value' }

      localStorage.setItem('root.key', JSON.stringify(value))

      const result = persist.getLocalStorageItem('key')

      expect(result).toEqual(value)
    })

    it('returns undefined when localStorage key does not exist', () => {
      const result = persist.getLocalStorageItem('not-a-key')

      expect(result).toBeUndefined()
    })

    it('returns undefined when localStorage access throws', () => {
      getItemSpy.mockImplementationOnce(() => {
        throw new Error('something went wrong!')
      })

      const result = persist.getLocalStorageItem('key')

      expect(result).toBeUndefined()
    })
  })

  describe('setLocalStorageItem', () => {
    it('adds prefix to key sets localStorage item by key', () => {
      const value = { a: 'a', b: 'b' }

      persist.setLocalStorageItem('key', value)
      expect(localStorage.getItem('root.key')).toBe(JSON.stringify(value))
    })

    it('catches errors from setItem', () => {
      setItemSpy.mockImplementationOnce(() => {
        throw new Error('something went wrong!')
      })

      expect(() => {
        persist.setLocalStorageItem('key', { value: true })
      }).not.toThrow()
    })
  })
})
