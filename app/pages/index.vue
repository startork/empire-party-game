<script setup lang="ts">
import { primeSpeech } from '~/utils/speak'

const {
  state,
  playerNumber,
  maxExtra,
  setExpectedCount,
  startGame,
  submitName,
  continueHandoff,
  addPlayers,
  continueToReadout,
  finishReadout,
  finishGame,
  createOrders,
  newGame,
} = useGameSession()

const entryError = ref('')

const count = computed({
  get: () => state.expectedCount,
  set: (value: number) => setExpectedCount(value),
})

function onSubmit(name: string) {
  const result = submitName(name)
  if (result === 'empty')
    entryError.value = 'Enter a name to continue.'
  else if (result === 'duplicate')
    entryError.value = 'That name is already in. Enter someone else.'
  else
    entryError.value = ''
}

function onAddPlayers(extra: number) {
  entryError.value = ''
  addPlayers(extra)
}

function resetGame() {
  entryError.value = ''
  newGame()
}

onMounted(() => {
  primeSpeech()
})
</script>

<template>
  <main class="app">
    <SetupScreen
      v-if="state.phase === 'setup'"
      v-model:count="count"
      @start="startGame"
    />
    <EntryScreen
      v-else-if="state.phase === 'entry'"
      :player-number="playerNumber"
      :total="state.expectedCount"
      :handoff="state.awaitingHandoff"
      :error="entryError"
      @submit="onSubmit"
      @edit="entryError = ''"
      @ready="continueHandoff"
    />
    <AddPlayersScreen
      v-else-if="state.phase === 'addPlayers'"
      :total="state.expectedCount"
      :max-extra="maxExtra"
      @continue="onAddPlayers"
    />
    <VolumeScreen
      v-else-if="state.phase === 'volume'"
      @continue="continueToReadout"
    />
    <ReadoutScreen
      v-else-if="state.phase === 'readout'"
      :create-orders="createOrders"
      @done="finishReadout"
    />
    <PlayingScreen
      v-else-if="state.phase === 'playing'"
      @finish="finishGame"
    />
    <RevealScreen
      v-else-if="state.phase === 'reveal'"
      :names="state.names"
      @restart="resetGame"
    />
  </main>
</template>
