<script setup lang="ts">
import type { WheelSlice } from '~~/shared/types/wheel'
import { ensureAudioContext, playTickSound } from '~/utils/sound'

const props = defineProps<{
  slices: WheelSlice[]
  spinDuration: number
  autoRespinDelayMs: number
  canShuffle: boolean
}>()

const emit = defineEmits<{
  'update:spinning': [value: boolean]
  winner: [slice: WheelSlice]
  shuffle: []
}>()

const canvasRef = ref<HTMLCanvasElement | null>(null)
const tickerPinRef = ref<HTMLDivElement | null>(null)

const isSpinning = ref(false)
const isAutoRespinning = ref(false)
const isHoveringCenter = ref(false)

let currentAngle = 0
let lastTickSliceIndex = -1
let animationFrameId: number | null = null
let respinTimeoutId: ReturnType<typeof setTimeout> | null = null
let spinStartTime = 0
let spinDurationMs = 10000
let startAngle = 0
let totalRotation = 0

function easeOutQuint(x: number): number {
  return 1 - Math.pow(1 - x, 5)
}

function triggerPinWiggle(): void {
  const pin = tickerPinRef.value
  if (!pin) {
    return
  }
  pin.classList.remove('wiggle')
  void pin.offsetWidth
  pin.classList.add('wiggle')
}

function getSliceUnderPointer(): number {
  if (props.slices.length === 0) {
    return -1
  }

  const anglePerSlice = (2 * Math.PI) / props.slices.length
  let pointerAngle = 1.5 * Math.PI - currentAngle

  pointerAngle = pointerAngle % (2 * Math.PI)
  if (pointerAngle < 0) {
    pointerAngle += 2 * Math.PI
  }

  const index = Math.floor(pointerAngle / anglePerSlice)
  return Math.min(index, props.slices.length - 1)
}

function drawWheel(): void {
  const canvas = canvasRef.value
  if (!canvas) {
    return
  }
  const ctx = canvas.getContext('2d')
  if (!ctx) {
    return
  }

  const width = canvas.width
  const height = canvas.height
  const center = width / 2
  const radius = 280

  ctx.clearRect(0, 0, width, height)

  if (props.slices.length === 0) {
    ctx.fillStyle = '#1a1a1a'
    ctx.font = "bold 20px 'Space Grotesk', sans-serif"
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('ADD ENTRIES TO BEGIN', center, center)

    ctx.beginPath()
    ctx.arc(center, center, radius, 0, 2 * Math.PI)
    ctx.lineWidth = 4
    ctx.strokeStyle = '#1a1a1a'
    ctx.stroke()
    return
  }

  const anglePerSlice = (2 * Math.PI) / props.slices.length

  props.slices.forEach((slice, index) => {
    const sliceStart = index * anglePerSlice + currentAngle
    const sliceEnd = (index + 1) * anglePerSlice + currentAngle

    ctx.beginPath()
    ctx.moveTo(center, center)
    ctx.arc(center, center, radius, sliceStart, sliceEnd)
    ctx.closePath()

    ctx.fillStyle = slice.color
    ctx.fill()

    ctx.lineWidth = 3
    ctx.strokeStyle = '#1a1a1a'
    ctx.stroke()
  })

  props.slices.forEach((slice, index) => {
    const sliceStart = index * anglePerSlice + currentAngle
    const sliceEnd = (index + 1) * anglePerSlice + currentAngle
    const midAngle = sliceStart + (sliceEnd - sliceStart) / 2

    ctx.save()
    ctx.translate(center, center)
    ctx.rotate(midAngle)

    ctx.textAlign = 'right'
    ctx.textBaseline = 'middle'
    ctx.fillStyle = slice.color === '#0055ff' ? '#f5f0e8' : '#1a1a1a'

    const maxTextWidth = radius - 60
    let fontSize = Math.min(42, Math.max(14, 320 / props.slices.length))
    ctx.font = `800 ${fontSize}px 'Space Grotesk', sans-serif`

    let text = slice.text.toUpperCase()
    let textWidth = ctx.measureText(text).width
    if (textWidth > maxTextWidth) {
      fontSize = Math.max(10, fontSize - 3)
      ctx.font = `800 ${fontSize}px 'Space Grotesk', sans-serif`
      textWidth = ctx.measureText(text).width

      if (textWidth > maxTextWidth) {
        while (text.length > 3 && textWidth > maxTextWidth) {
          text = text.slice(0, -1)
          textWidth = ctx.measureText(text + '...').width
        }
        text = text + '...'
      }
    }

    ctx.fillText(text, radius - 20, 0)
    ctx.restore()
  })

  ctx.beginPath()
  ctx.arc(center, center, 35, 0, 2 * Math.PI)
  ctx.fillStyle = '#1a1a1a'
  ctx.fill()

  ctx.beginPath()
  ctx.arc(center, center, 25, 0, 2 * Math.PI)
  ctx.fillStyle = '#ffffff'
  ctx.strokeStyle = '#1a1a1a'
  ctx.lineWidth = 3
  ctx.fill()
  ctx.stroke()

  ctx.beginPath()
  ctx.arc(center, center, 10, 0, 2 * Math.PI)
  ctx.fillStyle = '#ffcc00'
  ctx.fill()

  ctx.beginPath()
  ctx.arc(center, center, radius, 0, 2 * Math.PI)
  ctx.lineWidth = 4
  ctx.strokeStyle = '#1a1a1a'
  ctx.stroke()
}

function finishSpin(): void {
  const winningIndex = getSliceUnderPointer()
  const winner = props.slices[winningIndex]

  if (!winner) {
    isSpinning.value = false
    emit('update:spinning', false)
    return
  }

  if (winner.isRespin) {
    isAutoRespinning.value = true

    playTickSound(600, 0.15)
    setTimeout(() => playTickSound(500, 0.15), 100)

    respinTimeoutId = setTimeout(() => {
      respinTimeoutId = null
      isAutoRespinning.value = false
      beginSpinMotion()
    }, props.autoRespinDelayMs)
    return
  }

  isSpinning.value = false
  emit('update:spinning', false)

  playTickSound(880, 0.1)
  setTimeout(() => playTickSound(1100, 0.1), 100)
  setTimeout(() => playTickSound(1320, 0.15), 200)

  emit('winner', winner)
}

function animateSpin(): void {
  if (!isSpinning.value) {
    return
  }

  const elapsed = Date.now() - spinStartTime
  const progress = Math.min(1, elapsed / spinDurationMs)

  currentAngle = startAngle + totalRotation * easeOutQuint(progress)

  const currentSliceIndex = getSliceUnderPointer()
  if (currentSliceIndex !== lastTickSliceIndex && currentSliceIndex !== -1) {
    const pitch = Math.max(600, Math.min(1400, 1100 - progress * 400))
    playTickSound(pitch, 0.012)
    triggerPinWiggle()
    lastTickSliceIndex = currentSliceIndex
  }

  drawWheel()

  if (progress < 1) {
    animationFrameId = requestAnimationFrame(animateSpin)
  } else {
    animationFrameId = null
    finishSpin()
  }
}

function beginSpinMotion(): void {
  if (props.slices.length === 0) {
    isSpinning.value = false
    emit('update:spinning', false)
    return
  }

  lastTickSliceIndex = -1
  spinStartTime = Date.now()
  spinDurationMs = props.spinDuration * 1000
  startAngle = currentAngle % (2 * Math.PI)
  totalRotation = (5 + Math.random() * 3) * 2 * Math.PI + Math.random() * 2 * Math.PI

  animateSpin()
}

function startSpin(): void {
  if (isSpinning.value || props.slices.length === 0) {
    return
  }

  ensureAudioContext()
  isSpinning.value = true
  emit('update:spinning', true)
  beginSpinMotion()
}

function isPointInCenterHub(event: MouseEvent): boolean {
  const canvas = canvasRef.value
  if (!canvas) {
    return false
  }
  const rect = canvas.getBoundingClientRect()
  if (rect.width === 0 || rect.height === 0) {
    return false
  }
  const x = ((event.clientX - rect.left) / rect.width) * canvas.width
  const y = ((event.clientY - rect.top) / rect.height) * canvas.height
  const center = canvas.width / 2
  return Math.hypot(x - center, y - center) <= 35
}

function onCanvasMouseMove(event: MouseEvent): void {
  isHoveringCenter.value = isPointInCenterHub(event)
}

function onCanvasMouseLeave(): void {
  isHoveringCenter.value = false
}

function onCanvasClick(event: MouseEvent): void {
  if (!isPointInCenterHub(event)) {
    return
  }
  startSpin()
}

function onShuffle(): void {
  if (isSpinning.value || !props.canShuffle) {
    return
  }
  emit('shuffle')
}

watch(
  () => props.slices,
  () => {
    drawWheel()
  },
  { deep: true }
)

onMounted(() => {
  drawWheel()
  if (typeof document !== 'undefined' && document.fonts) {
    document.fonts.ready.then(() => {
      drawWheel()
    })
  }
})

onBeforeUnmount(() => {
  if (animationFrameId !== null) {
    cancelAnimationFrame(animationFrameId)
  }
  if (respinTimeoutId !== null) {
    clearTimeout(respinTimeoutId)
  }
})
</script>

<template>
  <div class="wheel-wrapper">
    <div class="wheel-outer-ring">
      <div ref="tickerPinRef" class="ticker-pin" />
      <canvas
        ref="canvasRef"
        class="wheel-canvas"
        :class="{
          'is-center-clickable': isHoveringCenter && !isSpinning && slices.length > 0,
          'is-center-locked': isHoveringCenter && (isSpinning || slices.length === 0)
        }"
        width="600"
        height="600"
        @mousemove="onCanvasMouseMove"
        @mouseleave="onCanvasMouseLeave"
        @click="onCanvasClick"
      />
    </div>
  </div>

  <div class="spin-action-area">
    <div class="spin-btn-wrap">
      <button
        type="button"
        class="brutalist-btn spin-btn"
        :class="{
          'is-spinning': isSpinning,
          'respin-flash': isAutoRespinning,
          'is-locked': isSpinning || slices.length === 0
        }"
        @click="startSpin"
      >
        {{ isAutoRespinning ? 'HERE WE GO AGAIN...' : isSpinning ? 'SPINNING...' : 'SPIN!' }}
      </button>
    </div>

    <button
      type="button"
      class="brutalist-btn shuffle-btn"
      :class="{ 'is-locked': isSpinning || !canShuffle }"
      @click="onShuffle"
    >
      SHUFFLE
    </button>
  </div>
</template>

<style scoped>
.wheel-wrapper {
  position: relative;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.wheel-outer-ring {
  position: relative;
  border: var(--border);
  background-color: var(--primary);
  padding: 8px;
  box-shadow: 6px 6px 0px 0px var(--primary);
  display: block;
  width: min(100%, max(320px, calc(100dvh - 320px)));
}

.wheel-canvas {
  width: 100%;
  height: auto;
  aspect-ratio: 1 / 1;
  background-color: var(--white);
  display: block;
}

.wheel-canvas.is-center-clickable {
  cursor: pointer;
}

.wheel-canvas.is-center-locked {
  cursor: not-allowed;
}

.ticker-pin {
  position: absolute;
  top: -10px;
  left: 50%;
  transform: translateX(-50%);
  width: 28px;
  height: 36px;
  background-color: var(--accent-red);
  border: var(--border);
  z-index: 10;
  clip-path: polygon(50% 100%, 0% 0%, 100% 0%);
  transform-origin: 50% 0%;
}

.ticker-pin.wiggle {
  animation: pin-wiggle 0.15s ease-out;
}

@keyframes pin-wiggle {
  0% { transform: translateX(-50%) rotate(0deg); }
  25% { transform: translateX(-50%) rotate(-25deg); }
  75% { transform: translateX(-50%) rotate(20deg); }
  100% { transform: translateX(-50%) rotate(0deg); }
}

.spin-action-area {
  width: min(100%, max(320px, calc(100dvh - 320px)));
  display: flex;
  align-items: stretch;
  gap: 1rem;
}

.spin-btn-wrap {
  flex: 1;
  min-width: 0;
  container-type: inline-size;
}

.spin-btn {
  width: 100%;
  height: 78px;
  display: flex;
  align-items: center;
  justify-content: center;
  white-space: nowrap;
  overflow: hidden;
  font-size: clamp(1.8rem, 12cqi, 3rem);
  line-height: 1;
  padding: 0 1rem;
  box-shadow: var(--shadow);
  background-color: var(--accent-yellow);
  letter-spacing: 1px;
}

@media (hover: hover) {
  .spin-btn:hover:not(:disabled):not(.is-locked) {
    background-color: var(--primary);
    color: var(--accent-yellow);
    box-shadow: var(--shadow-hover);
    transform: translate(-3px, -3px);
  }
}

.spin-btn:active:not(:disabled):not(.is-locked) {
  background-color: var(--primary);
  color: var(--accent-yellow);
  transform: translate(6px, 6px);
  box-shadow: 0px 0px 0px 0px var(--primary);
}

.spin-btn.is-locked {
  cursor: not-allowed;
}

.spin-btn.is-spinning {
  font-size: clamp(1.1rem, 11.5cqi, 3rem);
}

.spin-btn.respin-flash,
.spin-btn.respin-flash:hover,
.spin-btn.respin-flash:active {
  font-size: clamp(0.85rem, 6.8cqi, 2.35rem);
  background-color: var(--accent-red);
  color: var(--white);
  border-color: var(--primary);
}

.shuffle-btn {
  height: 78px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 1.5rem;
  font-size: 1.15rem;
  box-shadow: var(--shadow);
  letter-spacing: 0.5px;
}

@media (hover: hover) {
  .shuffle-btn:hover:not(:disabled):not(.is-locked) {
    background-color: var(--primary);
    color: var(--white);
    box-shadow: var(--shadow-hover);
    transform: translate(-3px, -3px);
  }
}

.shuffle-btn:active:not(:disabled):not(.is-locked) {
  background-color: var(--primary);
  color: var(--white);
  transform: translate(6px, 6px);
  box-shadow: 0px 0px 0px 0px var(--primary);
}

@media (max-width: 900px) {
  .wheel-wrapper {
    margin-bottom: 0.25rem;
  }

  .wheel-outer-ring,
  .spin-action-area {
    width: min(100%, 520px, max(220px, calc(100dvh - 390px)));
  }

  .wheel-outer-ring {
    padding: 4px;
  }

  .spin-action-area {
    gap: 0.75rem;
  }

  .spin-btn {
    height: 76px;
    padding: 0 0.75rem;
    font-size: clamp(1.85rem, 19cqi, 2.85rem);
  }

  .spin-btn.is-spinning {
    font-size: clamp(1.05rem, 11.5cqi, 2.1rem);
  }

  .spin-btn.respin-flash,
  .spin-btn.respin-flash:hover,
  .spin-btn.respin-flash:active {
    font-size: clamp(0.75rem, 6.5cqi, 1.65rem);
  }

  .shuffle-btn {
    height: 76px;
    padding: 0 1.15rem;
    font-size: 1.05rem;
  }
}
</style>
