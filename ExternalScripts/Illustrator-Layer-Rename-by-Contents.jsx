#target illustrator

function renameLayersByFirstShapeName() {
    var doc = app.activeDocument;
    var layers = doc.layers;

    for (var i = 0; i < layers.length; i++) {
        var layer = layers[i];

        // Skip empty or locked layers
        if (layer.locked || layer.pageItems.length === 0) {
            continue;
        }

        // Find the first page item (e.g. path, group, compound path)
        var item = layer.pageItems[0];

        // Use item's name if it has one, otherwise fall back to its type
        var newName = item.name && item.name.length > 0 ? item.name : item.typename;

        try {
            layer.name = newName;
        } catch (e) {
            $.writeln("Couldn't rename layer: " + layer.name);
        }
    }

    alert("Layers renamed by first shape name.");
}

renameLayersByFirstShapeName();
