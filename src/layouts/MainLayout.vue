<template>
  <div class="flex flex-col bg-gray-50" style="width: 1400px">
    <AppHeader v-if="showHeader" />
    <!-- full width layout without max constraint -->
    <main class="flex-1 w-full mx-auto px-4 py-8">
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
