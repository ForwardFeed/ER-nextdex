<script lang="ts" setup>
import { computed } from 'vue';
import { current_palette, current_pokemon_id, get_url_pokemon, palette_target } from './data';
import SpriteSelection from './components/SpriteSelection.vue';
import PaletteColor from './components/PaletteColor.vue';
const url = computed(()=> get_url_pokemon(current_palette.value?.NAME))
</script>
<template>
<aside>
    <SpriteSelection/>
    <div class="palette-container">
        <template v-for="(rgba, id) in palette_target">
            <PaletteColor  v-if="rgba" :rgba :id/>
        </template>
        
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