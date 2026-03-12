import type { Pal } from "./data";


export function palette_to_text(pal: Pal): string{
    const PAL_HEADER = `\
JASC-PAL
0100
16`
    return `${PAL_HEADER}
${pal.filter(x => x !== undefined).map(x => `${x[0]} ${x[1]} ${x[2]}`).join('\n')}`
}