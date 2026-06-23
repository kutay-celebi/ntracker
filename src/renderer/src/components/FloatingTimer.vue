<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'

interface TimerState {
  isRunning: boolean
  label: string
  elapsed: string
  elapsedSeconds: number
  entryId: string | undefined
}

const state = ref<TimerState>({
  isRunning: false,
  label: '',
  elapsed: '0:00:00',
  elapsedSeconds: 0,
  entryId: undefined
})

let unsubState: (() => void) | null = null

function toggleTimer(): void {
  if (state.value.isRunning) {
    window.api.timerPause()
  } else {
    window.api.timerResume()
  }
}

function stop(): void {
  window.api.timerRequestAddDuration()
}

function hide(): void {
  window.api.timerHideFloating()
}

onMounted(async () => {
  state.value = await window.api.timerGetState()
  unsubState = window.api.onTimerState((s) => {
    state.value = s
  })
})

onUnmounted(() => {
  unsubState?.()
})
</script>

<template>
  <div class="floating-timer" :class="{ paused: !state.isRunning }">
    <div class="drag-area">
      <div class="status-dot" :class="{ running: state.isRunning }" />
      <div class="content">
        <div class="elapsed">{{ state.elapsed }}</div>
        <div class="label">{{ state.label }}</div>
      </div>
      <div class="controls">
        <button class="ctrl-btn" :title="state.isRunning ? 'Pause' : 'Resume'" @click="toggleTimer">
          {{ state.isRunning ? '⏸' : '▶' }}
        </button>
        <button class="ctrl-btn" title="Add duration & stop" @click="stop">⏹</button>
        <button class="ctrl-btn hide-btn" title="Hide" @click="hide">✕</button>
      </div>
    </div>
  </div>
</template>

<style>
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  background: transparent;
  overflow: hidden;
}
</style>

<style scoped>
.floating-timer {
  width: 280px;
  height: 76px;
  background: rgba(28, 28, 40, 0.93);
  border-radius: 14px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(16px);
  display: flex;
  align-items: center;
  user-select: none;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
  transition: border-color 0.2s;
}

.floating-timer.paused {
  border-color: rgba(251, 191, 36, 0.35);
}

.drag-area {
  -webkit-app-region: drag;
  display: flex;
  align-items: center;
  width: 100%;
  padding: 0 14px;
  gap: 10px;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #fbbf24;
  flex-shrink: 0;
  transition: background 0.2s;
}

.status-dot.running {
  background: #22c55e;
  box-shadow: 0 0 6px #22c55e88;
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.elapsed {
  font-size: 19px;
  font-weight: 700;
  color: #e2e8f0;
  font-family: 'Roboto Mono', 'Courier New', monospace;
  letter-spacing: 1px;
  line-height: 1;
}

.label {
  font-size: 11px;
  color: #94a3b8;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.controls {
  -webkit-app-region: no-drag;
  display: flex;
  align-items: center;
  gap: 2px;
  flex-shrink: 0;
}

.ctrl-btn {
  background: transparent;
  border: none;
  color: #64748b;
  cursor: pointer;
  font-size: 12px;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.15s, color 0.15s;
  padding: 0;
}

.ctrl-btn:hover {
  background: rgba(255, 255, 255, 0.12);
  color: #e2e8f0;
}
</style>
