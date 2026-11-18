<script setup>
import { ref } from 'vue'
const contador = ref(0)
</script>

<template>
  <button @click="contador++">Haz dado click esta cantidad de click {{ contador }} al boton</button>
</template>

<style scoped></style>
