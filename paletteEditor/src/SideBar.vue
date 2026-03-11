<script lang="ts" setup>
import { active_pal_data, current_pal_data, current_pokemon_palette_data, palette_target_id, type PalTarget } from './data';
import SpriteSelection from './components/SpriteSelection.vue';
import { palette_to_text } from './export_data';

const target_control: PalTarget[] = [
    "regular",
    "shiny"
]

function download_pal(){
    const text  = palette_to_text(active_pal_data.value)
    const name  = `${current_pokemon_palette_data.value.NAME}_${palette_target_id.value.toUpperCase()}`
    const type  =  "text/plain"
    const blob  = new Blob([text], { type })
    const dummy = document.createElement('a')
    
    dummy.download  = name
    dummy.href      = window.URL.createObjectURL(blob);
    dummy.click()
}

</script>
<template>
<aside>
    <SpriteSelection/>
    <div class="palette-controls">
        <div v-for="target in target_control" class="palette-controls-target" @click="palette_target_id = target">
            {{ target }}
        </div>
    </div>
    <div class="palette-container"> 
        <template v-for="(rgba, id) in active_pal_data" :key="id">
            <template v-if="rgba && id !== 0">
                <div style="width: 32px;height: 32px;"
                 :style="`background-color: rgb(${rgba[0]}, ${rgba[1]}, ${rgba[2]})`">
                </div>
            </template>
            <!-- <PaletteColor  v-if="rgba && id !== 0" :rgba :id/> -->
        </template>
    </div>
    <div class="palette-export">
        <div @click="download_pal">
            <span>
                Download as .PAL
            </span>
        </div>
    </div>
</aside>
</template>
<style scoped>
aside{
    display: flex;
    flex-direction: column;
    background-color: rgb(123, 168, 38);
    overflow-y: scroll;
    scrollbar-width: none; /* Firefox */
    -ms-overflow-style: none;  /* IE 10+ */
    width: 64px;
}
aside::-webkit-scrollbar {
    width: 0px;
    background: transparent; /* make scrollbar transparent */
}
.palette-container{
    display: flex;
    background-color: rgb(76, 104, 23);
    width: 64px;
    flex-wrap: wrap;
}
.palette-controls{
    display: flex;
    flex-direction: column;
}
.palette-controls-target, .palette-export{
    width: 100%;
    cursor: pointer;
    user-select: none;
}
.palette-export{
    word-wrap: break-word;
    font-size: 0.7em;
}
.palette-export:hover, .palette-controls-target:hover{
    background-color: aqua;
}
</style>