<script setup lang="ts">
import { fetch_palette_data } from './utils';
import DrawZone from './DrawZone.vue';
import SideBar from './SideBar.vue';

fetch_palette_data()
</script>

<template>
<SideBar/>
<DrawZone/>
</template>

<style scoped>
</style>
