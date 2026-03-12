<script lang="ts" setup>
type Props = {
    text: string,
    is_selected?: boolean
}
const props = withDefaults(defineProps<Props>(), {})
</script>
<template>
<div :class="is_selected ? 'sbb-selected' : ''">
    <span>
        {{ text }}
    </span>
</div>
</template>
<style scoped>
div{
    border-radius: 4px;
    background-color: var(--sidebar-bar);
    border: solid 2px;
    border-color: var(--sidebar-bg);
    display: flex;
    padding: 4px;
    margin: 4px;
}
div:hover, .sbb-selected{
    color: var(--sidebar-bar);
    background-color: var(--sidebar-bg);
    border-color: var(--sidebar-bar);
}
span{
    word-wrap: break-word;
    overflow: hidden;
    user-select: none;
    cursor: pointer;
    font-size: 0.7em;
    margin: auto;
}
</style>