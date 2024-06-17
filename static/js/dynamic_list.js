/**
 * A dynamic list to lighten the rendering burden
 */

import { nodeLists } from "./hydrate/hydrate.js"

export const LIST_RENDER_RANGE = 20 //maximum that is loading on a
const RATE_LIMIT_INTERVAL = 400 // trigger the rendering of the list with this minimun in ms

export class DynamicList{
    /** @type {HTMLElement} */
    node
    /** @type {HTMLElement | undefined} */
    topBar
    /** @type {string} */
    nodeListName
    lastNbScrolled = 0
    unloadOffset = 0
    nbRowScrolled = 0
    ranges = {
        curr: {
            min: 0,
            max: LIST_RENDER_RANGE
        },
        prev: {
            min: 0,
            max: LIST_RENDER_RANGE
        }
    }
    /** @type {number[]} */
    data = []
    constructor(node, topBar, nodeListName){
        this.node = node
        this.topBar = topBar
        this.nodeListName = nodeListName
    }
    setup(){
        let timeout
        this.node.onscroll = () => {
            if (timeout) return
            timeout = setTimeout(()=>{
                fastdom.mutate(() => {
                    this.update()
                })
                timeout = undefined
            }, RATE_LIMIT_INTERVAL)  
            
        }
    }
    dataUpdate(data){
        this.data = data
        return this
    }
    calculateRenderingRange(){
        // turns out that the reorder bar is always there and in the right size
        const oneRowHeightPx =  this.topBar.clientHeight
        if (!oneRowHeightPx) return
        const nbRowScrolledFloat = this.node.scrollTop / oneRowHeightPx
        const maxRow = this.data.length
        const nbRowScrolledRaw = Math.min(maxRow, Math.round(nbRowScrolledFloat) + this.unloadOffset)
        // Minus one because it takes in account the top reordering bar
        this.nbRowScrolled = Math.max(0, nbRowScrolledRaw - 1)
        this.ranges = {
            curr: {
                min: Math.max(0, this.nbRowScrolled - LIST_RENDER_RANGE),
                max: Math.min(maxRow, this.nbRowScrolled + LIST_RENDER_RANGE)
            },
            prev: {
                min: Math.max(0, this.lastNbScrolled - LIST_RENDER_RANGE),
                max: Math.min(maxRow, this.lastNbScrolled + LIST_RENDER_RANGE)
            }
        }
        return this
    }
    update(){
        this.calculateRenderingRange()
        // first hide those out of range
        if (this.nbRowScrolled && (this.nbRowScrolled == this.lastNbScrolled)) return
        if (this.nbRowScrolled > this.lastNbScrolled){//scrolled down
            for (let i = this.ranges.prev.min; i < this.ranges.curr.min; i++){
                if (!this.renderNextRow(i, false)) break
            }
            this.unloadOffset += this.ranges.curr.min - this.ranges.prev.min
        } else if (this.nbRowScrolled < this.lastNbScrolled){ //scrolled up
            for (let i = this.ranges.prev.max; i > this.ranges.curr.max; i--){
                if (!this.renderNextRow(i, false)) break
            }
            const scrollDiff = this.lastNbScrolled - this.nbRowScrolled
            this.unloadOffset = Math.max(0, this.unloadOffset - scrollDiff)
            if (scrollDiff > LIST_RENDER_RANGE) {
                // dumb workaround but it works for me so far
                this.node.scrollTop = this.topBar.clientHeight * (LIST_RENDER_RANGE / 2)
            }
        }
        
        // then show those in range
        for (let i = this.ranges.curr.min; i < this.ranges.curr.max; i++){
            if (!this.renderNextRow(i, true)) break
        }
        this.lastNbScrolled = this.nbRowScrolled
        return this
       
    }
    renderNextRow(rowI, show=true){
        rowI = this.data[rowI]
        if (rowI === undefined) return false
        if (show){
            // we've reached the end of things to render
            if (rowI === undefined) return false
        }
        if (!nodeLists[this.nodeListName][rowI]) return false
        nodeLists[this.nodeListName][rowI].style.display = show ? "flex" : "none"
        return true
    }
    hideCurrentRendered(){
        this.calculateRenderingRange()
        for (let i = this.ranges.curr.min; i < this.ranges.curr.max; i++){
            if (!this.renderNextRow(i, false)) break;
        }
        return this
    }
    reset(){
        this.lastNbScrolled = 0
        this.unloadOffset = 0
        return this
    }
    replaceList(callback){
        const len = nodeLists[this.nodeListName].length
        fastdom.mutate(()=>{
            for(let i = 0; i < len; i++){
                nodeLists[this.nodeListName][i].remove()
            }
            this.node.append(callback())
            this.update()
        })
        return this
    }   
}