import { createPinia, setActivePinia } from 'pinia'

beforeEach(() => {
  setActivePinia(createPinia())
})

import { login } from '../src/api/login'
import { deleteCache, getCacheSize } from '../src/api/cache'

it('get cache size', async() => {
  await login('shuwashuwa', 'Tsugudaisuki')
  console.log(await getCacheSize())
})

it('clear cache', async() => {
  await login('shuwashuwa', 'Tsugudaisuki')
  await deleteCache(1919810)
  const cacheSize = await getCacheSize()
  expect(cacheSize).toBe(0)
})
