<script lang="ts" setup>
import type { ChangelogRow } from '../changelog';

type Props = {
    changelog: ChangelogRow[]
}
const props = withDefaults(defineProps<Props>(), {})
</script>
<template>
<div class="changelog-table-container">
    <div class="changelog-table-row changelog-table-header">
        <div class="changelog-table-col changelog-table-name"><span>Name</span></div>
        <div class="changelog-table-col changelog-table-type"><span>Change Type</span></div>
        <div class="changelog-table-col changelog-table-from"><span>From</span></div>
        <div class="changelog-table-col changelog-table-to"><span>To</span></div>
    </div>
    <div class="changelog-table-row" v-for="row in changelog">
        <div class="changelog-table-col changelog-table-name"><span>{{ row.name }}</span></div>
        <div class="changelog-table-col changelog-table-type"><span>{{ row.change_type }}</span></div>
        <div class="changelog-table-col changelog-table-from"><span>{{ row.from }}</span></div>
        <div class="changelog-table-col changelog-table-to"><span>{{ row.to }}</span></div>
    </div>
</div>
</template>
<style scoped>
.changelog-table-row{
    display: flex;
    border: solid 1px var(--border);
}
.changelog-table-col{
    width: 25%;
    display: flex;
}
.changelog-table-col>*{
    margin: auto 0;
}
.changelog-table-header{
    font-size: 2em;
}

</style>