<script setup lang="ts">
const router = useRouter()
// set title to 404
useHead({
  title: '404 | 修哇修哇'
})
</script>

<template>
  <main class="px-4 py-10 text-center text-teal-700 dark:text-gray-200">
    <div>
      <p class="text-4xl">
        <carbon-query class="inline-block" />
        <p> 404 </p>
      </p>
    </div>
    <router-view />
    <div>
      <button
        class="btn m-3 text-sm mt-8 p-2 bg-gray-100 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-500"
        @click="router.push('/')"
      >
        {{ '返回首页' }}
      </button>
    </div>
  </main>
</template>

<route lang="yaml">
meta:
    layout: login
</route>