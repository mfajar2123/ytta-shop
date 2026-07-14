<template>
  <div>
    <HeroSection />
    <KeyFeatures />
    <Specifications />
  </div>
</template>

<script setup lang="ts">
import HeroSection from '~/components/landing/HeroSection.vue'
import KeyFeatures from '~/components/landing/KeyFeatures.vue'
import Specifications from '~/components/landing/Specifications.vue'

definePageMeta({
  layout: 'default'
})
</script>
