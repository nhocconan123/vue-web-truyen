import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface CounterState {
  count: number
}

export const useCounterStore = defineStore('counter', () => {
  // State
  const count = ref<number>(0)

  // Getters
  const doubleCount = computed<number>(() => count.value * 2)
  const isEven = computed<boolean>(() => count.value % 2 === 0)
  const isPositive = computed<boolean>(() => count.value > 0)

  // Actions
  function increment(): void {
    count.value++
  }

  function decrement(): void {
    count.value--
  }

  function reset(): void {
    count.value = 0
  }

  function setCount(value: number): void {
    count.value = value
  }

  function addValue(value: number): void {
    count.value += value
  }

  return {
    // State
    count,
    // Getters
    doubleCount,
    isEven,
    isPositive,
    // Actions
    increment,
    decrement,
    reset,
    setCount,
    addValue
  }
})
