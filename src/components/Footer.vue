<template>
  <footer class="bg-white border-t mt-8">
    <div class="max-w-6xl mx-auto px-4 py-4 text-center text-sm text-gray-500">
      © {{ year }} Web Truyện — All rights reserved.
    </div>
  </footer>
</template>

<script>
export default {
  name: 'AppFooter',
  data() {
    return { year: new Date().getFullYear() }
  }
}
</script>
