<script setup lang="ts">
  import { isDark, toggleDark } from '~/composables'
</script>

<template>
  <nav class="text-xl mt-6">
    <router-link
      class="icon-btn mx-2"
      to="/"
      title="Home"
    >
      <carbon-campsite />
    </router-link>

    <button
      class="icon-btn mx-2 !outline-none"
      title="toggle_dark"
      @click="toggleDark()"
    >
      <carbon-moon v-if="isDark" />
      <carbon-sun v-else />
    </button>

    <router-link
      class="icon-btn mx-2"
      to="/about"
      title="aBOUT"
    >
      <carbon-dicom-overlay />
    </router-link>

    <a
      class="icon-btn mx-2"
      rel="noreferrer"
      href="https://github.com/antfu/vitesse"
      target="_blank"
      title="GitHub"
    >
      <carbon-logo-github />
    </a>
  </nav>
</template>
