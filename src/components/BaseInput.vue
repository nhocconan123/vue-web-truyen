<template>
  <input
    :type="type"
    :value="modelValue"
    @input="$emit('update:modelValue', $event.target.value)"
    :placeholder="placeholder"
    :class="inputClass"
    v-bind="$attrs"
  />
</template>

<script>
export default {
  name: 'BaseInput',
  props: {
    modelValue: { type: [String, Number], default: '' },
    type: { type: String, default: 'text' },
    placeholder: { type: String, default: '' },
    error: { type: String, default: '' }
  },
  computed: {
    inputClass () {
      return ['w-full px-3 py-2 border rounded-md focus:outline-none', this.error ? 'border-red-500' : 'border-gray-300', 'focus:ring-2 focus:ring-blue-200'].join(' ')
    }
  }
}
</script>
