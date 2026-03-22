const tooltip = {
  mounted(el, binding) {
    const value = binding?.value
    if (value == null || value === '') return
    el.setAttribute('title', String(value))
  },
  updated(el, binding) {
    const value = binding?.value
    if (value == null || value === '') {
      el.removeAttribute('title')
      return
    }
    el.setAttribute('title', String(value))
  }
}

export default tooltip
