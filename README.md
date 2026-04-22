# Architecture Landing Page (Three.js)

Live demo: https://artenisalija.github.io/monoform-architects/

A high-impact architecture firm landing page with:
- Scroll-driven Three.js background animation
- Real building model (Carnegie Mansion) loading via GLTF + Draco
- Hero, About, Projects, 3D Lab, Testimonials, Contact sections
- Fullscreen popup viewer for 3D Lab models

## Project Structure

- `index.html` - Page markup and sections
- `styles.css` - Visual style, layout, responsive rules
- `main.js` - Three.js scene, scroll animation, 3D modal logic
- `assets/models/cooper-hewitt-exterior-low.glb` - Background animated building model

## Requirements

- Python 3 (recommended for local static server)
- Modern browser (Chrome/Edge/Firefox/Safari)
- Internet connection (for CDN modules, Google Fonts, Sketchfab embeds)

## Run Locally

From this project folder:

```bash
cd /home/artenisalija/Documents/architect
python3 -m http.server 8080
```

Open in browser:

- `http://localhost:8080`

Use a hard refresh after changes:
- Windows/Linux: `Ctrl+Shift+R`
- macOS: `Cmd+Shift+R`

## Why a Server Is Required

Do **not** open `index.html` directly via file path.
The app uses ES modules and local assets that require HTTP serving.

## Edit Content

### Text/sections
- Update content in `index.html`.

### Design styles
- Update typography, spacing, colors in `styles.css`.

### Background animated model
- Main model path is in `main.js`:
  - `./assets/models/cooper-hewitt-exterior-low.glb`
- Replace with your client model (prefer `.glb`) and update this path.

### 3D Lab popup models
- In `index.html`, each card uses:
  - `data-model-src` (fullscreen popup source)
  - `<iframe src="...">` (inline preview)

## If Your Client Sends Their Own Model

You can use your own code and skip Sketchfab.
Recommended pipeline:
1. Convert model to `.glb`.
2. Put file in `assets/models/`.
3. Load with `GLTFLoader` in `main.js`.
4. Keep `DRACOLoader` enabled if model uses Draco compression.

## Troubleshooting

### Page is static / no 3D animation
- Confirm server is running and opened via `http://localhost:8080`.
- Check DevTools Console for module/load errors.

### Only a cube appears in background
- Main model failed to load and fallback rendered.
- Check path exists:
  - `assets/models/cooper-hewitt-exterior-low.glb`
- Check console for `Failed to load Carnegie Mansion model`.

### 3D Lab fullscreen popup not opening
- Ensure JavaScript is enabled.
- Hard refresh to clear cached JS.

## License Notes

The page includes links to third-party 3D content and licenses (e.g., CC BY / CC0) in the 3D Lab section.
Keep attribution/license links when reusing those models.
# monoform-architects
