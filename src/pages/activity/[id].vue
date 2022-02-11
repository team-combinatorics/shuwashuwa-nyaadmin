<script setup lang="ts">
const props = defineProps <{id: number}>();
</script>

<template>
    <pre>Activity {{props.id}} </pre>
</template>