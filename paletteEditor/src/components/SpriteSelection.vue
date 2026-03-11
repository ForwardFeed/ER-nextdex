<script lang="ts" setup>
import { get_url_pokemon, current_palette, palette_data, reverse_poke_to_data, current_pokemon_id, palette_target_id } from '@/data';
import { computed, ref } from 'vue';

const url       = computed(()=> get_url_pokemon(current_palette.value?.NAME))
const on_select = ref(false)
const filter    = ref(/.*/)

function on_select_new(name: string){
    const id = reverse_poke_to_data[name]
    if (id === undefined) return
    current_pokemon_id.value = id
}
function on_search_keyup(event: KeyboardEvent){
    const target = event.target as HTMLInputElement
    const value  = target.value

    if (value === ""){
        filter.value = /.*/
        return
    }
    try {
        filter.value = new RegExp(value)
    } catch{

    }
    
}

</script>
<template>
<div class="sprite-selection-container">
    <img :src="url" :alt="current_palette.name" @click="on_select = true" v-show="!on_select">
    <div v-show="on_select" @click="on_select = false" class="sprite-selection-list">
        <div class="sprite-selection-search" @click="(ev)=>{ev.stopImmediatePropagation()}">
            <span> Search </span>
            <input type="text" @keyup="on_search_keyup">
            <span @click="on_select = false"> 
                Click to Return
            </span>
        </div>
        <div class="sprite-selection-list-container">
            <img v-for="{name, NAME} in palette_data"
            :src="get_url_pokemon(NAME)" :alt="name" 
            @click="on_select_new(NAME)"
            v-show="filter.test(name.toLowerCase())"
            loading="lazy">
        </div>
       
    </div>
</div>
</template>
<style scoped>
.sprite-selection-container{
    position: relative;
    height: 100%;
    min-width: 64px;
}
.sprite-selection-search{
    background-color: blueviolet;
}
.sprite-selection-list{
    background-color: var(--main-bg);
    overflow: scroll;
}
.sprite-selection-list-container{
    overflow: hidden;
}
.sprite-selection-list-container > img:hover{
    transition: transform 0.5s ease-out;
    transform: scale(1.8);
}
input[type="text"]{
    height: 1em;
    border: none;
}
input[type="text"]::-moz-focus-inner{
    border: none;
}
</style>