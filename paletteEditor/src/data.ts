import { computed, reactive, ref, type Ref } from "vue"


export const current_pokemon_id = ref(-1)
export const current_palette: Ref<PaletteData | null> = computed(()=>{
    return palette_data[current_pokemon_id.value] || null
})

export function get_url_pokemon(poke_name: string): string{
    return `../sprites/${poke_name}.png`
}

export type Pal =  [[number, number, number, number]?]
export type PaletteData = {
  name    : string
  regular : Pal | undefined;
  shiny   : Pal | undefined;
}


export const palette_data = reactive([] as PaletteData[])

export function fetch_palette_data(){
    fetch("/palette_data.json")
        .then((blob)=>{
            blob.json()
                .then((json_data)=>{
                    palette_data.length = 0
                    palette_data.push(...json_data as PaletteData[])
                    
                    current_pokemon_id.value = 0
                })
                .catch((err)=>{
                    console.error(`couldn't parse palette data as JSON: ${err}`)
                })
        })
        .catch((err)=>{
            console.error(`couldn't fetch palette data url ${err}`)
        })
}