<script lang="ts" setup>
import { computed, ref, type Ref } from 'vue';
import { VERSIONS_AVAILABLE, type VersionAvailable } from '../versions';

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
    <div>
        <span><= show changes from this versions TO this version =></span>
    </div>
    <select :value="target_version" @change="change_target_version">
        <template v-for="version in VERSIONS_AVAILABLE">
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
</style>