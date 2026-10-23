<script setup lang="ts">
defineProps<{
  names: string[]
}>()

const emit = defineEmits<{
  restart: []
}>()

const confirming = ref(false)
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
      <template v-if="confirming">
        <p class="lede">
          Start a new game? This clears every name.
        </p>
        <button type="button" class="button" @click="emit('restart')">
          Start over
        </button>
        <button type="button" class="button secondary" @click="confirming = false">
          Keep this list
        </button>
      </template>
      <button v-else type="button" class="button" @click="confirming = true">
        Start a new game
      </button>
    </div>
  </section>
</template>
