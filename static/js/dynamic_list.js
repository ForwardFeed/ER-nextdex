/**
 * A dynamic list to lighten the rendering burden
 */

import { nodeLists } from "./hydrate/hydrate.js"

export const LIST_RENDER_RANGE = 20 //maximum that is loading on a direction
const RATE_LIMIT_INTERVAL = 400 // trigger the rendering of the list with this minimun in ms

export class DynamicList{
    /** @type {HTMLElement} */
    node
    /** @type {HTMLElement | undefined} */
    topBar
    /** @type {string} */
    nodeListName
    lastNbScrolled = 0
    nbRowScrolled = 0
    prevScroll = 0
    leftovers = 0
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
    scrollDirAuto = true
    constructor(node, topBar, nodeListName, scrollDirAuto = true){
        this.node = node
        this.topBar = topBar
        this.nodeListName = nodeListName
        this.scrollDirAuto = scrollDirAuto
    }
    getScroll(){
        if (this.scrollDirAuto && document.body.clientHeight > document.body.clientWidth){
            return this.node.scrollLeft
        }
        return this.node.scrollTop
    }
    setScroll(val){
        if (this.scrollDirAuto && document.body.clientHeight > document.body.clientWidth){
            return this.node.scrollLeft = val
        }
        return this.node.scrollTop = val
    }
    getDivPx(){
        // turns out that the reorder bar is always there and in the right size
        // however this will not work well at all if there's no top bar, not good design but I don't plan to export it
        if (this.scrollDirAuto && document.body.clientHeight > document.body.clientWidth){
            return this.topBar.clientWidth
        }
        return this.topBar.clientHeight
    }
    getMaxSpace(){
        if (this.scrollDirAuto && document.body.clientHeight > document.body.clientWidth){
            return this.node.scrollLeftMax
        }
        return this.node.scrollTopMax
    }
    onScroll(){
        const currScroll = this.getScroll()
        this.leftovers += currScroll - this.prevScroll
        this.prevScroll = currScroll
        const pixelPerBlock = this.getDivPx()
        const pixelMod = this.leftovers / pixelPerBlock
        if (!pixelMod) return
        const nbRowScrolled = pixelMod > 0 ?
            Math.floor(this.leftovers / pixelPerBlock) :
            Math.ceil(this.leftovers / pixelPerBlock)
        this.leftovers = this.leftovers % pixelPerBlock
        if (!nbRowScrolled) return
        this.lastNbScrolled = this.nbRowScrolled
        this.nbRowScrolled += nbRowScrolled
        fastdom.mutate(() => {
            this.update(nbRowScrolled)
        })
    }
    setup(){
        this.node.onscroll = () => {
            this.onScroll()
        }
    }
    dataUpdate(data){
        this.data = data
        return this
    }
    calculateRenderingRange(){
        const maxRow = this.data.length
        this.ranges = {
            curr: {
                min: Math.max(0, this.nbRowScrolled - LIST_RENDER_RANGE),
                max: Math.min(maxRow, this.nbRowScrolled + LIST_RENDER_RANGE)
            },
            prev: this.ranges.curr
        }
        //console.log(this.ranges.curr, this)
    }
    update(){
        this.calculateRenderingRange()
        //console.log(this.nbRowScrolled, this.ranges.curr.min, this.ranges.curr.max)
        // first hide those out of range
        if (this.nbRowScrolled && (this.nbRowScrolled == this.lastNbScrolled)) return
        if (this.nbRowScrolled > this.lastNbScrolled){//scrolled down
            const len = this.ranges.curr.min
            for (let i = this.ranges.prev.min; i < len; i++){
                if (!this.renderNextRow(i, false)) break
            }
        } else if (this.nbRowScrolled < this.lastNbScrolled){ //scrolled up
            const len = this.ranges.curr.max
            for (let i = this.ranges.prev.max; i > len; i--){
                if (!this.renderNextRow(i, false)) break
            }
        }
        const unloadOffset = this.ranges.curr.min - this.ranges.prev.min
        this.leftovers += unloadOffset * this.getDivPx()
        // then show those in range
        const len = this.ranges.curr.max
        for (let i = this.ranges.curr.min; i < len; i++){
            if (!this.renderNextRow(i, true)) break
        }
        
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
        for (let i = this.ranges.curr.min; i < this.ranges.curr.max + 1; i++){
            if (!this.renderNextRow(i, false)) break;
        }
        return this
    }
    reset(){
        this.lastNbScrolled = 0
        return this
    }
    replaceList(callbackNodes, callbackDataUpdate){
        const len = nodeLists[this.nodeListName].length
        fastdom.mutate(()=>{
            for(let i = 0; i < len; i++){
                nodeLists[this.nodeListName][i].remove()
            }
            this.node.append(callbackNodes())
            callbackDataUpdate()
            this.update()
        })
        return this
    }   
}