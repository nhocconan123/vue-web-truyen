<template>
  <textarea
    :value="modelValue"
    @input="$emit('update:modelValue', $event.target.value)"
    :placeholder="placeholder"
    :class="textareaClass"
    v-bind="$attrs"
  />
</template>

<script>
export default {
  name: 'BaseTextarea',
  props: {
    modelValue: { type: String, default: '' },
    placeholder: { type: String, default: '' },
    rows: { type: [String, Number], default: 4 },
    error: { type: String, default: '' }
  },
  computed: {
    textareaClass () {
      return ['w-full px-3 py-2 border rounded-md focus:outline-none', this.error ? 'border-red-500' : 'border-gray-300', 'focus:ring-2 focus:ring-blue-200'].join(' ')
    }
  }
}
</script>
