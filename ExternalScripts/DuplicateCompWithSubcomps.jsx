/*
Duplicate Comp with Subcomps (Recursive)
Author: Cascade AI

This script duplicates a comp and all its subcomps recursively, preserving structure, and organizes the new comps in a folder.
*/

function duplicateCompWithSubcomps() {
    if (app.project === null) {
        alert("No project open.");
        return;
    }

    // Get the currently active comp
    var activeItem = app.project.activeItem;
    if (!(activeItem && activeItem instanceof CompItem)) {
        alert("Please select or open the comp you want to duplicate in the project panel or timeline.");
        return;
    }
    var sourceComp = activeItem;

    // Prompt for new main comp name
    var newMainCompName = prompt("Enter the name for the new duplicated comp:", sourceComp.name + "_Copy");
    if (!newMainCompName) {
        alert("No name entered for the new comp.");
        return;
    }

    // Prompt for subcomp suffix
    var subcompSuffix = prompt("Enter the suffix to append to all duplicated subcomps:", "_v2");
    if (subcompSuffix === null) {
        alert("No suffix entered. Cancelling.");
        return;
    }

    app.beginUndoGroup("Duplicate Comp with Subcomps");

    // Create main folder in the same parent folder as the original comp
    var parentFolder = sourceComp.parentFolder;
    var mainFolder = app.project.items.addFolder(newMainCompName + "_DUPLICATED");
    mainFolder.parentFolder = parentFolder;
    // Subfolder for subcomps
    var subcompsFolder = app.project.items.addFolder(newMainCompName + "_Subcomps");
    subcompsFolder.parentFolder = mainFolder;

    // Map to keep track of already duplicated comps
    var compMap = {};

    function duplicateComp(comp) {
        if (compMap[comp.id]) {
            return compMap[comp.id];
        }
        // Duplicate comp
        var newComp = comp.duplicate();
        if (comp === sourceComp) {
            newComp.name = newMainCompName;
            newComp.parentFolder = mainFolder;
        } else {
            newComp.name = comp.name + subcompSuffix;
            newComp.parentFolder = subcompsFolder;
        }
        compMap[comp.id] = newComp;
        // Replace subcomps in layers
        for (var i = 1; i <= newComp.layers.length; i++) {
            var layer = newComp.layers[i];
            if (layer.source && layer.source instanceof CompItem) {
                var newSubcomp = duplicateComp(layer.source);
                layer.replaceSource(newSubcomp, false);
            }
        }
        return newComp;
    }

    var duplicatedMainComp = duplicateComp(sourceComp);
    alert("Duplication complete! New comp: " + duplicatedMainComp.name);

    app.endUndoGroup();
}
duplicateCompWithSubcomps();
