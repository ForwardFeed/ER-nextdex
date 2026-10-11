<script lang="ts" setup>
import { computed, ref, type Ref } from 'vue';
import { VERSIONS_AVAILABLE, type VersionAvailable } from '../versions';
import { download_data } from '../download_data';
import { start_the_changelog } from '../changelog';

const source_version: Ref<VersionAvailable> = ref("2.65beta")
const source_versions_available = computed(()=>{
    return VERSIONS_AVAILABLE.filter(x => x !== target_version.value)
})
const target_version: Ref<VersionAvailable> = ref("2.65.4")
const target_versions = computed(()=>{
    return VERSIONS_AVAILABLE.filter(x => x !== source_version.value)
})

function change_source_version(event: Event){
    const select_element = event.target as HTMLSelectElement
    const value = select_element.value as VersionAvailable
    source_version.value = value
}

function change_target_version(event: Event){
   const select_element = event.target as HTMLSelectElement
   const value = select_element.value as VersionAvailable
   target_version.value = value
}

const is_warning = computed(()=>{
    const index_source = VERSIONS_AVAILABLE.indexOf(source_version.value)
    const index_target = VERSIONS_AVAILABLE.indexOf(target_version.value)
    
    if (index_source > index_target){
        // GENERATE WARNING
        console.log('warning')
        return true
    }
    return false
})

async function go_button(){
    await download_data(source_version.value, target_version.value)
    console.log("done")
    start_the_changelog()
}

</script>
<template>
<div id="controls-versions">
    <select :value="source_version" @change="change_source_version">
        <template v-for="version in source_versions_available">
            <option :value="version" v-if="version !== target_version">
                    {{ version }}
            </option>
        </template>
    </select>
    <div id="controls-versions-go" :class="is_warning ? 'warning': ''">
        <div class="controls-versions-msg">
            <span> <= {{ is_warning ? 'This is more recent' : 'Older version' }}</span>
        </div>
        <div @click="go_button" id="controls-version-go-btn">
            <span> {{ is_warning ? 'Are You Sure?'  : 'Go'}} </span>
        </div>
        <div  class="controls-versions-msg">
            <span> {{ is_warning ? 'This is older' : 'Newer Version' }} =></span>
        </div>
    </div>
    <select :value="target_version" @change="change_target_version">
        <template v-for="version in target_versions">
            <option :value="version"v-if="version !== source_version">
                    {{ version }}
            </option>
        </template>
    </select>
</div>
</template>
<style scoped>
#controls-versions{
    display: flex;
    margin-right: auto;
}
#controls-versions-go{
    display: flex;
}
.warning{
    background-color: yellowgreen;
    color: orangered
}
#controls-version-go-btn{
    display: flex;
    padding: 0.4em;
    background-color: aliceblue;
    border-radius: 4px;
    border: solid 1px black;
    user-select: none;
}
.controls-versions-msg{
    margin: auto;
}
span{
    margin: auto;
}
</style>