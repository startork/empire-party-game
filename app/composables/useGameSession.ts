import { computed, reactive } from 'vue'
import { twoOrders } from '~/utils/shuffle'

export const MIN_PLAYERS = 2
export const MAX_PLAYERS = 20

const STORAGE_KEY = 'empire-game-session'

export type Phase =
  | 'setup'
  | 'entry'
  | 'addPlayers'
  | 'volume'
  | 'readout'
  | 'playing'
  | 'reveal'

export interface GameSession {
  version: 1
  phase: Phase
  expectedCount: number
  names: string[]
  awaitingHandoff: boolean
}

export type NameSubmitResult = 'ok' | 'empty' | 'duplicate'

const PHASES: Phase[] = ['setup', 'entry', 'addPlayers', 'volume', 'readout', 'playing', 'reveal']
const LOCKED_PHASES: Phase[] = ['volume', 'readout', 'playing', 'reveal']

function createDefault(): GameSession {
  return {
    version: 1,
    phase: 'setup',
    expectedCount: 4,
    names: [],
    awaitingHandoff: false,
  }
}

export function normalizeName(name: string): string {
  return name.trim().replace(/\s+/g, ' ')
}

function isSession(value: unknown): value is GameSession {
  if (!value || typeof value !== 'object')
    return false

  const session = value as GameSession
  if (session.version !== 1 || !PHASES.includes(session.phase))
    return false
  if (!Number.isInteger(session.expectedCount))
    return false
  if (session.expectedCount < MIN_PLAYERS || session.expectedCount > MAX_PLAYERS)
    return false
  if (!Array.isArray(session.names) || typeof session.awaitingHandoff !== 'boolean')
    return false
  if (session.names.some(name => typeof name !== 'string' || name !== normalizeName(name) || name.length === 0))
    return false
  if (session.names.length > session.expectedCount)
    return false
  if (session.phase !== 'entry' && session.awaitingHandoff)
    return false
  if (session.awaitingHandoff && session.names.length === 0)
    return false
  if (session.phase === 'setup' && session.names.length !== 0)
    return false
  if (session.phase === 'entry' && session.names.length >= session.expectedCount)
    return false
  if (session.phase === 'addPlayers' && session.names.length !== session.expectedCount)
    return false
  if (LOCKED_PHASES.includes(session.phase) && session.names.length !== session.expectedCount)
    return false

  const seen = new Set<string>()
  for (const name of session.names) {
    const key = name.toLocaleLowerCase()
    if (seen.has(key))
      return false
    seen.add(key)
  }

  return true
}

function load(): GameSession {
  if (!import.meta.client)
    return createDefault()

  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw)
      return createDefault()
    const parsed: unknown = JSON.parse(raw)
    return isSession(parsed) ? parsed : createDefault()
  }
  catch {
    return createDefault()
  }
}

function persist(session: GameSession) {
  if (!import.meta.client)
    return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session))
  }
  catch {
    // Private browsing can refuse storage. The in-memory game still continues.
  }
}

const state = reactive<GameSession>(load())

export function useGameSession() {
  function setExpectedCount(count: number) {
    if (state.phase !== 'setup')
      return
    state.expectedCount = Math.min(MAX_PLAYERS, Math.max(MIN_PLAYERS, Math.round(count)))
    persist(state)
  }

  function startGame() {
    state.names = []
    state.awaitingHandoff = false
    state.phase = 'entry'
    persist(state)
  }

  function submitName(raw: string): NameSubmitResult {
    const display = normalizeName(raw)
    if (!display)
      return 'empty'
    const key = display.toLocaleLowerCase()
    if (state.names.some(name => name.toLocaleLowerCase() === key))
      return 'duplicate'

    state.names.push(display)
    if (state.names.length < state.expectedCount) {
      state.awaitingHandoff = true
      state.phase = 'entry'
    }
    else {
      state.awaitingHandoff = false
      state.phase = 'addPlayers'
    }
    persist(state)
    return 'ok'
  }

  function continueHandoff() {
    state.awaitingHandoff = false
    persist(state)
  }

  function addPlayers(extra: number) {
    const room = MAX_PLAYERS - state.expectedCount
    const added = Math.min(room, Math.max(0, Math.floor(extra)))
    if (added === 0) {
      state.awaitingHandoff = false
      state.phase = 'volume'
    }
    else {
      state.expectedCount += added
      state.awaitingHandoff = false
      state.phase = 'entry'
    }
    persist(state)
  }

  function continueToReadout() {
    state.phase = 'readout'
    persist(state)
  }

  function finishReadout() {
    state.phase = 'playing'
    persist(state)
  }

  function finishGame() {
    state.phase = 'reveal'
    persist(state)
  }

  function createOrders(): [string[], string[]] {
    return twoOrders(state.names)
  }

  function newGame() {
    const next = createDefault()
    state.version = next.version
    state.phase = next.phase
    state.expectedCount = next.expectedCount
    state.names = []
    state.awaitingHandoff = next.awaitingHandoff
    if (import.meta.client) {
      try {
        localStorage.removeItem(STORAGE_KEY)
      }
      catch {
        // Ignore storage failures and keep the reset screen.
      }
    }
  }

  const playerNumber = computed(() => state.names.length + 1)
  const maxExtra = computed(() => MAX_PLAYERS - state.expectedCount)

  return {
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
  }
}
