import { computed, reactive, ref, type Ref } from "vue"


export const current_pokemon_id = ref(-1)
export const current_palette: Ref<PaletteData > = computed(()=>{
    return palette_data[current_pokemon_id.value] || {
        NAME: "",
        name: "",
        regular: undefined,
        shiny: undefined
    } satisfies PaletteData
})

export function get_url_pokemon(poke_name: string): string{
    return `../sprites/${poke_name}.png`
}

export type Pal =  [[number, number, number, number]?]
export type PaletteData = {
  name    : string,
  NAME    : string
  regular : Pal | undefined;
  shiny   : Pal | undefined;
}



export const palette_data = reactive([] as PaletteData[])
export type PalTarget = "regular" | "shiny"
export const all_palette: Record<PalTarget, Pal> = {
    regular  : [],
    shiny    : [],
}
export const palette_target_id: Ref<PalTarget> = ref("shiny")
export const palette_target   : Ref<Pal> = computed(()=>all_palette[palette_target_id.value])
export const reverse_poke_to_data: Record<string, number> = {}

export function fetch_palette_data(){
    fetch("/palette_data.json")
        .then((blob)=>{
            blob.json()
                .then((json_data)=>{
                    palette_data.length = 0
                    palette_data.push(...json_data as PaletteData[])

                    current_pokemon_id.value = 0

                    init_reverse_table()
                })
                .catch((err)=>{
                    console.error(`couldn't parse palette data as JSON: ${err}`)
                })
        })
        .catch((err)=>{
            console.error(`couldn't fetch palette data url ${err}`)
        })
}

function init_reverse_table(){
    // clean previous table
    for (const member in reverse_poke_to_data) delete reverse_poke_to_data[member]
    palette_data.forEach((x, i) => reverse_poke_to_data[x.NAME] = i)
}