import { ref, type Ref } from "vue";
import type { CompactGameData } from "./compactify_copied";
import type { VersionAvailable } from "./versions";


export let source_data: CompactGameData | null = null
export let target_data: CompactGameData | null = null

export type DownloadStatus = "zeroed" | "loading" | "failed" | "success"

export const download_status: Ref<DownloadStatus> = ref("zeroed")

export async function download_data(source: VersionAvailable, target: VersionAvailable){

    // prevent spamming, I hope
    if (download_status.value === 'loading'){
        return
    }

    source_data = null
    target_data = null
    download_status.value = "loading"

    const promise_source = new Promise<void>((resolve, reject)=>{
        fetch(`data/gameDataV${source}.json`, {cache: "no-store"})
            .then((response)=>{
                response.json()
                .then((data: CompactGameData)=>{
                    source_data = data
                    if (target_data !== null){
                        download_status.value = "success"
                    }
                    resolve()
                })
                .catch((err)=>{
                    download_status.value = "failed"
                    console.error(`error downloading, data is not json: ${err}`)
                    reject()
                })
            })
            .catch((err)=>{
                download_status.value = "failed"
                console.error(`error dowloading, fetching error: ${err}`)
                reject()
            })
    })
    const promise_target = new Promise<void>((resolve, reject)=>{
        fetch(`data/gameDataV${target}.json`, {cache: "no-store"})
            .then((response)=>{
                response.json()
                .then((data: CompactGameData)=>{
                    target_data = data
                    if (source_data !== null){
                        download_status.value = "success"
                    }
                    resolve()
                })
                .catch((err)=>{
                    download_status.value = "failed"
                    console.error(`error downloading, data is not json: ${err}`)
                    reject()
                })
            })
            .catch((err)=>{
                download_status.value = "failed"
                console.error(`error dowloading, fetching error: ${err}`)
                reject()
            })
    })

    
    await Promise.allSettled([promise_source, promise_target])

}
