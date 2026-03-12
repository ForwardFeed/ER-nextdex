<script lang="ts" setup>
import { current_pokemon_palette_data, all_pokemon_palette_data, reverse_table_poke_to_data, current_pokemon_id, palette_target_id } from '@/data';
import { get_url_pokemon } from '@/utils';
import { computed, ref, useTemplateRef } from 'vue';
import SideBarButton from './SideBarButton.vue';

const input_ref = useTemplateRef("search-input")
const url       = computed(()=> get_url_pokemon(current_pokemon_palette_data.value?.NAME))
const is_select = ref(false)
const filter    = ref(/.*/)

function on_select(name: string){
    const id = reverse_table_poke_to_data[name]
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
    } catch{}
}
function on_search_click(){
    if (input_ref.value === null) return
    input_ref.value.focus()
}


</script>
<template>
<div :class="is_select ? 'sprite-selection-container-active' : 'sprite-selection-container' " class="selection-bg">
    <img :src="url" :alt="current_pokemon_palette_data.name" @click="is_select = true" v-show="!is_select">
    <div v-show="is_select" @click="is_select = false" class="sprite-selection-list">
        <div class="sprite-selection-search" @click="(ev)=>{ev.stopImmediatePropagation()}">
             <SideBarButton text="Search" @click="on_search_click"/>
            <input type="text" @keyup="on_search_keyup" ref="search-input">
            <SideBarButton text="Click To Return" @click="is_select = false"/>
        </div>
        <div class="sprite-selection-list-container">
            <img v-for="{name, NAME} in all_pokemon_palette_data"
            :src="get_url_pokemon(NAME)" :alt="name" 
            @click="on_select(NAME)"
            v-show="filter.test(name.toLowerCase())"
            loading="lazy">
        </div>
       
    </div>
</div>
</template>
<style scoped>
.selection-bg{
    width: 100%;
    
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
.sprite-selection-container{
    position: relative;
    min-width: 64px;
}
.sprite-selection-container-active{
    position: absolute;
    z-index: 10;
}
.sprite-selection-search{
    display: flex;
    min-height: 64px;
} 
.sprite-selection-list{
    overflow: scroll;
}
.sprite-selection-list-container{
    overflow: hidden;
    background-color: var(--main-bg);
}
.sprite-selection-list-container > img:hover{
    transition: transform 0.5s ease-out;
    transform: scale(1.8);
}
input[type="text"]{
    border: none;
    margin: auto;
    font-size: 32px;
}
input[type="text"]::-moz-focus-inner{
    border: none;
}
</style>