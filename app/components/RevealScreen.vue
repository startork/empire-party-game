<script setup lang="ts">
defineProps<{
  names: string[]
}>()

defineEmits<{
  restart: []
}>()
</script>

<template>
  <section class="screen">
    <div class="screen-body">
      <h1>The names</h1>
      <ol class="name-list">
        <li v-for="name in names" :key="name">
          {{ name }}
        </li>
      </ol>
    </div>
    <div class="screen-actions">
      <button type="button" class="button" @click="$emit('restart')">
        Start a new game
      </button>
    </div>
  </section>
</template>
