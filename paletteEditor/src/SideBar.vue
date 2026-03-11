<script lang="ts" setup>
import { active_pal_data, current_pal_data, palette_target_id, type PalTarget } from './data';
import SpriteSelection from './components/SpriteSelection.vue';

const target_control: PalTarget[] = [
    "regular",
    "shiny"
]

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
    background-color: rgb(76, 104, 23);
    overflow-y: scroll;
    width: 64px;
    flex-wrap: wrap;
}
.palette-controls{
    display: flex;
    flex-direction: column;
}
.palette-controls-target{
    width: 100%;
    cursor: pointer;
    user-select: none;
}
.palette-controls-target:hover{
    background-color: aqua;
}
</style>