<template>
  <div
    class="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-pink-300 via-pink-200 to-orange-200 font-birthday p-4 space-y-8 sm:space-y-12 md:space-y-20 overflow-auto"
  >
    <h1
      class="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-pink-600 mb-4 sm:mb-6 md:mb-10 birthday-title text-center"
    >
      🎁 星星生日快乐！
    </h1>
    <div
      class="puzzle-size border-2 sm:border-3 border-pink-600 rounded-xl overflow-hidden relative mx-auto max-w-full"
      ref="puzzleRef"
    >
      <!-- Puzzle pieces (shown when game is not won) -->
      <div v-if="!gameWon" class="grid puzzle-grid w-full h-full">
        <div
          v-for="(piece, index) in pieces"
          :key="index"
          class="piece cursor-pointer transition-transform duration-200 hover:scale-105 select-none"
          :class="{
            'opacity-50': draggedIndex === index,
            'ring-2 ring-pink-500': dragOverIndex === index && draggedIndex !== null,
            'ring-2 ring-blue-500 z-9': firstClick === index,
          }"
          :style="{
            backgroundImage: `url(${selectedImage})`,
            backgroundSize: `${puzzleSize}px ${puzzleSize}px`,
            backgroundPosition: `-${piece.correctCol * pieceSize}px -${piece.correctRow * pieceSize}px`,
          }"
          :data-index="index"
          draggable="true"
          @click="selectPiece(index)"
          @dragstart="onDragStart(index, $event)"
          @dragover.prevent="onDragOver(index, $event)"
          @dragenter.prevent="onDragEnter(index)"
          @dragleave="onDragLeave(index)"
          @drop.prevent="onDrop(index, $event)"
          @dragend="onDragEnd"
        />
      </div>

      <!-- Complete static image (shown when game is won) -->
      <div
        v-if="gameWon"
        class="w-full h-full animate-fade-in"
        :style="{
          backgroundImage: `url(${selectedImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }"
      ></div>
    </div>
    <p
      v-show="gameWon"
      class="text-3xl sm:text-4xl md:text-5xl lg:text-7xl text-pink-700 font-bold animate-fade-in birthday-message text-center px-4"
    >
      🎉 2025生日快乐！亲爱的星星 ❤️
    </p>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, onUnmounted } from 'vue'

interface PuzzlePiece {
  row: number
  col: number
  correctRow: number
  correctCol: number
}

const puzzleRef = ref<HTMLElement>()
const size = 4 // 4x4 拼图
const screenWidth = ref(window.innerWidth)

// Responsive puzzle size
const puzzleSize = computed(() => {
  const padding = 32 // 32px for padding (16px on each side)
  const viewportSize = Math.min(screenWidth.value, window.innerHeight * 0.7) // Consider height too for landscape
  const maxSize = Math.min(viewportSize - padding, 600)
  const minSize = 280 // Minimum size for usability
  return Math.max(minSize, maxSize)
})

const pieceSize = computed(() => puzzleSize.value / size) // Size of each piece in pixels
const pieces = ref<PuzzlePiece[]>([])
const firstClick = ref<number | null>(null)
const gameWon = ref(false)

// Available puzzle images
const puzzleImages = [
  'mmexport1756349534701.jpg',
  'mmexport1756349546577.jpg',
  'mmexport1756349574653.jpg',
  'mmexport1756349608622.jpg',
  'mmexport1756349618184.jpg',
  'mmexport1756349710138.jpg',
]

// Selected random image
const selectedImage = ref('')

// Drag and drop state
const draggedIndex = ref<number | null>(null)
const dragOverIndex = ref<number | null>(null)

// Select a random image from the available images
const selectRandomImage = (): void => {
  const randomIndex = Math.floor(Math.random() * puzzleImages.length)
  selectedImage.value = `/sim-happy-birthday/puzzle-images/${puzzleImages[randomIndex]}`
}

// 初始化拼图
const initPuzzle = (): void => {
  pieces.value = []
  gameWon.value = false
  selectRandomImage()

  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      pieces.value.push({
        row,
        col,
        correctRow: row,
        correctCol: col,
      })
    }
  }

  shuffle(pieces.value)
}

// 打乱数组
const shuffle = (array: PuzzlePiece[]): void => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[array[i], array[j]] = [array[j], array[i]]
  }
}

// 选择拼图块
const selectPiece = (index: number): void => {
  if (firstClick.value === null) {
    firstClick.value = index
  } else {
    swapPieces(firstClick.value, index)
    firstClick.value = null
    checkWin()
  }
}

// 交换拼图块
const swapPieces = (i: number, j: number): void => {
  ;[pieces.value[i], pieces.value[j]] = [pieces.value[j], pieces.value[i]]
}

// 检查是否拼好
const checkWin = (): void => {
  for (let i = 0; i < pieces.value.length; i++) {
    const piece = pieces.value[i]
    const row = Math.floor(i / size)
    const col = i % size
    if (piece.correctRow !== row || piece.correctCol !== col) {
      return
    }
  }
  gameWon.value = true
}

// Drag and drop functions
const onDragStart = (index: number, event: DragEvent): void => {
  draggedIndex.value = index
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.setData('text/plain', index.toString())
  }
}

const onDragOver = (index: number, event: DragEvent): void => {
  event.preventDefault()
  if (event.dataTransfer) {
    event.dataTransfer.dropEffect = 'move'
  }
}

const onDragEnter = (index: number): void => {
  if (draggedIndex.value !== null && draggedIndex.value !== index) {
    dragOverIndex.value = index
  }
}

const onDragLeave = (index: number): void => {
  if (dragOverIndex.value === index) {
    dragOverIndex.value = null
  }
}

const onDrop = (index: number, event: DragEvent): void => {
  event.preventDefault()
  if (draggedIndex.value !== null && draggedIndex.value !== index) {
    swapPieces(draggedIndex.value, index)
    checkWin()
  }
  draggedIndex.value = null
  dragOverIndex.value = null
}

const onDragEnd = (): void => {
  draggedIndex.value = null
  dragOverIndex.value = null
}

// Handle window resize for responsive behavior
const handleResize = (): void => {
  screenWidth.value = window.innerWidth
}

onMounted(() => {
  initPuzzle()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})
</script>

<style scoped>
/* Custom font face definition */
@font-face {
  font-family: 'AaKeAiBeiTianTianQuanZhuLiao';
  src: url('/sim-happy-birthday/fonts/AaKeAiBeiTianTianQuanZhuLiao-2.ttf') format('truetype');
  font-weight: normal;
  font-style: normal;
  font-display: swap;
}

/* Dynamic piece sizing based on computed pieceSize */
.piece {
  width: v-bind('pieceSize + "px"');
  height: v-bind('pieceSize + "px"');
}

.puzzle-grid {
  grid-template-columns: repeat(v-bind('size'), minmax(0, 1fr));
  grid-template-rows: repeat(v-bind('size'), minmax(0, 1fr));
}

.puzzle-size {
  width: v-bind('puzzleSize + "px"');
  height: v-bind('puzzleSize + "px"');
}

/* You can also bind other TS variables */
.puzzle-container {
  --puzzle-size: v-bind('puzzleSize + "px"');
  --grid-size: v-bind('size');
}

/* Custom fade-in animation */
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.animate-fade-in {
  animation: fadeIn 2s ease-in-out;
}

/* Custom font styles */
.birthday-title {
  font-family: 'AaKeAiBeiTianTianQuanZhuLiao', sans-serif;
  line-height: 1.2;
}

.birthday-message {
  font-family: 'AaKeAiBeiTianTianQuanZhuLiao', sans-serif;
  line-height: 1.3;
}

/* Mobile-friendly touch targets */
@media (max-width: 768px) {
  .piece {
    /* Ensure pieces are easily tappable on mobile */
    touch-action: manipulation;
  }

  .piece:hover {
    /* Disable hover effects on touch devices */
    transform: none;
  }

  .piece:active {
    /* Add feedback for touch */
    transform: scale(0.95);
  }
}

/* Improve contrast and readability on smaller screens */
@media (max-width: 480px) {
  .birthday-title {
    text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.1);
  }

  .birthday-message {
    text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.1);
  }
}

/* Landscape orientation on mobile */
@media (max-height: 600px) and (orientation: landscape) {
  .birthday-title {
    font-size: 1.5rem !important;
    margin-bottom: 0.5rem !important;
  }

  .birthday-message {
    font-size: 1.75rem !important;
  }

  /* Reduce spacing in landscape */
  .space-y-8 > :not([hidden]) ~ :not([hidden]) {
    margin-top: 1rem !important;
  }
}

/* Very small screens */
@media (max-width: 320px) {
  .birthday-title {
    font-size: 1.25rem !important;
  }

  .birthday-message {
    font-size: 1.5rem !important;
  }
}
</style>
