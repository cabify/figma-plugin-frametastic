const X_SPACING = 100

// core functions
async function createStand(node, id) {
    let stand = await getSavedStand(id)
    let offset = 0
    let bufferNodes = []
    stand.variations.forEach((variation, index) => {
        let newNode = createVariation(node, variation, offset)
        offset += variation.width + X_SPACING
        bufferNodes.push(newNode)
    })

    return bufferNodes
}

function createVariation(node, variation, offset) {
    let newNode
    let {width, height, name} = variation
    if (node) {
        newNode = (node.type === 'COMPONENT') ? node.createInstance() : node.clone();
        newNode.name = (name) ? `${node.name}-${name}` : `${node.name}-${width}x${height}`;
        newNode.x = Math.round(node.x + node.width + X_SPACING + (offset || 0))
        newNode.y = Math.round(node.y)
    } else {
        newNode = figma.createFrame()
        if (name) newNode.name = name
        newNode.x = Math.round(figma.viewport.bounds.x + (figma.viewport.bounds.width/2) + X_SPACING + (offset || 0))
        newNode.y = Math.round(figma.viewport.bounds.y + (figma.viewport.bounds.height/2))
    }

    newNode.resize(width, height)

    return newNode
}

function dumpBoutique() {
    figma.clientStorage.setAsync('boutique', []).catch(err => { console.log('error dumping data') })
}

function saveBoutique(boutique) {
    figma.clientStorage.setAsync('boutique', JSON.stringify(boutique)).catch(err => { console.log('error setting data') })
}

function getSavedBoutique() {
    return new Promise((success, error) => {
        figma.clientStorage.getAsync('boutique').then(boutique => {
            let data = (boutique) ? JSON.parse(boutique) : [] ;
            success(data)
        }).catch(err => {
            error(err)
        })
    })
}

async function getSavedStand(standId) {
    let boutique = await getSavedBoutique()
    return boutique[standId]
}

async function editStand(standId, name) {
    let boutique = await getSavedBoutique()
    let stand = boutique[standId]
    stand.name = name
    saveBoutique(boutique)
    return { standId, stand }
}

async function editVariation(standId, variationId, width, height) {
    let boutique = await getSavedBoutique()
    boutique[standId].variations[variationId] = { width: width, height: height }
    saveBoutique(boutique)
    return { standId: standId, variationId: variationId, width: width, height: height }
}

async function addStand(name) {
    let boutique = await getSavedBoutique()
    boutique.splice(0, 0, { name, variations: [] })
    saveBoutique(boutique)
    return { boutique }
}

async function addVariation(standId, width, height) {
    let boutique = await getSavedBoutique()
    let stand = boutique[standId]
    stand.variations.splice(0, 0, { width, height })
    saveBoutique(boutique)
    return { standId, stand }
}

async function getSavedVariation(standId, variationId) {
    let stand = await getSavedStand(standId)
    return stand.variations[variationId]
}

async function removeStand(standId) {
    let boutique = await getSavedBoutique()
    let stand =  boutique.splice(standId, 1)
    saveBoutique(boutique)
    return boutique
}

async function removeVariation(standId, variationId) {
    let boutique = await getSavedBoutique()
    let stand =  boutique[standId]
    stand.variations.splice(variationId, 1)
    saveBoutique(boutique)
    return {standId, stand }
}

async function renderFromSavedState() {
    var boutique = await getSavedBoutique()
    if (boutique.length === 0) {
        figma.ui.postMessage({ type: 'empty' })
    } else {
        figma.ui.postMessage({ type: 'render', boutique: boutique })
    }
}


// Get saved config and render UI
figma.showUI(__html__, {width: 320, height: 480})
renderFromSavedState()


// Listen for actions in the UI
figma.ui.onmessage = msg => {

    if (msg.type === 'run-stand') {
        (async function() {
            let source = figma.currentPage.selection
            if (source.length == 0) {
                let newNodes = await createStand(null, msg.standId)
                figma.currentPage.selection = newNodes
                figma.viewport.scrollAndZoomIntoView(figma.currentPage.selection)
            } else {
                source.forEach(node => {
                    createStand(node, msg.standId)
                })
            }
            figma.notify('Frametastic!')
        })()
    }

    if (msg.type === 'run-variation') {
        (async function() {
            let source = figma.currentPage.selection
            let variation = await getSavedVariation(msg.standId, msg.variationId)
            if (source.length == 0) {
                let newNode = createVariation(null, variation)
                figma.currentPage.selection = [newNode]
                figma.viewport.scrollAndZoomIntoView(figma.currentPage.selection)
            } else {
                source.forEach(node => {
                    createVariation(node, variation)
                })
            }
            figma.notify('Frametastic!')
        })()
    }

    if (msg.type === 'request-import') {
        let boutique = msg.data
        saveBoutique(boutique)
        renderFromSavedState()
    }

    if (msg.type === 'request-export') {
        getSavedBoutique().then(boutique => {
            figma.ui.postMessage({ type: 'export-data', data: boutique })
        })
    }

    if (msg.type === 'request-dump') {
        saveBoutique([])
        renderFromSavedState()
    }

    if (msg.type === 'remove-stand') {
        (async function() {
            let boutique = await removeStand(msg.standId)
            renderFromSavedState()
        })()
    }

    if (msg.type === 'remove-variation') {
        (async function() {
            let {standId, stand} = await removeVariation(msg.standId, msg.variationId)
            figma.ui.postMessage({ type: 'removed-variation', standId, stand })
        })()
    }

    if (msg.type === 'edit-stand') {
        (async function() {
            let { standId, stand } = await editStand(msg.standId, msg.name)
            figma.ui.postMessage({ type: 'edited-stand', standId, stand })
        })()
    }

    if (msg.type === 'edit-variation') {
        (async function() {
            let variation = await editVariation(msg.standId, msg.variationId, msg.width, msg.height)
            figma.ui.postMessage({ type: 'edited-variation', variation })
        })()
    }

    if (msg.type === 'add-stand') {
        (async function() {
            let boutique = await addStand(msg.name)
            renderFromSavedState()
        })()
    }

    if (msg.type === 'add-variation') {
        (async function() {
            let {standId, stand} = await addVariation(msg.standId, msg.width, msg.height)
            figma.ui.postMessage({ type: 'added-variation', standId, stand })
        })()
    }

    // figma.closePlugin();
};
