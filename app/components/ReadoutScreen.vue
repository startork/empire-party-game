<script setup lang="ts">
import { buildReadout, canSpeak, speakLines, type SpeechRun } from '~/utils/speak'

const props = defineProps<{
  createOrders: () => [string[], string[]]
}>()

const emit = defineEmits<{
  done: []
}>()

const status = ref<'idle' | 'speaking' | 'error'>('idle')
const pass = ref<1 | 2>(1)
const index = ref(0)
const total = ref(0)
let run: SpeechRun | null = null

const passLabel = computed(() => pass.value === 1 ? 'First time' : 'Second time')

function play() {
  run?.cancel()
  if (!canSpeak()) {
    status.value = 'error'
    return
  }

  const [first, second] = props.createOrders()
  status.value = 'speaking'
  run = speakLines(buildReadout(first, second), {
    onLine: (line) => {
      pass.value = line.pass
      index.value = line.index
      total.value = line.total
    },
    onDone: () => {
      status.value = 'idle'
      emit('done')
    },
    onError: () => {
      status.value = 'error'
    },
  })
}

onBeforeUnmount(() => {
  run?.cancel()
})
</script>

<template>
  <section class="screen">
    <div class="screen-body">
      <h1>{{ status === 'speaking' ? passLabel : 'Listen' }}</h1>
      <p v-if="status === 'speaking'" class="lede" aria-live="polite">
        Name {{ index }} of {{ total }}
      </p>
      <p v-else-if="status === 'error'" class="message" role="alert">
        The names could not be read aloud. Check the volume and try again.
      </p>
      <p v-else class="lede">
        The names will be read twice, each time in a different order.
      </p>
    </div>
    <div v-if="status !== 'speaking'" class="screen-actions">
      <button type="button" class="button" @click="play">
        Play
      </button>
    </div>
  </section>
</template>
