# Project Planning & Feature Tracker

## Overview
This document tracks project goals, features, and planning for the Adobe After Effects scripting project.

---

## Features & Tasks

### 1. Composition Duplicator & Organizer
**Goal:** Automate the duplication of compositions and all nested sub-comps, ensuring clean organization and naming.

**Tasks:**
- Develop a script to duplicate a selected composition, including all nested sub-comps.
- Systematically rename duplicated comps and sub-comps to avoid name collisions (e.g., add a suffix/prefix).
- Update all references within duplicated comps to point to the new duplicates (not the originals).
- Organize duplicated comps in a clear folder/comp structure.
- Ensure the script handles edge cases (e.g., deeply nested comps, reused sub-comps).
- Test with various comp hierarchies to verify correctness.

### 2. Layer Positioning & Scaling Utilities

#### 2.1. Single Layer Fit/Fill to Frame
**Goal:** Reposition and scale a single layer to fit or fill a specified frame.

**Tasks:**
- Script duplicates a layer and positions the two copies within two predetermined frames.
- Prompt user to choose 'fit' (scale so source is not truncated, possibly with blank space) or 'fill' (enlarge to fill frame, possibly cropping).
- Ensure correct scaling and centering for both modes.

#### 2.2. Grid Distribution Utility
**Goal:** Distribute multiple layers in a grid, optimizing for comp size and layer size.

**Tasks:**
- Script takes a given number of layers and inspects their sizes and the comp size.
- Distributes layers in a sensible grid layout.
- Prompt user for margin size (in px) between grid cells.
- Ensure grid is balanced and visually appealing regardless of layer count.

#### 2.3. Repeat Layer Across Frame Utility
**Goal:** Create multiple copies of a layer and arrange them evenly across the frame.

**Tasks:**
- Script creates five copies of a layer.
- Reposition and scale each copy so that all fit evenly across the comp width.
- Maintain aspect ratio and ensure even spacing.

#### 2.4. Multi-Spot Image Placement Utility
**Goal:** Position and scale multiple images into a set of predefined locations.

**Tasks:**
- Script takes multiple images and places them into a limited number of predefined spots.
- Prompt user to choose 'fit' (no cropping) or 'fill' (crop with mask to prevent spillage).
- Apply masks automatically if 'fill' is chosen to prevent overflow.
- Optimize placement and scaling for best visual fit.

---

## Notes
- Use this section for brainstorming, bugs, or any other project notes.
