<script setup lang="ts">
const model = defineModel<number>({ required: true })

const props = defineProps<{
  min: number
  max: number
  label: string
}>()

function change(delta: number) {
  const next = model.value + delta
  if (next < props.min || next > props.max)
    return
  model.value = next
}
</script>

<template>
  <div class="stepper">
    <button
      type="button"
      class="stepper-button"
      :disabled="model <= min"
      :aria-label="`Fewer ${label}`"
      @click="change(-1)"
    >
      −
    </button>
    <output class="stepper-value" aria-live="polite">{{ model }}</output>
    <button
      type="button"
      class="stepper-button"
      :disabled="model >= max"
      :aria-label="`More ${label}`"
      @click="change(1)"
    >
      +
    </button>
  </div>
</template>
