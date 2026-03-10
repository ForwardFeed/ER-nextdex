import { ref } from "vue"


export const current_pokemon = ref("ABOMASNOW")


export function get_url_pokemon(poke_name: string): string{
    return `../sprites/${poke_name}.png`
}