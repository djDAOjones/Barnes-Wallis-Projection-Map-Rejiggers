/*
AE_RescaleRepositionPanel.jsx
Dockable ScriptUI panel for After Effects
- Select reference comp (with suffix)
- Select layers (with group checkboxes for Section A–F)
- Pick target layer
- Choose Fit/Fill
- Apply rescale/reposition
*/

function AE_RescaleRepositionPanel(thisObj) {
    var win = (thisObj instanceof Panel) ? thisObj : new Window("palette", "Rescale & Reposition", undefined, {resizeable:true});
    win.orientation = "column";
    win.alignChildren = ["fill", "top"];

    // --- Reference Comp Selection ---
    win.add("statictext", undefined, "Reference Comp (suffix):");
    var compDropdown = win.add("dropdownlist", undefined, []);
    compDropdown.preferredSize.width = 300;

    // --- Layer Selection (checkboxes in columns by Section) ---
    win.add("statictext", undefined, "Layers to include:");
    var layerScrollGroup = win.add('group');
    layerScrollGroup.orientation = 'row';
    layerScrollGroup.alignChildren = ["fill", "top"];
    var layerColumns = {};
    var layerCheckboxes = [];
    var groupCheckboxes = {};
    var sectionPrefixes = ["Section A", "Section B", "Section C", "Section D", "Section E", "Section F"];
    var allPrefixes = sectionPrefixes.concat(["Other"]);
    // Create columns for each section and 'Other'
    for (var i = 0; i < allPrefixes.length; i++) {
        var prefix = allPrefixes[i];
        var col = layerScrollGroup.add('panel', undefined, prefix);
        col.orientation = 'column';
        col.alignChildren = ["left", "top"];
        col.preferredSize.width = 140;
        layerColumns[prefix] = col;
        // Add group checkbox for sections (not for 'Other')
        if (prefix !== "Other") {
            var groupCB = col.add('checkbox', undefined, 'All');
            groupCB.value = false;
            groupCheckboxes[prefix] = groupCB;
            // Handler for group checkbox
            groupCB.onClick = (function(prefix) {
                return function() {
                    for (var j=0; j<layerCheckboxes.length; j++) {
                        if (layerCheckboxes[j].section === prefix) {
                            layerCheckboxes[j].cb.value = groupCheckboxes[prefix].value;
                        }
                    }
                };
            })(prefix);
        }
    }

    // --- Target Layer Selection (via AE selection) ---
    var targetLayerInfo = {layer: null, comp: null};
    var targetGroup = win.add('group');
    targetGroup.orientation = 'row';
    var targetLabel = targetGroup.add('statictext', undefined, 'Target Layer:');
    var targetName = targetGroup.add('statictext', undefined, '[none selected]');
    var setTargetBtn = targetGroup.add('button', undefined, 'Use Selected Layer as Target');
    setTargetBtn.onClick = function() {
        var activeItem = app.project.activeItem;
        if (!(activeItem && activeItem instanceof CompItem)) {
            alert('Please select a layer in a comp.');
            return;
        }
        if (!activeItem.selectedLayers || activeItem.selectedLayers.length !== 1) {
            alert('Please select exactly one layer.');
            return;
        }
        targetLayerInfo.layer = activeItem.selectedLayers[0];
        targetLayerInfo.comp = activeItem;
        targetName.text = targetLayerInfo.layer.name + ' (in ' + targetLayerInfo.comp.name + ')';
    }

    // --- Fit/Fill Option ---
    var fitFillGroup = win.add("group");
    fitFillGroup.orientation = "row";
    fitFillGroup.add("statictext", undefined, "Scale Mode:");
    var fitRadio = fitFillGroup.add("radiobutton", undefined, "Fit");
    var fillRadio = fitFillGroup.add("radiobutton", undefined, "Fill");
    fitRadio.value = false;
    fillRadio.value = true; // Default to Fill mode

    // --- Go Button ---
    var goBtn = win.add("button", undefined, "Go!");

    // --- Populate Reference Comp Dropdown ---
    function refreshCompDropdown() {
        compDropdown.removeAll();
        for (var i=1; i<=app.project.numItems; i++) {
            var item = app.project.item(i);
            if (item instanceof CompItem && item.name.indexOf("NTU Barnes Wallis AE Projection Map") === 0) {
                compDropdown.add("item", item.name);
            }
        }
        if (compDropdown.items.length > 0) compDropdown.selection = 0;
    }

    // --- Populate Layers ---
    function refreshLayerCheckboxes() {
        // Remove all children from each column
        for (var i = 0; i < allPrefixes.length; i++) {
            var prefix = allPrefixes[i];
            var col = layerColumns[prefix];
            // Remove all except the group checkbox (for sections)
            while (col.children.length > (prefix !== "Other" ? 1 : 0)) col.remove(col.children[col.children.length-1]);
        }
        layerCheckboxes = [];
        var comp = getSelectedComp();
        if (!comp) return;
        // Add layer checkboxes to the correct column
        for (var i=1; i<=comp.numLayers; i++) {
            var layer = comp.layer(i);
            var section = "Other";
            for (var j = 0; j < sectionPrefixes.length; j++) {
                if (layer.name.indexOf(sectionPrefixes[j]) === 0) {
                    section = sectionPrefixes[j];
                    break;
                }
            }
            var col = layerColumns[section];
            var cb = col.add('checkbox', undefined, layer.name);
            cb.value = false;
            layerCheckboxes.push({cb: cb, layer: layer, section: section});
        }
        // Handler for individual layer checkboxes to update group state
        for (var i = 0; i < layerCheckboxes.length; i++) {
            (function(i) {
                layerCheckboxes[i].cb.onClick = function() {
                    var section = layerCheckboxes[i].section;
                    if (section !== "Other") {
                        // If any unchecked, group is unchecked
                        var allChecked = true;
                        for (var j = 0; j < layerCheckboxes.length; j++) {
                            if (layerCheckboxes[j].section === section && !layerCheckboxes[j].cb.value) {
                                allChecked = false;
                                break;
                            }
                        }
                        groupCheckboxes[section].value = allChecked;
                    }
                };
            })(i);
        }
        // --- Default: select all of A, B, C ---
        var defaultSections = ["Section A", "Section B", "Section C"];
        for (var i = 0; i < defaultSections.length; i++) {
            if (groupCheckboxes[defaultSections[i]]) {
                groupCheckboxes[defaultSections[i]].value = true;
                if (typeof groupCheckboxes[defaultSections[i]].onClick === "function") {
                    groupCheckboxes[defaultSections[i]].onClick();
                }
            }
        }
        layerScrollGroup.layout.layout(true);
    }


    function getSelectedComp() {
        if (compDropdown.selection) {
            for (var i=1; i<=app.project.numItems; i++) {
                var item = app.project.item(i);
                if (item instanceof CompItem && item.name === compDropdown.selection.text) return item;
            }
        }
        return null;
    }

    // --- Main Logic ---
    goBtn.onClick = function() {
        try {
            app.beginUndoGroup("Rescale & Reposition");
            var comp = getSelectedComp();
            if (!comp) { alert("No reference comp selected"); return; }

            // Collect selected layers
            var selectedLayers = [];
            for (var i=0; i<layerCheckboxes.length; i++) {
                if (layerCheckboxes[i].cb.value) selectedLayers.push(layerCheckboxes[i].layer);
            }
            if (selectedLayers.length === 0) { alert("No reference layers selected"); return; }

            // --- Get union bounds in comp space robustly ---
            var time = comp.time;
            function getLayerWorldCorners(layer, t) {
                if (typeof layer.toComp === "function") {
                    var rect = layer.sourceRectAtTime(t, false);
                    var anchor = layer.property("Anchor Point").valueAtTime(t, false);
                    var corners = [
                        [rect.left, rect.top],
                        [rect.left + rect.width, rect.top],
                        [rect.left + rect.width, rect.top + rect.height],
                        [rect.left, rect.top + rect.height]
                    ];
                    var world = [];
                    for (var i=0; i<corners.length; i++) {
                        var pt = [corners[i][0] - anchor[0], corners[i][1] - anchor[1]];
                        world.push(layer.toComp(pt));
                    }
                    return world;
                } else {
                    // Fallback for shape/text layers
                    var rect = layer.sourceRectAtTime(t, false);
                    var anchor = layer.property("Anchor Point").valueAtTime(t, false);
                    var position = layer.property("Position").valueAtTime(t, false);
                    function addPoints(a, b) { return [a[0]+b[0], a[1]+b[1]]; }
                    return [
                        addPoints([rect.left - anchor[0], rect.top - anchor[1]], position),
                        addPoints([rect.left + rect.width - anchor[0], rect.top - anchor[1]], position),
                        addPoints([rect.left + rect.width - anchor[0], rect.top + rect.height - anchor[1]], position),
                        addPoints([rect.left - anchor[0], rect.top + rect.height - anchor[1]], position)
                    ];
                }
            }
            var allCorners = [];
            for (var i=0; i<selectedLayers.length; i++) {
                allCorners = allCorners.concat(getLayerWorldCorners(selectedLayers[i], time));
            }
            var minX = Number.POSITIVE_INFINITY, minY = Number.POSITIVE_INFINITY;
            var maxX = Number.NEGATIVE_INFINITY, maxY = Number.NEGATIVE_INFINITY;
            for (var i=0; i<allCorners.length; i++) {
                minX = Math.min(minX, allCorners[i][0]);
                minY = Math.min(minY, allCorners[i][1]);
                maxX = Math.max(maxX, allCorners[i][0]);
                maxY = Math.max(maxY, allCorners[i][1]);
            }
            var bounds = {
                left: minX,
                right: maxX,
                top: minY,
                bottom: maxY,
                width: maxX - minX,
                height: maxY - minY,
                centerX: (minX + maxX) / 2,
                centerY: (minY + maxY) / 2
            };

            // --- Target Layer ---
            var targetLayer = targetLayerInfo.layer;
            var targetComp = targetLayerInfo.comp;
            if (!targetLayer || !targetComp) {
                alert("No target layer selected. Please use the button to set it.");
                app.endUndoGroup();
                return;
            }
            var tTime = targetComp.time;
            var tRect = targetLayer.sourceRectAtTime(tTime, false);
            var tAnchor = targetLayer.property("Anchor Point").valueAtTime(tTime, false);
            var tW = tRect.width, tH = tRect.height;

            // --- Zero/NaN checks ---
            if (!tW || !tH || isNaN(tW) || isNaN(tH) || !bounds.width || !bounds.height || isNaN(bounds.width) || isNaN(bounds.height)) {
                alert("ERROR: Target layer or bounds width/height is zero, undefined, or NaN. Cannot scale.\ntW=" + tW + ", tH=" + tH + ", bounds.width=" + bounds.width + ", bounds.height=" + bounds.height);
                app.endUndoGroup();
                return;
            }

            // --- Fit/Fill logic ---
            var scaleMode = fitRadio.value ? "fit" : "fill";
            var scaleX = bounds.width / tW;
            var scaleY = bounds.height / tH;
            var scale = (scaleMode === "fit") ? Math.min(scaleX, scaleY) : Math.max(scaleX, scaleY);
            var scaleArr = [scale*100, scale*100];

            // --- Centering logic ---
            var tCenter = [tRect.left + tW/2, tRect.top + tH/2];
            var newPos = [
                bounds.centerX - (tCenter[0] - tAnchor[0]) * scale,
                bounds.centerY - (tCenter[1] - tAnchor[1]) * scale
            ];

            // --- Apply scale and position ---
            targetLayer.property("Scale").setValue(scaleArr);
            targetLayer.property("Position").setValue(newPos);

            // --- Matte creation and track matte assignment ---
            // Create a solid as matte, sized and positioned to match bounds
            var matteColor = [1,1,1];
            var matteName = "Auto Matte";
            var matteWidth = Math.round(bounds.width);
var matteHeight = Math.round(bounds.height);
var matteLayer = targetComp.layers.addSolid(matteColor, matteName, matteWidth, matteHeight, targetComp.pixelAspect);
            // Position the matte center to bounds.centerX/Y
            matteLayer.property("Position").setValue([bounds.centerX, bounds.centerY]);
            // Move matte directly above the target layer
            matteLayer.moveBefore(targetLayer);
            // Set target layer to use Alpha Matte
            targetLayer.trackMatteType = TrackMatteType.ALPHA;

            // (Optional) Deselect the matte layer for cleanliness
            matteLayer.selected = false;
            targetLayer.selected = true;

            // --- End of matte logic ---

            /*
            // (If you want to keep the mask logic for other purposes, keep below)
            var refCorners = [
                [bounds.left, bounds.top],
                [bounds.right, bounds.top],
                [bounds.right, bounds.bottom],
                [bounds.left, bounds.bottom]
            ];
            var maskVerts = [];
            for (var j = 0; j < refCorners.length; j++) {
                maskVerts.push(refCorners[j]);
            }
            var shape = new Shape();
            shape.vertices = maskVerts;
            shape.closed = true;
            shape.inTangents = [];
            shape.outTangents = [];
            mask.property("maskShape").setValue(shape);
            mask.property("maskMode").setValue(MaskMode.ADD);
            targetLayer.trackMatteType = TrackMatteType.ALPHA;
            */

            app.endUndoGroup();
        } catch (e) {
            alert("ERROR: " + e.toString());
            app.endUndoGroup();
        }
    };

    // --- Utility: Get Combined Bounds ---
    function getCombinedBounds(layers, t) {
        if (!layers || layers.length === 0) return null;
        var left = null, right = null, top = null, bottom = null;
        for (var i=0; i<layers.length; i++) {
            var rect = layers[i].sourceRectAtTime(t, false);
            var pos = layers[i].property("Position").value;
            var l = pos[0] + rect.left;
            var r = l + rect.width;
            var t_ = pos[1] + rect.top;
            var b = t_ + rect.height;
            if (left === null || l < left) left = l;
            if (right === null || r > right) right = r;
            if (top === null || t_ < top) top = t_;
            if (bottom === null || b > bottom) bottom = b;
        }
        return {left:left, right:right, top:top, bottom:bottom, width:right-left, height:bottom-top};
    }

    // --- Event Hooks ---
    compDropdown.onChange = function() {
        refreshLayerCheckboxes();
    };

    // --- Initial population ---
    refreshCompDropdown();
    refreshLayerCheckboxes();

    win.layout.layout(true); // Force layout update
    return win;
}

// Main entry for ScriptUI Panel
(function(thisObj) {
    var panel = AE_RescaleRepositionPanel(thisObj);
    if (panel instanceof Window) {
        panel.center();
        panel.show();
    }
    // For dockable panel, After Effects will handle showing
})(this);
