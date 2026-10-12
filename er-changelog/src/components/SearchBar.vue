<script lang="ts" setup>
import SearchSVG from "../assets/search.svg"
</script>
<template>
<div class="search-container">
    <img :src="SearchSVG" alt="search" class="search-svg">
</div>
</template>
<style scoped>
.search-container{
    display: flex;
}
.search-svg{
    height: 1em;
    width: 1em;
}
</style>