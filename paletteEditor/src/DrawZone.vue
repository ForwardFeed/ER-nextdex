<script lang="ts" setup>
import { onMounted, ref, useTemplateRef } from 'vue'
import { load_image } from './utils'

const canvas_ref = useTemplateRef('canvas-ref')
const zoom_data  = {
    curr : 1,
    min  : 1,
    step : 0.1,
}
const zoom_value = ref(zoom_data.curr) 
onMounted(()=>{
    draw("ABOMASNOW")
})

async function draw(poke_name: string){
    if (canvas_ref.value === null) return
    const ctx = canvas_ref.value.getContext("2d")
    const img = await load_image(`/sprites/${poke_name}.png`)
    img.addEventListener('load', ()=>{
        if (ctx === null) return
        ctx.drawImage(img, 0, 0)
    })
}


function onScroll(event: WheelEvent){
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
<main @wheel="onScroll">
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