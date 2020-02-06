figma.showUI(__html__);

function createStand(source, id) {

}

function createVariation(source, width, height) {

}

function getSavedVariation(id) {

}


figma.ui.onmessage = msg => {
    if (msg.type === 'message-name') {
        alert('trigger')
    }

    if (msg.type === 'run-stand') {
        alert('run stand')
        // let id = msg.id
        // createStand(source, id)
    }

    if (msg.type === 'run-variation') {
        alert('run variation')
        // let id = msg.id
        // let {width, height} = getSavedVariation(id)
        // let source = figma.currentPage.selection
        // createVariation(source, width, height)
    }

    // figma.closePlugin();
};
