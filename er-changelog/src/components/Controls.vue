<script lang="ts" setup>


import ControlsPanels from './ControlsPanels.vue';
import ControlsVersions from './ControlsVersions.vue';


</script>
<template>
<div id="controls">
    <ControlsVersions/>
    <ControlsPanels/>
</div>
</template>
<style scoped>
#controls{
    display: flex;
    width: 100%;
}
</style>