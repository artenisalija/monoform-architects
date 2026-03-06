import * as THREE from "https://unpkg.com/three@0.162.0/build/three.module.js?module";
import { DRACOLoader } from "https://unpkg.com/three@0.162.0/examples/jsm/loaders/DRACOLoader.js?module";
import { GLTFLoader } from "https://unpkg.com/three@0.162.0/examples/jsm/loaders/GLTFLoader.js?module";

const canvas = document.getElementById("bg-canvas");
const scene = new THREE.Scene();
scene.fog = new THREE.Fog(0x050505, 10, 42);

const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 120);
camera.position.set(0, 11.5, 5.6);

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.8));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;

const ambient = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambient);

const key = new THREE.DirectionalLight(0xffffff, 1.1);
key.position.set(3, 5, 7);
scene.add(key);

const rim = new THREE.DirectionalLight(0x8a8a8a, 0.55);
rim.position.set(-5, 2, -6);
scene.add(rim);

const mansionGroup = new THREE.Group();
mansionGroup.position.set(0, -1.15, 0);
scene.add(mansionGroup);

const mansionParts = [];
const mansionEdges = [];
let fallbackMaterial = null;

function smoothstep(edge0, edge1, x) {
  const t = THREE.MathUtils.clamp((x - edge0) / (edge1 - edge0), 0, 1);
  return t * t * (3 - 2 * t);
}

function normalizeModel(model) {
  const rawBox = new THREE.Box3().setFromObject(model);
  const rawSize = rawBox.getSize(new THREE.Vector3());
  const rawCenter = rawBox.getCenter(new THREE.Vector3());
  const targetSize = 11.4;
  const maxDim = Math.max(rawSize.x, rawSize.y, rawSize.z);
  const scale = targetSize / maxDim;

  model.scale.setScalar(scale);
  model.position.sub(rawCenter.multiplyScalar(scale));

  const normalizedBox = new THREE.Box3().setFromObject(model);
  model.position.y -= normalizedBox.min.y;
}

function prepareMansion(model) {
  normalizeModel(model);
  mansionGroup.add(model);

  const centers = [];
  model.traverse((child) => {
    if (!child.isMesh) {
      return;
    }

    child.geometry.computeBoundingBox();

    const center = child.geometry.boundingBox.getCenter(new THREE.Vector3());
    child.localToWorld(center);
    centers.push(center.y);
  });

  const minY = Math.min(...centers);
  const maxY = Math.max(...centers);
  const spanY = Math.max(maxY - minY, 0.001);

  let meshIndex = 0;
  model.traverse((child) => {
    if (!child.isMesh) {
      return;
    }

    child.geometry.computeBoundingBox();
    const center = child.geometry.boundingBox.getCenter(new THREE.Vector3());
    child.localToWorld(center);

    const phase = THREE.MathUtils.clamp((center.y - minY) / spanY, 0, 1);
    const toneIndex = meshIndex % 4;
    const tone = toneIndex === 0 ? 0x111111 : 0xf1f1f1;
    meshIndex += 1;

    const material = new THREE.MeshStandardMaterial({
      color: tone,
      roughness: 0.85,
      metalness: 0.07,
      transparent: true,
      opacity: 0,
    });

    child.material = material;

    mansionParts.push({
      mesh: child,
      baseY: child.position.y,
      phase,
      material,
      toneIndex,
    });

    const edges = new THREE.LineSegments(
      new THREE.EdgesGeometry(child.geometry, 26),
      new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0 })
    );
    edges.position.copy(child.position);
    edges.rotation.copy(child.rotation);
    edges.scale.copy(child.scale);
    child.parent.add(edges);

    mansionEdges.push({ edge: edges, phase });
  });

  applySceneTheme(document.body.classList.contains("light-theme"));
}

function createFallbackMassing() {
  const geometry = new THREE.BoxGeometry(5.6, 3, 3.4);
  const material = new THREE.MeshStandardMaterial({ color: 0xe8e8e8, transparent: true, opacity: 0.2 });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.y = 1.1;
  mansionGroup.add(mesh);
  fallbackMaterial = material;
  applySceneTheme(document.body.classList.contains("light-theme"));
}

const loader = new GLTFLoader();
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath("https://www.gstatic.com/draco/versioned/decoders/1.5.7/");
loader.setDRACOLoader(dracoLoader);
loader.load(
  "./assets/models/cooper-hewitt-exterior-low.glb",
  (gltf) => {
    prepareMansion(gltf.scene);
  },
  undefined,
  (error) => {
    console.error("Failed to load Carnegie Mansion model:", error);
    createFallbackMassing();
  }
);

const projectField = new THREE.Group();
scene.add(projectField);

const orbitElements = [];

function setMaterialColorSafe(material, hex) {
  if (material && material.color && typeof material.color.setHex === "function") {
    material.color.setHex(hex);
  }
}

function setMaterialPbrSafe(material, metalness, roughness) {
  if (material && "metalness" in material) {
    material.metalness = metalness;
  }
  if (material && "roughness" in material) {
    material.roughness = roughness;
  }
}

// Orbit elements intentionally disabled: background now focuses only on the Carnegie Mansion.

function applySceneTheme(isLight) {
  if (isLight) {
    scene.fog.color.setHex(0xd6c09a);
    ambient.color.setHex(0xfff6de);
    ambient.intensity = 0.72;
    key.color.setHex(0xf3c978);
    key.intensity = 1.4;
    rim.color.setHex(0xa8792c);
    rim.intensity = 0.9;

    mansionParts.forEach((part) => {
      const color = part.toneIndex === 0 ? 0x7b5a24 : 0xf9edcf;
      part.material.color.setHex(color);
      part.material.metalness = 0.2;
      part.material.roughness = 0.62;
    });

    mansionEdges.forEach((item) => {
      item.edge.material.color.setHex(0xd8a64b);
    });

    if (fallbackMaterial) {
      fallbackMaterial.color.setHex(0xf2d59e);
      fallbackMaterial.metalness = 0.12;
      fallbackMaterial.roughness = 0.62;
    }

    orbitElements.forEach((item, index) => {
      const gold = index % 2 ? 0xc79135 : 0x7b5721;
      item.mats.forEach((mat) => {
        setMaterialColorSafe(mat, gold);
        setMaterialPbrSafe(mat, 0.34, 0.45);
      });
    });
  } else {
    scene.fog.color.setHex(0x050505);
    ambient.color.setHex(0xffffff);
    ambient.intensity = 0.5;
    key.color.setHex(0xffffff);
    key.intensity = 1.1;
    rim.color.setHex(0x8a8a8a);
    rim.intensity = 0.55;

    mansionParts.forEach((part) => {
      const color = part.toneIndex === 0 ? 0x111111 : 0xf1f1f1;
      part.material.color.setHex(color);
      part.material.metalness = 0.07;
      part.material.roughness = 0.85;
    });

    mansionEdges.forEach((item) => {
      item.edge.material.color.setHex(0xffffff);
    });

    if (fallbackMaterial) {
      fallbackMaterial.color.setHex(0xe8e8e8);
      fallbackMaterial.metalness = 0;
      fallbackMaterial.roughness = 1;
    }

    orbitElements.forEach((item, index) => {
      const mono = index % 2 ? 0xffffff : 0x090909;
      item.mats.forEach((mat) => {
        setMaterialColorSafe(mat, mono);
        setMaterialPbrSafe(mat, 0.1, 0.8);
      });
    });
  }
}

const panels = [...document.querySelectorAll(".panel")];
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => entry.target.classList.toggle("in-view", entry.isIntersecting));
  },
  { threshold: 0.35 }
);
panels.forEach((panel) => observer.observe(panel));

const themeToggleButton = document.getElementById("theme-toggle");
const THEME_STORAGE_KEY = "architect-theme";

function safeGetStoredTheme() {
  try {
    return localStorage.getItem(THEME_STORAGE_KEY);
  } catch {
    return null;
  }
}

function safeSetStoredTheme(value) {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, value);
  } catch {
    // Ignore storage access errors (private mode / blocked storage).
  }
}

function applyTheme(theme) {
  const isLight = theme === "light";
  document.body.classList.toggle("light-theme", isLight);
  applySceneTheme(isLight);

  if (themeToggleButton) {
    themeToggleButton.textContent = isLight ? "Dark Mode" : "Light Luxe";
  }
}

const savedTheme = safeGetStoredTheme() || "dark";
applyTheme(savedTheme);

if (themeToggleButton) {
  themeToggleButton.addEventListener("click", () => {
    const nextTheme = document.body.classList.contains("light-theme") ? "dark" : "light";
    safeSetStoredTheme(nextTheme);
    applyTheme(nextTheme);
  });
}

const modelModal = document.getElementById("model-modal");
const modalFrame = document.getElementById("model-modal-frame");
const openModelButtons = [...document.querySelectorAll(".open-model")];
const closeModalTargets = [...document.querySelectorAll("[data-close-modal]")];

function openModelModal(src) {
  if (!modelModal || !modalFrame || !src) {
    return;
  }

  modalFrame.src = src;
  modelModal.classList.add("is-open");
  modelModal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
}

function closeModelModal() {
  if (!modelModal || !modalFrame) {
    return;
  }

  modelModal.classList.remove("is-open");
  modelModal.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
  modalFrame.src = "";
}

openModelButtons.forEach((button) => {
  button.addEventListener("click", (event) => {
    event.preventDefault();
    const embedWrap = button.closest(".embed-wrap");
    openModelModal(embedWrap?.dataset.modelSrc);
  });
});

closeModalTargets.forEach((el) => {
  el.addEventListener("click", closeModelModal);
});

window.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeModelModal();
  }
});

let scrollProgress = 0;
function updateScrollProgress() {
  const maxScroll = document.body.scrollHeight - window.innerHeight;
  scrollProgress = maxScroll <= 0 ? 0 : window.scrollY / maxScroll;
}
window.addEventListener("scroll", updateScrollProgress, { passive: true });
updateScrollProgress();

function animate() {
  requestAnimationFrame(animate);

  try {
    const t = performance.now() * 0.001;

    const mansionBuild = smoothstep(0.0, 0.8, scrollProgress);

    mansionParts.forEach((part) => {
      const reveal = smoothstep(part.phase - 0.16, part.phase + 0.2, mansionBuild);
      part.material.opacity = 0.38 + reveal * 0.62;
      part.mesh.position.y = part.baseY - (1 - reveal) * 1.6;
    });

    mansionEdges.forEach((item) => {
      const reveal = smoothstep(item.phase - 0.15, item.phase + 0.18, mansionBuild);
      item.edge.material.opacity = smoothstep(0, 0.35, mansionBuild) * (1 - reveal * 0.86);
    });

    mansionGroup.position.y = THREE.MathUtils.lerp(-1.2, -0.9, mansionBuild);
    mansionGroup.position.z = THREE.MathUtils.lerp(1.4, 2.8, smoothstep(0.04, 1, scrollProgress));

    // Finish on a clear front-facing angle at the end of the scroll journey.
    const journey = smoothstep(0.0, 1, scrollProgress);
    const turnToFront = THREE.MathUtils.lerp(-Math.PI * 1.05, 0, journey);
    mansionGroup.rotation.y = turnToFront + Math.sin(t * 0.2) * 0.03 * (1 - journey);

    projectField.rotation.y += 0.0014 + scrollProgress * 0.0026;
    projectField.rotation.x = Math.sin(t * 0.2) * 0.12;

    orbitElements.forEach((item, index) => {
      const n = (index + 1) / Math.max(orbitElements.length, 1);
      const formation = smoothstep(0.02 + n * 0.12, 0.78 + n * 0.22, scrollProgress);
      const pulse = 0.9 + Math.sin(t * 0.9 + index) * 0.1;

      item.object.scale.setScalar(item.baseScale * (0.38 + formation * 1.15 * pulse));
      item.mats.forEach((mat) => {
        if (!mat) {
          return;
        }
        if ("transparent" in mat) {
          mat.transparent = true;
        }
        if ("opacity" in mat) {
          mat.opacity = 0.06 + formation * 0.64;
        }
      });
      item.object.rotation.x += item.spinX + n * 0.0004;
      item.object.rotation.y -= item.spinY + n * 0.00035;
    });

    camera.position.x = Math.sin(t * 0.14) * 0.24;
    camera.position.y = THREE.MathUtils.lerp(11.5, 2.3, journey);
    camera.position.z = THREE.MathUtils.lerp(5.6, 8.1, journey);
    camera.lookAt(0, THREE.MathUtils.lerp(0.75, 1.9, journey), 0);

    renderer.render(scene, camera);
  } catch (error) {
    console.error("Animation loop error:", error);
  }
}
animate();

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
