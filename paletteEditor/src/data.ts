import { computed, reactive, ref, shallowRef, watch, type Reactive, type Ref } from "vue"
import { bad_copy } from "./utils"

export type PalRGB             = [number, number, number, number]
export type Pal                = [PalRGB?]
export type PokemonPaletteData = {
  name    : string,
  NAME    : string
  regular : Pal | undefined;
  shiny   : Pal | undefined;
}
export type PalTarget           = "regular" | "shiny"
export type PixelMap            = number[]


export const all_pokemon_palette_data = ref([] as PokemonPaletteData[])
export const current_pokemon_id: Ref<number> = ref(-1)

export const current_pokemon_palette_data: Ref<PokemonPaletteData > = ref(
    {
        NAME: "",
        name: "",
        regular: [],
        shiny: []
    } satisfies PokemonPaletteData
)

export const current_pal_data: Record<PalTarget, Ref<Pal>> = {
    regular  : ref([]),
    shiny    : ref([]),
}
export const current_pixelmap_data: Record<PalTarget, Ref<PixelMap>> = {
    regular  : ref([]),
    shiny    : ref([]),
}
export const active_pal_data: Ref<Pal> = ref([])

export const palette_target_id : Ref<PalTarget>  = ref("regular")
export const reverse_table_poke_to_data: Record<string, number> = {}


watch(current_pokemon_id, (id)=>{
    const new_val = all_pokemon_palette_data.value[id]
    if (new_val === undefined) return
    current_pokemon_palette_data.value = bad_copy(new_val)
    if (new_val.regular !== undefined)
        current_pal_data.regular.value = bad_copy(new_val.regular)
    if (new_val.shiny !== undefined)
        current_pal_data.shiny.value = bad_copy(new_val.shiny)
    
    active_pal_data.value = bad_copy(current_pal_data[palette_target_id.value].value)
})

watch(palette_target_id, (id)=>{
    active_pal_data.value = bad_copy(current_pal_data[palette_target_id.value].value)
})