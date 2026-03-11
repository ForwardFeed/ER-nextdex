<script lang="ts" setup>
import { computed, ref } from 'vue';

type Props = {
    rgba : [number, number, number, number],
    id  : number
}
const props = withDefaults(defineProps<Props>(), {})
const r = props.rgba[0]
const g = props.rgba[1]
const b = props.rgba[2]
const a = props.rgba[3] === 255
const color = computed(()=>`rgb(${r},${g},${b}`) 
</script>
<template>
<div>

</div>
</template>
<style scoped>

</style>