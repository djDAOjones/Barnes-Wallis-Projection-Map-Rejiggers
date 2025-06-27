// Take_Layers_From_Comps.jsx
// Moves layers from selected precomp layers into the parent comp, replacing the original precomp layers.
// Usage: Select precomp layers in the timeline, run this script.

function moveLayersFromSelectedComps() {
    var proj = app.project;
    if (!proj) {
        alert("No project open.");
        return;
    }
    var comp = app.project.activeItem;
    if (!(comp && comp instanceof CompItem)) {
        alert("Please select a composition timeline.");
        return;
    }
    var selectedLayers = comp.selectedLayers;
    if (selectedLayers.length === 0) {
        alert("Select one or more precomp layers in the timeline.");
        return;
    }

    app.beginUndoGroup("Move Layers From Selected Comps");
    // We'll process from top to bottom to preserve layer order
    // (so insertions don't shift lower indices)
    for (var i = selectedLayers.length - 1; i >= 0; i--) {
        var layer = selectedLayers[i];
        if (!(layer instanceof AVLayer && layer.source instanceof CompItem)) {
            continue; // Skip non-precomp layers
        }
        var subComp = layer.source;
        var insertIndex = layer.index;
        var timeOffset = layer.startTime;
        var inPoint = layer.inPoint;
        var outPoint = layer.outPoint;
        var stretch = layer.stretch / 100.0;
        // Copy all layers from subComp into parent comp
        for (var j = 1; j <= subComp.numLayers; j++) {
            var subLayer = subComp.layer(j);
            // Only process AVLayers with a valid source (footage, precomp, solid, etc.)
            if (subLayer instanceof AVLayer && subLayer.source != null) {
                var newLayer = comp.layers.add(subLayer.source);
                newLayer.moveBefore(comp.layer(insertIndex));
                // Timing
                newLayer.startTime = timeOffset + (subLayer.startTime * stretch);
                newLayer.inPoint = inPoint + ((subLayer.inPoint - subLayer.startTime) * stretch);
                newLayer.outPoint = inPoint + ((subLayer.outPoint - subLayer.startTime) * stretch);
                newLayer.stretch = subLayer.stretch * stretch;
                // Transfer basic transform properties if desired (optional)
                if (newLayer.property("Transform") && subLayer.property("Transform")) {
                    var props = ["Position", "Scale", "Rotation", "Opacity", "Anchor Point"];
                    for (var p = 0; p < props.length; p++) {
                        try {
                            newLayer.property("Transform").property(props[p]).setValue(subLayer.property("Transform").property(props[p]).value);
                        } catch (e) {}
                    }
                }
                newLayer.parent = layer.parent;
                newLayer.label = subLayer.label;
                newLayer.blendingMode = subLayer.blendingMode;
            } else {
                // Skipping non-AVLayers (e.g. Text, Shape, Null, Camera, Light, Adjustment, etc.)
                // To support these, additional handling would be needed.
            }
        }
        // Remove the original precomp layer
        layer.remove();
    }
    app.endUndoGroup();
    alert("Layers moved from selected comps.");
}

moveLayersFromSelectedComps();
