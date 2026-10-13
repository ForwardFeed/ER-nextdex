<script lang="ts" setup>
import { computed } from 'vue';
import type { ChangelogRow } from '../changelog';

type Props = {
    changelog: ChangelogRow[]
}
const props = withDefaults(defineProps<Props>(), {})

type ChangesConcatenated = {
    change_type: string,
    from: string,
    to: string,
}[]

type SortedFilteredFormated = {
    name: string,
    changes: ChangesConcatenated
}

const sorted_filtered_formated = computed(()=>{
    const sff: SortedFilteredFormated[] = []
    const len = props.changelog.length
    for (let i = 0; i < len; i += 1){
        const element = props.changelog[i]
        const changes: ChangesConcatenated = [{
            change_type: element.change_type,
            from: element.from,
            to: element.to
        }]
        for (let j = i + 1; j < len; j += 1){
            const peeked = props.changelog[j]
            if (peeked.name !== element.name){
                break
            }
            i += 1
            changes.push({
                change_type: peeked.change_type,
                from: peeked.from,
                to: peeked.to
            })
        }
        sff.push({
            name: element.name,
            changes
        })
    }
    return sff.sort((a, b)=>{
        if (a.name < b.name){
            return -1
        } else if (a.name > b.name){
            return 1
        } else {
            return 0
        }
    })
})

</script>
<template>
<div class="changelog-table-container">
    <div class="changelog-table-row changelog-table-header">
        <div class="changelog-table-col changelog-table-name"><span>Name</span></div>
        <div class="changelog-table-col changelog-table-type"><span>Change Type</span></div>
        <div class="changelog-table-col changelog-table-from"><span>From</span></div>
        <div class="changelog-table-col changelog-table-to"><span>To</span></div>
    </div>
    <div class="changelog-table-row" v-for="row in sorted_filtered_formated">
        <div class="changelog-table-col changelog-table-name"><span>{{ row.name }}</span></div>
        <div class="changelog-concat-block">
            <div class="changelog-concat-row" v-for="change in row.changes">
                <div class="changelog-concat-col changelog-table-type"><span>{{ change.change_type }}</span></div>
                <div class="changelog-concat-col changelog-table-from"><span>{{ change.from }}</span></div>
                <div class="changelog-concat-col changelog-table-to"><span>{{ change.to }}</span></div>
            </div>
        </div>
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
.changelog-concat-block{
    width: 75%;
    display: flex;
    flex-direction: column;
}
.changelog-concat-row{
    width: 100%;
    display: flex;
}
.changelog-concat-col{
    width: calc((1/3) * 100%);
}
</style>