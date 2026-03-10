<script lang="ts" setup>
import { computed } from 'vue';
import { current_pokemon, get_url_pokemon } from './data';
const url = computed(()=> get_url_pokemon(current_pokemon.value))
</script>
<template>
<aside>
    <img :src="url" :alt="current_pokemon">
</aside>
</template>
<style scoped>
aside{
    display: flex;
    flex-direction: column;
    background-color: rgb(123, 168, 38);
}
</style>