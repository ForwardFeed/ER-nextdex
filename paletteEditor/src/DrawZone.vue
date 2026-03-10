<script lang="ts" setup>
import { onMounted, ref, useTemplateRef } from 'vue'
import { load_image } from './utils'

const canvas_ref = useTemplateRef('canvas-ref')
const zoom_data  = {
    curr : 1,
    min  : 1,
    step : 0.3,
}
const zoom_value = ref(zoom_data.curr) 
onMounted(()=>{
    draw("ABOMASNOW")
})

async function draw(poke_name: string){
    if (canvas_ref.value === null) return
    const ctx = canvas_ref.value.getContext("2d")
    const img = await load_image(`../sprites/${poke_name}.png`)
    img.addEventListener('load', ()=>{
        if (ctx === null) return
        ctx.drawImage(img, 0, 0)
        set_default_zoom()
    })
}

function set_default_zoom(){
    if (canvas_ref.value === null) return
    const parent    = canvas_ref.value.parentElement as HTMLElement
    const {width: parent_h, height: parent_w}  = parent.getBoundingClientRect()
    const min_size = parent_h > parent_w ? parent_w : parent_h
    const ratio_max = min_size / 64
    zoom_data.curr = ratio_max;
    zoom_value.value = zoom_data.curr
}

function on_scroll(event: WheelEvent){
    let direction = event.deltaY > 0 ? -1 : 1;
    const {curr, min, step} = zoom_data
    let newZoom = curr + direction * step;
    if (newZoom < min) {
        return;
    }
    zoom_data.curr = newZoom;
    zoom_value.value = zoom_data.curr
}

</script>
<template>
<main @wheel="on_scroll">
    <canvas ref="canvas-ref" width="64px" height="64px">

    </canvas>
</main>
</template>
<style scoped>
main{
    flex-grow: 1;
    background-color: blueviolet;
    overflow: hidden;
    display: flex;
}
canvas{
    padding: 0;
    margin: auto;
    transform: scale(v-bind(zoom_value));
}
</style>