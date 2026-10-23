<script setup lang="ts">
import { canSpeak, speakSample, type SpeechRun } from '~/utils/speak'

const emit = defineEmits<{
  continue: []
}>()

const supported = canSpeak()
const speaking = ref(false)
const error = ref(supported ? '' : 'This browser cannot read names aloud.')
let run: SpeechRun | null = null

function playSample() {
  if (!supported)
    return
  error.value = ''
  run?.cancel()
  speaking.value = true
  run = speakSample({
    onDone: () => {
      speaking.value = false
    },
    onError: () => {
      speaking.value = false
      error.value = 'The sample could not be played. Check that sound is allowed, then try again.'
    },
  })
}

function proceed() {
  run?.cancel()
  emit('continue')
}

onBeforeUnmount(() => {
  run?.cancel()
})
</script>

<template>
  <section class="screen">
    <div class="screen-body">
      <h1>Turn the volume up</h1>
      <p class="lede">
        Each name is read aloud twice, and only twice. Play the sample and make sure you can hear it clearly.
      </p>
      <p v-if="error" class="message" role="alert">
        {{ error }}
      </p>
      <p v-else-if="speaking" class="status">
        Playing the sample…
      </p>
    </div>
    <div class="screen-actions">
      <button type="button" class="button secondary" :disabled="!supported || speaking" @click="playSample">
        Play sample
      </button>
      <button type="button" class="button" :disabled="!supported" @click="proceed">
        Continue
      </button>
    </div>
  </section>
</template>
