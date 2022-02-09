<script setup lang="ts">
import { NModal } from 'naive-ui';

const props = defineProps({
    show: {
        type: Boolean,
        default: true,
    },
})

const emit = defineEmits(['update:show']);
const showVal = ref(props.show);
const handleUpdate = () => emit('update:show', showVal.value);
</script>

<template>
  <!-- not the best way to do it but whatever -->
  <n-modal
    class="about-card"
    preset="card"
    :show="props.show"
    :on-update:show="handleUpdate"
    :bordered="false"
    title="shuwashuwa-nyaadmin"
    :closable="false"
    :auto-focus="false"
  >
    <template #cover>
      <img src="/shuwashuwa-square.webp" class="about-icon">
    </template>
      git-058eb95 &nbsp; 2022-02-09
    <template #footer> 
      @12f23eddde &nbsp;
      <a href="https://github.com/12f23eddde/shuwashuwa-nyaadmin">
        🔗GitHub
      </a>
    </template>
  </n-modal>
</template>

<style> /* overriding styles */
  .about-card {
    width: min(300px, 60%);
    text-align: center;
  }

  .about-icon {
    padding: 10%;
    height: auto;
  }
</style>