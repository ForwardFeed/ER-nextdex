import { all_pokemon_palette_data, type PokemonPaletteData, current_pokemon_id, reverse_table_poke_to_data, type SpriteSide, active_pixel_map, active_pal_data, current_pokemon_palette_data, palette_target_id } from "./data";
import { palette_to_text } from "./export_data";

export function bad_copy<T = unknown>(t: T): T{
    return JSON.parse(JSON.stringify(t))
}

export async function load_image(url: string): Promise<HTMLImageElement>{
    const response = await fetch(url);
    const blob = await response.blob();
    const image = new Image();
    image.src = URL.createObjectURL(blob);
    return image;
}


function init_reverse_table(){
    // clean previous table
    for (const member in reverse_table_poke_to_data) delete reverse_table_poke_to_data[member]
    all_pokemon_palette_data.value.forEach((x, i) => reverse_table_poke_to_data[x.NAME] = i)
}

export function fetch_palette_data(){
    fetch("/palette_data.json")
        .then((blob)=>{
            blob.json()
                .then((json_data)=>{
                    all_pokemon_palette_data.value = json_data as PokemonPaletteData[]
                    current_pokemon_id.value       = 0
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

export function get_url_pokemon(poke_name: string): string{
    return `../sprites/${poke_name}.png`
}

export function fetch_pixel_pal_map_data(poke_name: string, side: SpriteSide){
    fetch(`/pixels/${poke_name}_${side}.json`)
        .then((blob)=>{
            blob.json()
                .then((json_data)=>{
                    active_pixel_map.value = json_data
                })
                .catch((err)=>{
                    console.error(`couldn't parse palette data as JSON: ${err}`)
                })
        })
        .catch((err)=>{
            console.error(`couldn't fetch palette data url ${err}`)
        })
}

export function hexToRgb(hex: string){
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return { r, g, b };
}

export function download_pal(){
    const text  = palette_to_text(active_pal_data.value)
    const name  = `${current_pokemon_palette_data.value.NAME}_${palette_target_id.value.toUpperCase()}`
    const type  =  "text/plain"
    const blob  = new Blob([text], { type })
    const dummy = document.createElement('a')
    
    dummy.download  = name
    dummy.href      = window.URL.createObjectURL(blob);
    dummy.click()
}