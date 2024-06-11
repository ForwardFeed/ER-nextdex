/**
 * A dynamic list to lighten the rendering burden
 */



export class DynamicList{
    /** @type {HTMLElement} */
    node;
    /** @type {HTMLElement | undefined} */
    reorderBar
    constructor(node, reorderBar = undefined){
        this.node = node
    }
}