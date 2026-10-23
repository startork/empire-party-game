<script setup lang="ts">
const props = defineProps<{
  playerNumber: number
  total: number
  handoff: boolean
  error: string
}>()

const emit = defineEmits<{
  submit: [name: string]
  edit: []
  ready: []
}>()

const draft = ref('')
const input = useTemplateRef('input')

watch(() => props.handoff, async (isHandoff) => {
  if (isHandoff)
    return
  draft.value = ''
  await nextTick()
  input.value?.focus()
})

onMounted(() => {
  if (!props.handoff)
    input.value?.focus()
})

function onInput() {
  if (props.error)
    emit('edit')
}

function submit() {
  emit('submit', draft.value)
}
</script>

<template>
  <section v-if="handoff" class="screen">
    <div class="screen-body">
      <h1>Pass the phone</h1>
      <p class="lede">
        Hand this to the next player. Their name is still a secret.
      </p>
      <p class="label">Next player · {{ playerNumber }} of {{ total }}</p>
    </div>
    <div class="screen-actions">
      <button type="button" class="button" @click="emit('ready')">
        Ready
      </button>
    </div>
  </section>

  <form v-else class="screen" autocomplete="off" @submit.prevent="submit">
    <div class="screen-body">
      <p class="eyebrow">Player {{ playerNumber }} of {{ total }}</p>
      <h1>Enter one name</h1>
      <p class="lede">Real or fictional.</p>
      <input
        ref="input"
        v-model="draft"
        class="field"
        type="text"
        autocomplete="off"
        autocapitalize="words"
        enterkeyhint="next"
        maxlength="80"
        placeholder="Any name"
        :aria-invalid="error ? 'true' : undefined"
        :aria-describedby="error ? 'entry-error' : undefined"
        required
        @input="onInput"
      >
      <p v-if="error" id="entry-error" class="message" role="alert">
        {{ error }}
      </p>
    </div>
    <div class="screen-actions">
      <button type="submit" class="button">
        Next
      </button>
    </div>
  </form>
</template>
