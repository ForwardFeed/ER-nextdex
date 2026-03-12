<script lang="ts" setup>
import { active_pal_data, current_sprite_side, emit_redraw, palette_target_id, type PalTarget, type SpriteSide } from './data';
import SpriteSelection from './components/SpriteSelection.vue';
import SideBarButton from './components/SideBarButton.vue';
import { computed, ref, watch, type Ref } from 'vue';
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
const palette_id_selected: Ref<number | null> = ref(null)
const color = defineModel({
    default: '#68CCCA'
});
const opposite_color = computed(()=>{
    const pal_id = palette_id_selected.value
    if (pal_id=== null)
        return '#000'
    const pal = active_pal_data.value[pal_id]!
    const r = ((pal[0] ^ 255) + 128) & 255  
    const g = ((pal[1] ^ 255) + 128) & 255  
    const b = ((pal[2] ^ 255) + 128) & 255
    return `rgb(${r},${g},${b})`
})
watch(()=>color.value, ()=>{
    const pal_id = palette_id_selected.value
    if (pal_id=== null)
        return
    const {r,g,b}= hexToRgb(color.value)
    active_pal_data.value[pal_id] = [
        r,
        g,
        b,
        255
    ]
    emit_redraw.value += 1
})

function on_palette_select(id: number){
    if (palette_id_selected.value === null){
        palette_id_selected.value = id
    } else {
        palette_id_selected.value = null
    }
    
}

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
    style="position: absolute;" v-show="palette_id_selected !== null"/>
    <div class="palette-container"> 
        <template v-for="(rgba, id) in active_pal_data" :key="id">
            <template v-if="rgba && id !== 0">
                <div @click="on_palette_select(id)"
                :style="`background-color: rgb(${rgba[0]}, ${rgba[1]}, ${rgba[2]})`"
                class="palette-target"
                :class="palette_id_selected === id ? 'palette-selected': ''" >
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
    width: 64px;
    flex-wrap: wrap;
}
.palette-target{
    width: 32px;
    height: 32px;
}
.palette-selected{
    border: solid 1px v-bind(opposite_color);
    width: 30px;
    height: 30px;
}
</style>