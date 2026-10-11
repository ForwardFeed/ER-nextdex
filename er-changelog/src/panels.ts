import { ref, type Ref } from "vue"



export const PANELS_LIST = [
    "species",
    "abilities",
    "moves",
    "trainers"
] as const 

export type PanelID = (typeof PANELS_LIST)[number]

export const PANEL_TEXT: Record<PanelID, string> = {
    species: "Species",
    abilities: "Abilities",
    moves: "Moves",
    trainers: "Trainers"
}

export const panels_state: Record<PanelID, Ref<boolean>> = {
    species: ref(true),
    abilities: ref(false),
    moves: ref(false),
    trainers: ref(false)
}