figma.showUI(__html__);

const X_SPACING = 100

let DB = [
    { name: 'Android', variations: [{ width: 320, height: 360 }, { width: 360, height: 360 }] },
    { name: 'Banners', variations: [{ width: 540, height: 720 }, { width: 240, height: 480 }] }
]

function createStand(source, id) {

}

function createVariation(source, width, height) {
    console.log(source, width, height)
    source.forEach(node => {
        let clone = (node.type === 'COMPONENT') ? node.createInstance() : node.clone();
        clone.resize(width, height)
        clone.x = node.x + node.width + X_SPACING
        clone.y = node.y
    })
}

function getSavedVariation(standId, variationId) {
    return DB[standId].variations[variationId]
}


figma.ui.onmessage = msg => {
    if (msg.type === 'message-name') {
        alert('trigger')
    }

    if (msg.type === 'run-stand') {
        alert('run stand')
        // let id = msg.standId
        // createStand(source, id)
    }

    if (msg.type === 'run-variation') {
        let source = figma.currentPage.selection
        let variation = getSavedVariation(msg.standId, msg.variationId)
        createVariation(source, variation.width, variation.height)
    }

    // figma.closePlugin();
};
