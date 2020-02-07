const X_SPACING = 100

let DB = [
    { name: 'Android', variations: [{ width: 320, height: 360 }, { width: 360, height: 360 }] },
    { name: 'Banners', variations: [{ width: 540, height: 720 }, { width: 240, height: 480 }, { width: 600, height: 200 }, { width: 400, height: 400 }] }
]

function createStand(node, id) {
    let stand = getSavedStand(id)
    let offset = 0
    stand.variations.forEach((variation, index) => {
        createVariation(node, variation.width, variation.height, offset)
        offset += variation.width + X_SPACING
    })
}

function createVariation(node, width, height, offset) {
    let clone = (node.type === 'COMPONENT') ? node.createInstance() : node.clone();
    clone.resize(width, height)
    clone.x = node.x + node.width + X_SPACING + (offset || 0)
    clone.y = node.y
}

function getSavedBoutique() {
    return DB
}

function getSavedStand(standId) {
    return DB[standId]
}

function getSavedVariation(standId, variationId) {
    return getSavedStand(standId).variations[variationId]
}

// Get saved config and render UI
figma.showUI(__html__, {width: 320, height: 480})
var boutique = getSavedBoutique()
figma.ui.postMessage({ type: 'render', boutique: boutique })


// Listen for actions in the UI
figma.ui.onmessage = msg => {

    if (msg.type === 'run-stand') {
        let source = figma.currentPage.selection
        source.forEach(node => {
            createStand(node, msg.standId)
        })
    }

    if (msg.type === 'run-variation') {
        let source = figma.currentPage.selection
        let variation = getSavedVariation(msg.standId, msg.variationId)
        source.forEach(node => {
            createVariation(node, variation.width, variation.height)
        })
    }

    if (msg.type === 'request-import') {
        console.log('code.js import')
    }


    if (msg.type === 'request-export') {
        console.log('code.js export')
    }

    // figma.closePlugin();
};
