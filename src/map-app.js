import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { PROVINCE_SHAPES } from '../data/province-shapes.js';
import { activeProvinceId, INITIAL_STATE, isClickGesture, transition } from './interaction-state.js';
import { LANDMARKS } from './landmarks.js';
import { easeInOutCubic, easeOutBack, project, ringArea, ringCentroid } from './projection.js';

const DEPTH = 2.2;
const HOME_POSITION = new THREE.Vector3(0, 92, 118);
const HOME_TARGET = new THREE.Vector3(0, 0, -7);
const CAMERA_OFFSET = new THREE.Vector3(9, 14, 18);

function largestRing(polys) {
  return polys.reduce((largest, ring) => ringArea(ring) > ringArea(largest) ? ring : largest, polys[0]);
}

function createSea(scene) {
  const geometry = new THREE.PlaneGeometry(560, 560, 32, 32);
  geometry.rotateX(-Math.PI / 2);
  const base = geometry.attributes.position.array.slice();
  const sea = new THREE.Mesh(geometry, new THREE.MeshStandardMaterial({ color: '#0b3a57', roughness: 0.36, metalness: 0.1 }));
  sea.position.y = -0.58;
  sea.receiveShadow = true;
  scene.add(sea);
  return { geometry, base };
}

function createDust(scene) {
  const count = 140;
  const positions = new Float32Array(count * 3);
  let seed = 0x2f6e2b1;
  const random = () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 0x100000000;
  };
  for (let index = 0; index < count; index += 1) {
    positions[index * 3] = (random() - 0.5) * 210;
    positions[index * 3 + 1] = 2 + random() * 52;
    positions[index * 3 + 2] = (random() - 0.5) * 230;
  }
  const geometry = new THREE.BufferGeometry().setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const dust = new THREE.Points(geometry, new THREE.PointsMaterial({ color: '#ffd784', size: 0.48, transparent: true, opacity: 0.42, blending: THREE.AdditiveBlending, depthWrite: false }));
  scene.add(dust);
  return dust;
}

function makeProvinceEntry(province, index, scene, hitMeshes) {
  const group = new THREE.Group();
  const isCity = province.type !== 'Huyện';
  const hue = 162 - index % 7 * 4 - (isCity ? 12 : 0);
  const saturation = isCity ? 38 : 32 + index % 3 * 4;
  const lightness = 39 + index * 7 % 5 * 1.8;
  const topMaterial = new THREE.MeshStandardMaterial({ color: new THREE.Color(`hsl(${hue},${saturation}%,${lightness}%)`), roughness: 0.82, emissive: '#e0aa45', emissiveIntensity: 0 });
  const sideMaterial = new THREE.MeshStandardMaterial({ color: new THREE.Color(`hsl(${hue},${Math.round(saturation * 0.75)}%,${Math.round(lightness * 0.48)}%)`), roughness: 0.94 });
  for (const ring of province.polys) {
    const shape = new THREE.Shape();
    ring.forEach(([longitude, latitude], pointIndex) => {
      const coordinate = project(longitude, latitude);
      pointIndex === 0 ? shape.moveTo(coordinate.x, -coordinate.z) : shape.lineTo(coordinate.x, -coordinate.z);
    });
    const geometry = new THREE.ExtrudeGeometry(shape, { depth: DEPTH, bevelEnabled: true, bevelThickness: 0.28, bevelSize: 0.2, bevelSegments: 1, curveSegments: 1 });
    geometry.rotateX(-Math.PI / 2);
    const mesh = new THREE.Mesh(geometry, [topMaterial, sideMaterial]);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.userData.provinceId = province.id;
    group.add(mesh);
    hitMeshes.push(mesh);
  }
  const [longitude, latitude] = ringCentroid(largestRing(province.polys));
  const point = project(longitude, latitude);
  const centroid = new THREE.Vector3(point.x, DEPTH + 0.35, point.z);
  scene.add(group);
  return { group, province, topMaterial, centroid, targetY: 0, targetEmissive: 0, landmark: null, animation: null };
}

export function createTaiwanMap({ mount, onActiveChange, onSelectedChange, canvasLabel }) {
  if (window.__FORCE_WEBGL_FAILURE__ === true) {
    throw new Error('WebGL unavailable (controlled failure)');
  }
  const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.setSize(innerWidth, innerHeight);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.domElement.setAttribute('role', 'img');
  renderer.domElement.setAttribute('aria-label', canvasLabel);
  mount.prepend(renderer.domElement);

  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#071622');
  scene.fog = new THREE.Fog('#071622', 195, 440);
  const camera = new THREE.PerspectiveCamera(45, innerWidth / innerHeight, 0.1, 900);
  camera.position.copy(HOME_POSITION);
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.target.copy(HOME_TARGET);
  Object.assign(controls, { enableDamping: true, dampingFactor: 0.06, enablePan: false, minDistance: 18, maxDistance: 320, maxPolarAngle: Math.PI * 0.49 });
  controls.update();

  scene.add(new THREE.HemisphereLight('#c9efff', '#112636', 1.1));
  const sun = new THREE.DirectionalLight('#ffe3b0', 1.85);
  sun.position.set(62, 105, 42);
  sun.castShadow = true;
  sun.shadow.mapSize.set(1024, 1024);
  Object.assign(sun.shadow.camera, { left: -110, right: 110, top: 110, bottom: -110, far: 400 });
  scene.add(sun);
  const sea = createSea(scene);
  const dust = createDust(scene);
  const hitMeshes = [];
  const entries = new Map();
  PROVINCE_SHAPES.forEach((province, index) => entries.set(province.id, makeProvinceEntry(province, index, scene, hitMeshes)));

  const motionQuery = matchMedia('(prefers-reduced-motion: reduce)');
  let reducedMotion = motionQuery.matches;
  motionQuery.addEventListener('change', (event) => { reducedMotion = event.matches; });
  let state = INITIAL_STATE;
  let flight = null;
  let pointerStart = null;
  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2(-10, -10);
  const finePointer = matchMedia('(pointer: fine)').matches;

  function ensureLandmark(entry) {
    if (entry.landmark) {
      return entry.landmark;
    }
    const model = LANDMARKS[entry.province.id].build();
    model.position.copy(entry.centroid);
    model.scale.setScalar(0.001);
    model.visible = false;
    scene.add(model);
    entry.landmark = model;
    return model;
  }

  function setEntryActive(entry, active) {
    entry.targetY = active ? 1.4 : 0;
    entry.targetEmissive = active ? 0.38 : 0;
    const landmark = active ? ensureLandmark(entry) : entry.landmark;
    if (landmark) {
      landmark.visible = active || landmark.visible;
      entry.animation = { progress: active ? 0 : 1, show: active };
    }
  }

  function applyState(nextState) {
    if (nextState.hovered === state.hovered && nextState.selected === state.selected) {
      return;
    }
    const before = new Set([state.hovered, state.selected].filter(Boolean));
    const after = new Set([nextState.hovered, nextState.selected].filter(Boolean));
    for (const id of before) {
      if (!after.has(id)) {
        setEntryActive(entries.get(id), false);
      }
    }
    for (const id of after) {
      if (!before.has(id)) {
        setEntryActive(entries.get(id), true);
      }
    }
    state = nextState;
    onActiveChange(activeProvinceId(state));
    onSelectedChange(state.selected);
    renderer.domElement.style.cursor = state.hovered ? 'pointer' : 'grab';
  }

  function provinceAt(clientX, clientY) {
    pointer.set(clientX / innerWidth * 2 - 1, -(clientY / innerHeight) * 2 + 1);
    raycaster.setFromCamera(pointer, camera);
    return raycaster.intersectObjects(hitMeshes, false)[0]?.object.userData.provinceId ?? null;
  }

  function flyTo(position, target) {
    if (reducedMotion) {
      camera.position.copy(position);
      controls.target.copy(target);
      controls.update();
      flight = null;
      return;
    }
    flight = { progress: 0, duration: 1.4, fromPosition: camera.position.clone(), toPosition: position, fromTarget: controls.target.clone(), toTarget: target };
  }

  function selectProvince(id) {
    const entry = entries.get(id);
    if (!entry) {
      throw new Error(`Unknown province id: ${id}`);
    }
    applyState(transition(transition(state, { type: 'hover', id: null }), { type: 'select', id }));
    flyTo(entry.centroid.clone().add(CAMERA_OFFSET), new THREE.Vector3(entry.centroid.x, 2, entry.centroid.z));
  }

  function reset() {
    applyState(transition(state, { type: 'reset' }));
    flyTo(HOME_POSITION.clone(), HOME_TARGET.clone());
  }

  renderer.domElement.addEventListener('pointermove', (event) => {
    if (finePointer && event.buttons === 0) {
      applyState(transition(state, { type: 'hover', id: provinceAt(event.clientX, event.clientY) }));
    }
  });
  renderer.domElement.addEventListener('pointerleave', () => {
    if (finePointer) {
      applyState(transition(state, { type: 'hover', id: null }));
    }
  });
  renderer.domElement.addEventListener('pointerdown', (event) => {
    if (event.button === 0) {
      pointerStart = { x: event.clientX, y: event.clientY };
    }
  });
  renderer.domElement.addEventListener('pointerup', (event) => {
    if (event.button !== 0 || !pointerStart) {
      return;
    }
    const end = { x: event.clientX, y: event.clientY };
    const started = pointerStart;
    pointerStart = null;
    if (!isClickGesture(started, end)) {
      return;
    }
    const id = provinceAt(event.clientX, event.clientY);
    id ? selectProvince(id) : reset();
  });
  controls.addEventListener('start', () => { flight = null; });
  window.addEventListener('resize', () => {
    camera.aspect = innerWidth / innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(innerWidth, innerHeight);
  });

  const clock = new THREE.Clock();
  renderer.setAnimationLoop(() => {
    const delta = Math.min(clock.getDelta(), 0.05);
    const elapsed = clock.elapsedTime;
    if (!reducedMotion) {
      const positions = sea.geometry.attributes.position;
      for (let index = 0; index < positions.count; index += 1) {
        const x = sea.base[index * 3];
        const z = sea.base[index * 3 + 2];
        positions.array[index * 3 + 1] = 0.2 * Math.sin(x * 0.07 + elapsed) + 0.18 * Math.cos(z * 0.06 + elapsed * 0.78);
      }
      positions.needsUpdate = true;
      sea.geometry.computeVertexNormals();
      dust.rotation.y = elapsed * 0.008;
    }
    for (const entry of entries.values()) {
      const factor = reducedMotion ? 1 : Math.min(1, delta * 7);
      entry.group.position.y += (entry.targetY - entry.group.position.y) * factor;
      entry.topMaterial.emissiveIntensity += (entry.targetEmissive - entry.topMaterial.emissiveIntensity) * factor;
      if (entry.landmark && entry.animation) {
        const direction = entry.animation.show ? 1 : -1;
        entry.animation.progress = THREE.MathUtils.clamp(entry.animation.progress + direction * (reducedMotion ? 1 : delta * 2.6), 0, 1);
        entry.landmark.scale.setScalar(Math.max(0.001, easeOutBack(entry.animation.progress)));
        entry.landmark.visible = entry.animation.progress > 0;
      }
    }
    if (flight) {
      flight.progress += delta / flight.duration;
      const normalized = Math.min(1, flight.progress);
      const eased = easeInOutCubic(normalized);
      camera.position.lerpVectors(flight.fromPosition, flight.toPosition, eased);
      controls.target.lerpVectors(flight.fromTarget, flight.toTarget, eased);
      if (normalized === 1) {
        flight = null;
      }
    }
    controls.update();
    renderer.render(scene, camera);
  });

  const debug = {
    provinceCount: entries.size,
    get selected() { return state.selected; },
    get hovered() { return state.hovered; },
    get cameraAspect() { return camera.aspect; },
    get reducedMotion() { return reducedMotion; },
    controls: { enablePan: controls.enablePan, minDistance: controls.minDistance, maxDistance: controls.maxDistance, maxPolarAngle: controls.maxPolarAngle },
    screenPoint(id) {
      const entry = entries.get(id);
      if (!entry) {
        throw new Error(`Unknown province id: ${id}`);
      }
      const point = entry.centroid.clone().project(camera);
      return { x: (point.x + 1) * innerWidth / 2, y: (-point.y + 1) * innerHeight / 2 };
    },
  };
  return {
    select: selectProvince,
    reset,
    setCanvasLabel(label) { renderer.domElement.setAttribute('aria-label', label); },
    debug,
  };
}
