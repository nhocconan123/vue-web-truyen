<template>
  <div class="mb-4">
    <label v-if="label" class="block mb-1 font-medium text-sm">{{ label }}</label>
    <slot />
    <p v-if="error" class="text-sm text-red-600 mt-1">{{ error }}</p>
  </div>
</template>

<script>
export default {
  name: 'FormField',
  props: {
    label: { type: String, default: '' },
    error: { type: String, default: '' }
  }
}
</script>
