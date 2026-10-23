<script setup lang="ts">
defineEmits<{
  finish: []
}>()
</script>

<template>
  <section class="screen">
    <div class="screen-body">
      <h1>The game is on</h1>
      <p class="lede">
        When you are ready, finish and see every name.
      </p>
    </div>
    <div class="screen-actions">
      <button type="button" class="button" @click="$emit('finish')">
        Finish
      </button>
    </div>
  </section>
</template>
