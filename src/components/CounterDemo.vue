<template>
  <div class="mt-6 p-4 border rounded-md">
    <h3 class="text-lg font-medium mb-2">Pinia Counter Demo</h3>
    <div class="flex items-center gap-4">
      <div>
        <div class="text-2xl font-bold">{{ counter.count }}</div>
        <div class="text-sm text-gray-500">Double: {{ counter.doubleCount }}</div>
      </div>
      <div class="flex items-center gap-2">
        <button @click="counter.increment" class="px-3 py-1 rounded bg-blue-600 text-white">Increment</button>
      </div>
    </div>
  </div>
</template>

<script>
import { useCounterStore } from '../stores'

export default {
  name: 'CounterDemo',
  setup () {
    const counter = useCounterStore()
    return { counter }
  }
}
</script>
