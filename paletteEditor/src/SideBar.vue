<script lang="ts" setup>
import { active_pal_data, current_sprite_side, palette_target_id, type PalTarget, type SpriteSide } from './data';
import SpriteSelection from './components/SpriteSelection.vue';
import SideBarButton from './components/SideBarButton.vue';
import { ref, watch } from 'vue';
import { ChromePicker } from 'vue-color'
import { download_pal, hexToRgb } from './utils';

const target_control: PalTarget[] = [
    "regular",
    "shiny"
]
const side_control: SpriteSide[] = [
    "front",
    "back"
]
const color = defineModel({
    default: '#68CCCA'
});
watch(()=>color.value, ()=>{
    console.log(hexToRgb(color.value))
})


</script>
<template>
<aside>
    <SpriteSelection/>
    <SideBarButton v-for="side in side_control" 
        @click="current_sprite_side = side"
        :text="side" :is_selected="current_sprite_side === side"/>
    <SideBarButton v-for="target in target_control"
        @click="palette_target_id = target"
        :text="target" :is_selected="palette_target_id === target"/>
    <ChromePicker v-model="color" :disable-alpha="true" :disable-fields="true" :formats="['rgb']"
    style="position: absolute;"/>
    <div class="palette-container"> 
        <template v-for="(rgba, id) in active_pal_data" :key="id">
            <template v-if="rgba && id !== 0">
                <div style="width: 32px;height: 32px;"
                 :style="`background-color: rgb(${rgba[0]}, ${rgba[1]}, ${rgba[2]})`">
                </div>
            </template>
        </template>
    </div>
    <SideBarButton text="Download as .PAL" @click="download_pal" style="font-size: 0.8em;"/>
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