<script lang="ts" setup>
import { computed } from 'vue';
import { current_palette, current_pokemon_id, get_url_pokemon } from './data';
const url = computed(()=> get_url_pokemon(current_palette.value?.name))
</script>
<template>
<aside>
    <img :src="url" :alt="current_pokemon_id">
    <div class="palette-container">

    </div>
</aside>
</template>
<style scoped>
aside{
    display: flex;
    flex-direction: column;
    background-color: rgb(123, 168, 38);
}
.palette-container{
    display: flex;
    flex-grow: 1;
    background-color: rgb(76, 104, 23);
    overflow-y: scroll;
}
</style>