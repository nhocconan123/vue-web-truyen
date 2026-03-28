<template>
  <div class="app-shell flex min-h-screen w-full flex-col overflow-x-hidden">
    <AppHeader v-if="showHeader" />
    <main class="flex-1 w-full px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <slot />
    </main>
    <AppFooter v-if="showFooter" />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { AppHeader, AppFooter } from '../components'

const route = useRoute()
const showHeader = computed(() => !route.meta.hideHeader)
const showFooter = computed(() => !route.meta.hideFooter)
</script>
