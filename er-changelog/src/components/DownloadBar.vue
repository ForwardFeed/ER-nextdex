<script lang="ts" setup>
import { computed } from 'vue';

type Props = {
    percent: number,
    name: string
}
const props = withDefaults(defineProps<Props>(), {})
const percent = computed(()=> `${props.percent}%`)
</script>
<template>
<div class="download-bar-container">
    <div class="download-bar">
        <span>Downloading gameData{{ props.name }}.json</span>
        <div class="download-count">
            {{ props.percent.toFixed(1) }} %
        </div>
    </div>
    
</div>
</template>
<style scoped>
.download-bar-container{
    width: calc(100% - 4ch);
    padding: 0 2ch;
    display: flex;
    background-color: var(--bg-200);
}
.download-bar{
    display: flex;
    flex-grow: 1;
    background: var(--t-200);
    background: linear-gradient(90deg,var(--t-200) v-bind(percent), var(--bg-200) 0%);
}
span{
    margin: auto 0;
}
.download-count{
    margin-right: 0;
    margin-left: auto
}
</style>