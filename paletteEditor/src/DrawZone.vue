<script lang="ts" setup>
import { onMounted, ref, useTemplateRef, watch } from 'vue'
import { get_url_pokemon, load_image } from './utils'
import { active_pal_data, active_pixel_map, current_pokemon_palette_data, palette_target_id } from './data'

const canvas_ref = useTemplateRef('canvas-ref')
const zoom_data  = {
    curr : 1,
    min  : 1,
    step : 0.3,
}
const zoom_value = ref(zoom_data.curr) 
onMounted(()=>{
    set_default_zoom()
    watch(current_pokemon_palette_data, (ne)=>{
       draw()
    })
    watch(active_pixel_map, ()=>{
        draw()
    })
    watch(palette_target_id, ()=>{
        draw()
    })
})

async function draw(){
    if (canvas_ref.value === null) return
    const ctx = canvas_ref.value.getContext("2d")
    if (ctx === null) return
    
    const img_data = ctx?.getImageData(0,0, 64, 64)
    const data = img_data.data
    const len = data.length
    const pal_full = active_pal_data.value
    const pixel_pal_map = active_pixel_map.value
    pixel_pal_map.forEach((pal_index, i)=>{
        const pal = pal_full[pal_index]!
        let r          = pal[0]
        let g          = pal[1]
        let b          = pal[2]
        let a          = pal[3]
        if (pal_index === 0){
            a          = 0
        }
        data[(i* 4)]     = r;
        data[(i* 4) + 1] = g;
        data[(i* 4) + 2] = b;
        data[(i* 4) + 3] = a;
    })
    ctx.putImageData(img_data, 0, 0)
}

function apply_palette(img: HTMLImageElement, ctx: CanvasRenderingContext2D){
    ctx.clearRect(0,0, 64, 64)
    ctx.drawImage(img, 0, 0)
    const data = ctx.getImageData(0, 0, 64, 64)
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
    overflow: hidden;
    display: flex;

    background-color: #020101;
    opacity: 1;
    background-image:  linear-gradient(135deg, #383838 25%, transparent 25%), linear-gradient(225deg, #383838 25%, transparent 25%), linear-gradient(45deg, #383838 25%, transparent 25%), linear-gradient(315deg, #383838 25%, #020101 25%);
    background-position:  27px 0, 27px 0, 0 0, 0 0;
    background-size: 54px 54px;
    background-repeat: repeat;
}
canvas{
    padding: 0;
    margin: auto;
    transform: scale(v-bind(zoom_value));
}
</style>