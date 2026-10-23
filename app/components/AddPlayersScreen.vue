<script setup lang="ts">
const props = defineProps<{
  total: number
  maxExtra: number
}>()

const emit = defineEmits<{
  continue: [extra: number]
}>()

const extra = ref(0)

watch(() => props.maxExtra, (max) => {
  if (extra.value > max)
    extra.value = max
})
</script>

<template>
  <section class="screen">
    <div class="screen-body">
      <h1>Anyone else?</h1>
      <p v-if="maxExtra > 0" class="lede">
        {{ total }} people are in. Add more before the names are read out, or continue.
      </p>
      <p v-else class="lede">
        {{ total }} people are in. Continue when you are ready to hear the names.
      </p>
      <template v-if="maxExtra > 0">
        <p id="extra-count-label" class="label">How many more</p>
        <CountStepper
          v-model="extra"
          :min="0"
          :max="maxExtra"
          label="extra people"
          aria-labelledby="extra-count-label"
        />
      </template>
    </div>
    <div class="screen-actions">
      <button type="button" class="button" @click="emit('continue', extra)">
        {{ extra > 0 ? 'Add players' : 'Continue' }}
      </button>
    </div>
  </section>
</template>
