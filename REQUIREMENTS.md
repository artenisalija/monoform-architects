# Project Requirements (Client Models, No Sketchfab)

Use this checklist when collecting materials from a client so their real project can be shown directly on this website with your own code.

## 1) Legal + Permissions (Required)

- Written permission to use project models/images/videos on public website
- Confirmation of who owns design/model copyright
- Rights for marketing use (global web usage)
- Any restrictions (NDA areas, private rooms, no aerial view, etc.)

## 2) Core 3D Files (Required)

Preferred delivery:
- `GLB` (best for web)

Accepted source formats (convert later):
- `RVT` (Revit)
- `IFC`
- `SKP` (SketchUp)
- `FBX`
- `OBJ`
- `3DM` (Rhino)

For each model, request:
- Correct real-world scale (meters)
- Correct pivot/origin placement
- Clean hierarchy/grouping (by floor/zone/material)
- Naming convention for layers/objects

## 3) Geometry Quality Rules (Required)

- Optimized web mesh version (target low/medium poly)
- Separate LODs if possible: `low`, `medium`, `high`
- No broken normals, no non-manifold geometry
- No duplicated hidden meshes
- Triangulated export if needed for compatibility

## 4) Materials + Textures (Required)

- PBR texture set (if available):
  - Base Color
  - Roughness
  - Metalness
  - Normal
  - AO (optional)
- Texture format: `JPG`/`PNG`/`WEBP`
- Power-of-two sizes preferred (e.g. 1024, 2048)
- Reasonable texture budget for web performance
- Material list/schedule matching real finishes

## 5) Scene Structure for Interactions (Required if you want room/floor toggles)

Ask client/modeler to split model into logical groups:
- `exterior`
- `interior`
- `floor_01`, `floor_02`, etc.
- `walls`, `roof`, `glass`, `furniture`, etc.

This is required for features like:
- open/close floors
- isolate rooms
- hide/show walls
- guided “journey” interactions

## 6) Drawings + Reference Data (Strongly Recommended)

- Floor plans (PDF/CAD)
- Elevations + sections
- Site plan and orientation (north)
- Dimensioned key measurements
- As-built revision date

These help align camera paths and verify model correctness.

## 7) Visual References (Recommended)

- 20-50 photos of built project
- Exterior day/night shots
- Interior room shots (if interior model exists)
- Drone/context shots if available

## 8) Performance Targets (Web)

For smooth experience on most devices:
- Compressed `GLB` preferred (`Draco`/`Meshopt` if possible)
- Keep total scene size practical for web loading
- Keep draw calls/material count controlled
- Provide fallback lighter model for mobile

## 9) Delivery Package Structure (Recommended)

Example:

```text
project-name/
  models/
    project-low.glb
    project-medium.glb
    project-high.glb
  textures/
    ...
  drawings/
    plans.pdf
    elevations.pdf
  photos/
    ...
  docs/
    material-schedule.pdf
    rights-permission.pdf
    revision-notes.txt
```

## 10) Minimum Viable Package (If client is slow)

At minimum, get:
- 1 optimized `GLB`
- 1 rights/permission confirmation
- 1 plan/elevation PDF
- 10+ reference photos

Without these, quality and legal safety are both at risk.

## 11) What You Can Build Once Requirements Are Met

- Scroll-driven building journey (already in this site)
- Fullscreen interactive model view
- Floor/room toggles
- Exterior/interior mode switch
- Material highlight mode
- Guided camera tour tied to page sections
