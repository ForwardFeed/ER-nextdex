<script lang="ts" setup>
import { active_pal_data, current_pal_data, current_pokemon_palette_data, current_sprite_side, palette_target_id, type PalTarget, type SpriteSide } from './data';
import SpriteSelection from './components/SpriteSelection.vue';
import { palette_to_text } from './export_data';
import SideBarButton from './components/SideBarButton.vue';

const target_control: PalTarget[] = [
    "regular",
    "shiny"
]
const side_control: SpriteSide[] = [
    "back",
    "front"
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
    <SideBarButton :text="side" v-for="side in side_control" @click="current_sprite_side = side"/>
    <SideBarButton :text="target" v-for="target in target_control" @click="palette_target_id = target"/>
    <div class="palette-container"> 
        <template v-for="(rgba, id) in active_pal_data" :key="id">
            <template v-if="rgba && id !== 0">
                <div style="width: 32px;height: 32px;"
                 :style="`background-color: rgb(${rgba[0]}, ${rgba[1]}, ${rgba[2]})`">
                </div>
            </template>
        </template>
    </div>
    <SideBarButton text="Download as .PAL" @click="download_pal"/>
</aside>
</template>
<style scoped>
aside{
    display: flex;
    flex-direction: column;
    width: 64px;
    overflow-y: scroll;

    scrollbar-width: none; /* Firefox */
    -ms-overflow-style: none;  /* IE 10+ */

    background-color: var(--sidebar-bg);
    opacity: 1;
    background-image:  linear-gradient(
        var(--sidebar-bar) 5.4px, transparent 5.4px),
        linear-gradient(90deg, var(--sidebar-bar) 5.4px, transparent 5.4px),
        linear-gradient(var(--sidebar-bar) 2.7px, transparent 2.7px),
        linear-gradient(90deg, var(--sidebar-bar) 2.7px, var(--sidebar-bg) 2.7px);
    background-size: 135px 135px, 135px 135px, 27px 27px, 27px 27px;
    background-position: -5.4px -5.4px, -5.4px -5.4px, -2.7px -2.7px, -2.7px -2.7px;
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
</style>