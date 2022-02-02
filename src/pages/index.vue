<script setup lang="ts">
</script>

<template>
  <div>
    <p class="text-4xl">
      <carbon-campsite class="inline-block" />
    </p>
    <p>
      <a
        rel="noreferrer"
        href="https://github.com/antfu/vitesse"
        target="_blank"
      >
        Vitesse
      </a>
    </p>
    <p>
      <em class="text-sm opacity-75">{{ 'intro.desc' }}</em>
    </p>

    <div class="py-4" />

    <input
      id="input"
      v-model="name"
      placeholder="t('intro.whats-your-name')"
      aria-label="t('intro.whats-your-name')"
      type="text"
      autocomplete="false"
      p="x-4 y-2"
      w="250px"
      text="center"
      bg="transparent"
      border="~ rounded gray-200 dark:gray-700"
      outline="none active:none"
    >
    <label
      class="hidden"
      for="input"
    >{{ 'intro.whats-your-name' }}</label>

    <div>
      <button
        class="m-3 text-sm btn"
      >
        {{ 'button.go' }}
      </button>
    </div>
  </div>
</template>

<route lang="yaml">
meta:
  layout: home
</route>
