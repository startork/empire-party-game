<script setup lang="ts">
import { MIN_PLAYERS, MAX_PLAYERS } from '~/composables/useGameSession'

const count = defineModel<number>('count', { required: true })

defineEmits<{
  start: []
}>()
</script>

<template>
  <section class="screen">
    <div class="screen-body">
      <p class="eyebrow">Empire</p>
      <h1>How to play</h1>
      <ol class="instructions">
        <li>Pass this phone around. Each person secretly enters one real famous person, living or dead.</li>
        <li>The phone then reads every name aloud, twice, each time in a random order. Listen carefully. The names stay hidden.</li>
        <li>Play the game. When you are finished, reveal the list.</li>
      </ol>

      <p class="label">Category</p>
      <div class="choice">
        <span class="choice-title">Famous people</span>
        <span class="choice-note">Real people only, living or dead.</span>
      </div>

      <p id="player-count-label" class="label">How many people</p>
      <CountStepper
        v-model="count"
        :min="MIN_PLAYERS"
        :max="MAX_PLAYERS"
        label="people"
        aria-labelledby="player-count-label"
      />
    </div>
    <div class="screen-actions">
      <button type="button" class="button" @click="$emit('start')">
        Start
      </button>
    </div>
  </section>
</template>
