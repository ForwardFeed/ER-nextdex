<script lang="ts" setup>
import { PANEL_TEXT, PANELS_LIST, panels_state, type PanelID } from '../panels';

function toggle_panels(panel: PanelID){
    panels_state[panel].value = ! panels_state[panel].value
}

</script>
<template>
<div id="controls-panels">
    <div v-for="panel in PANELS_LIST" class="panel-btn"
     :class="panels_state[panel].value === true ? 'panel-btn-active' : ''"
     @click="()=>toggle_panels(panel)">
        <span>{{ PANEL_TEXT[panel] }}</span>
    </div>
</div>
</template>
<style scoped>
#controls-panels{
    display: flex;
    margin-left: auto;
}
.panel-btn{
    user-select: none;
    padding: 0.25em;
    border-radius: 4px;
    color: var(--t-200);
}
.panel-btn-active{
    background-color: var(--bg-200)
}
span{
    margin: auto;
}
</style>