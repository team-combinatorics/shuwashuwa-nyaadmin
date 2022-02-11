<script setup lang="ts">
const props = defineProps <{id: number}>();
</script>

<template>
    <pre>Service {{props.id}} </pre>
</template>