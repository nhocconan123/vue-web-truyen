<template>
  <button
    :class="classes"
    :disabled="disabled"
    :type="type"
    @click="$emit('click', $event)"
  >
    <slot />
  </button>
</template>

<script>
export default {
  name: 'BaseButton',
  props: {
    variant: { type: String, default: 'primary' },
    size: { type: String, default: 'md' },
    disabled: { type: Boolean, default: false },
    type: { type: String, default: 'submit' }
  },
  computed: {
    classes () {
      const base = 'inline-flex items-center justify-center rounded-md font-medium transition'
      const variants = {
        primary: 'bg-blue-600 text-white hover:bg-blue-700',
        secondary: 'bg-gray-100 text-gray-800 hover:bg-gray-200',
        ghost: 'bg-transparent text-blue-600 hover:bg-blue-50'
      }
      const sizes = {
        sm: 'px-2 py-1 text-sm',
        md: 'px-4 py-2 text-base',
        lg: 'px-6 py-3 text-lg'
      }
      return [base, variants[this.variant] || variants.primary, sizes[this.size] || sizes.md, this.disabled ? 'opacity-50 cursor-not-allowed' : ''].join(' ')
    }
  }
}
</script>
