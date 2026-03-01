import { PNG } from "pngjs"
import * as FS from "fs";
import ReadableStreamClone from "readable-stream-clone/lib/readable-stream-clone";

type Pal =  [[number, number, number, number]?]

function readPalFile(palFileData: string){
    const palData: Pal = []
    const lines = palFileData.split("\n")
    const len = +lines[2]
    // skipping the header
    for (let i = 3; i < len + 3; i++){
        const line = lines[i].trim().split(' ')
        const r = +line[0]
        const g = +line[1]
        const b = +line[2]
        const a = +line[3] || 255
        palData.push([r,g,b,a])
    }
    return palData
}

function applyPal(png: PNG, outPath: string, imgPal: Pal, pal: Pal, firstColorIsTransparent: boolean){
    //cutting sprites anims that are 64 x 128
    const pngCut = new PNG({width: 64, height: 64})
    png.bitblt(pngCut, 0, 0, 64, 64, 0, 0)
    for (let y = 0; y < pngCut.height; y++){
        for(let x = 0; x < pngCut.width; x++){
            const idx = (pngCut.width * y + x) << 2;
            const r = pngCut.data[idx]
            const g = pngCut.data[idx + 1];
            const b = pngCut.data[idx + 2];
            const palIndex = imgPal.findIndex(x => x && x[0] == r && x[1] == g && x[2] == b)
            //put transparency on the color 1 (index 0)  if it's set
            if (firstColorIsTransparent && palIndex === 0){
                pngCut.data[idx + 3] = 0
            } else {
                for (let i = 0; i < 3; i++){
                    pngCut.data[idx + i] = pal[palIndex]?.[i] || pngCut.data[idx + i]
                }
            }
        }
    }
    pngCut.pack().pipe(FS.createWriteStream(outPath))
} 

function nameByPalNumber(base: string, n: number){
    const map = [
        base,
        base.replace(".png", "_SHINY.png")
    ]
    return map[n] || n + base
}

export function applyPals(inPath: string, baseOutPath: string, pals:Pal[], firstColorIsTransparent: boolean){
    const image = FS.createReadStream(inPath)
    // open the file one time but parse it in a different PNG instance each time
    // because rewriting over the same instance may cause issue with palette interference
    for (let palIndex = 0; palIndex < pals.length; palIndex++){
        const png = new ReadableStreamClone(image)
        .pipe(new PNG())
        .on("parsed", function(){
            //@ts-expect-error
            const imgPal = this._parser._parser._palette as Pal
            const pal = pals[palIndex]
            const outPath = nameByPalNumber(baseOutPath, palIndex)
            applyPal(this, outPath, imgPal, pal, firstColorIsTransparent)
        })
        .on("error", function(err){
            console.error(`applyPals: error while applying pals of ${inPath} with palIndex ${palIndex}: ${err}`)
        })
    } 
}

export function openPalettes(spritesFilesPaths: string[]): Promise<Pal[]>{
    return new Promise((resolve, reject)=>{
        const palPromises = spritesFilesPaths.map(x => FS.promises.readFile(x, "utf8"))
        Promise.all(palPromises)
            .then((fileDatas: string[])=>{
                resolve(fileDatas.map(x => readPalFile(x)))
            })
            .catch((err)=>{
                reject(err)
            })
    })
}