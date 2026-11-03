import { ref, type Ref } from "vue";
import type { CompactGameData } from "./compactify_copied";
import { VERSIONS_AVAILABLE, type VersionAvailable } from "./versions";


export const source_version: Ref<VersionAvailable> = ref(VERSIONS_AVAILABLE[VERSIONS_AVAILABLE.length - 2])
export const target_version: Ref<VersionAvailable> = ref(VERSIONS_AVAILABLE[VERSIONS_AVAILABLE.length - 1])

export let source_data: CompactGameData | null = null
export let target_data: CompactGameData | null = null

export type DownloadStatus = "zeroed" | "loading" | "failed" | "success"

export const download_status: Ref<DownloadStatus> = ref("zeroed")
export const progress_source = ref(0)
export const progress_target = ref(0)

export async function download_data(source: VersionAvailable, target: VersionAvailable){

    source_data = null
    target_data = null
    progress_source.value = 0
    progress_target.value = 0
    download_status.value = "loading"

    const TABLE_URLS_PROGRESS = [
        {url: `../js/data/gameDataV${source}.json`, pro: progress_source, dat: (x: CompactGameData)=>{source_data = x}},
        {url: `../js/data/gameDataV${target}.json`, pro: progress_target, dat: (x: CompactGameData)=>{target_data = x}},
    ]

    const download_promises = TABLE_URLS_PROGRESS.map(x => fetch_with_progress(x.url, x.pro))
    await Promise.allSettled(download_promises)
        .then((results)=>{
            
            let failure = false
            const len = results.length
            for (let i = 0; i < len; i += 1){
                const result = results[i]
                if (result.status === 'fulfilled'){
                    TABLE_URLS_PROGRESS[i].dat(result.value)
                } else {
                    console.error(`Failed to download URL: ${TABLE_URLS_PROGRESS[i].url}: reason: ${result.reason}`)
                    failure = true
                }
            }
            if (failure === true){
                download_status.value = "failed"
            } else {
                download_status.value = "success"
            }
        })

}

async function fetch_with_progress(url: string, progress_perçent: Ref<number>){
    return new Promise<CompactGameData>((resolve, reject)=>{
        fetch(url, {cache: "no-store"})
            .then(async (response)=>{
                if (response.body === null){
                    reject(`response body was null`)
                    return
                }
                const reader = response.body.getReader();
                const content_len = response.headers.get('Content-Length');
                if (content_len === null){
                    reject(`Content length was null`)
                    return

                }
                
                let received_len = 0
                const chunks = []
                while(true){
                    const {done, value} = await reader.read()
                    if (done === true){
                        break
                    }
                    chunks.push(value)
                    received_len += value.length
                    progress_perçent.value = (received_len / (+content_len)) * 100
                }

                const chunks_all = new Uint8Array(received_len);
                let position = 0;
                for (const chunk of chunks) {
                    chunks_all.set(chunk, position);
                    position += chunk.length;
                }
                
                const json_string = new TextDecoder("utf-8").decode(chunks_all);
                let json_data;
                try{
                    json_data = JSON.parse(json_string)
                }catch(err){
                    reject(`error downloading, data is not json: ${err}`)
                }
                resolve(json_data)
            })
            .catch((err)=>{
                reject(`error dowloading, fetching error: ${err}`)
            })
        }
    )
}