<template>
  <footer class="mt-8 border-t bg-white">
    <div class="mx-auto w-full max-w-6xl px-4 py-4 text-center text-sm text-gray-500 sm:px-6 lg:px-8">
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
