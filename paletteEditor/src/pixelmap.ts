import type { Pal, PixelMap } from "./data";

export function create_pixel_map(image_data: ImageData,pal: Pal){
    function find_pal_id(r: number, g: number, b: number, a:number){
        return pal.findIndex(x =>{
            const rx = x![0]
            const gx = x![1]
            const bx = x![2]
            const ax = x![3]
            return rx === r &&
                gx === g &&
                bx === b &&
                ax === a 
            
        })
    }
    const pixelmap: PixelMap = []
    const data = image_data.data
    const len = data.length
    for (let i = 0; i < len; i += 4){
        const r = data[i]!;
        const g = data[i + 1]!;
        const b = data[i + 2]!;
        const a = data[i + 3]!;
        let id = find_pal_id(r,g,b,a)
        if (id === -1) {
            console.log(id)
            id = 0
        }
        pixelmap.push(id)
    }
    console.log(pixelmap)
}