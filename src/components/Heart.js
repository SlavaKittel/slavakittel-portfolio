import * as THREE from "three";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import * as BufferGeometryUtils from "three/addons/utils/BufferGeometryUtils.js";

import vertexShader from "./../shaders/vertex.glsl?raw";
import fragmentShader from "./../shaders/fragment.glsl?raw";

import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
gsap.registerPlugin(ScrollTrigger);

// Variables
const width = window.innerWidth;
const height = window.innerHeight;
let time = 0;
let lastTime = 0;
let newScrollLerp = 0;
const lerpFactor = 0.05;
const newCameraPosition = new THREE.Vector3();
let stopMouse = 0;
let timeoutMouse;

// Scene and Camera
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.z = 10;

// Light and Ambient
// const ambientLight = new THREE.AmbientLight(0xffffff, 20);
// scene.add(ambientLight);
// const pointerLight = new THREE.PointLight(0xffffff, 10);
// pointerLight.position.set(3, 3, 3);
// scene.add(pointerLight);
// const lightHelper = new THREE.PointLightHelper(pointerLight, 1);
// scene.add(lightHelper);

// Marker for Debug
const vMarkerMouseDamp = new THREE.Vector3();
let marker = new THREE.Mesh(
  new THREE.SphereGeometry(0.2, 16, 8),
  new THREE.MeshBasicMaterial({ color: "red", wireframe: true })
);
// scene.add(marker);

// Load model
const loader = new GLTFLoader();
function loadModel(callback) {
  loader.load(
    "./glb-models/real-heart-frame.glb",
    function (gltf) {
      const model = gltf.scene;
      model.scale.set(0.336, 0.336, 0.336);
      model.rotateX(-Math.PI / 2);
      model.children[0].material.transparent = true;
      model.children[0].material.opacity = 0.5;
      model.children[0].material.color = new THREE.Color(0x000000);
      scene.add(model);
      if (callback) callback(model);
    },
    undefined,
    function (error) {
      console.error("An error happened", error);
    }
  );
}
loadModel((geometry) => {
  const heartGeometry = geometry.children[0].geometry;
  heartGeometry.scale(4, 4, 4);
  heartGeometry.rotateX(Math.PI / 2);
  let mergedHeartGeometry = new THREE.IcosahedronGeometry(4, 20);

  mergedHeartGeometry = BufferGeometryUtils.mergeVertices(heartGeometry);

  const uniforms = {
    color: { value: new THREE.Color(0xff0000) },
    mousePos: { value: new THREE.Vector3() },
    // TODO create delta on Time
    uTime: { type: "f", value: 0 },
    uStopMouse: { value: null },
    uLightDirection: { value: new THREE.Vector3(0.1, 0.0, 0.0).normalize() },
    uAmbientLightColor: { value: new THREE.Color(0xff0000) },
    uMetalness: { value: 0.5 },
  };
  const shaderMaterial = new THREE.ShaderMaterial({
    uniforms: uniforms,
    vertexShader: vertexShader,
    fragmentShader: fragmentShader,
    side: THREE.DoubleSide,
  });

  // Merged mesh points
  const meshPoints = new THREE.Points(mergedHeartGeometry, shaderMaterial);
  const positionAttribute = meshPoints.geometry.attributes.position;
  const instancedCount = positionAttribute.count;

  // Particle Geometry
  const icosahedronGeometry = new THREE.IcosahedronGeometry(0.08, 0);
  const instancedGeometry = new THREE.InstancedBufferGeometry().copy(
    icosahedronGeometry
  );

  const instancePositions = new Float32Array(instancedCount * 3);
  const instanceRotations = new Float32Array(instancedCount * 3);
  const instancedScale = new Float32Array(instancedCount);

  for (let i = 0; i < instancedCount; i++) {
    // Position
    instancePositions[i * 3 + 0] = positionAttribute.array[i * 3 + 0];
    instancePositions[i * 3 + 1] = positionAttribute.array[i * 3 + 1];
    instancePositions[i * 3 + 2] = positionAttribute.array[i * 3 + 2];
    instancePositions[i * 3 + 1] += (Math.random() - 0.5) * 0.08;

    // Random rotation
    instanceRotations[i * 3 + 0] = Math.random() * 0.2 * Math.PI * 2;
    instanceRotations[i * 3 + 1] = Math.random() * 0.1 * Math.PI * 2;
    instanceRotations[i * 3 + 2] = Math.random() * 0.1 * Math.PI * 2;

    instancedScale[i] = Math.random();
  }

  const instancedMeshHeart = new THREE.InstancedMesh(
    instancedGeometry,
    shaderMaterial,
    instancedCount
  );
  instancedMeshHeart.geometry.setAttribute(
    "instancePosition",
    new THREE.InstancedBufferAttribute(instancePositions, 3)
  );
  instancedMeshHeart.geometry.setAttribute(
    "instanceRotation",
    new THREE.InstancedBufferAttribute(instanceRotations, 3)
  );
  instancedMeshHeart.geometry.setAttribute(
    "instanceScale",
    new THREE.InstancedBufferAttribute(instancedScale, 1)
  );
  scene.add(instancedMeshHeart);

  // Raycaster
  const raycaster = new THREE.Raycaster();
  const pointerCoords = new THREE.Vector2();
  function renderIntersects() {
    // update the picking ray with the camera and pointer position
    raycaster.setFromCamera(pointerCoords, camera);
    const intersects = raycaster.intersectObjects([geometry.children[0]]);
    if (intersects.length > 0) {
      let { x, y, z } = intersects[0].point;
      marker.position.set(x, y, z);
    }
    renderer.render(scene, camera);
  }

  function onPointerMove(event) {
    pointerCoords.x = (event.clientX / window.innerWidth) * 2 - 1;
    pointerCoords.y = -(event.clientY / window.innerHeight) * 2 + 1;
  }

  // Resize
  window.addEventListener("resize", () => {
    const w = window.innerWidth;
    const h = window.innerHeight;
    camera.aspect = w / h;
    renderer.setSize(w, h, false);
    camera.updateProjectionMatrix();
  });

  // Renderer in the DOM
  const renderer = new THREE.WebGLRenderer();
  renderer.setSize(width, height);
  window.onload = () => {
    document
      .getElementById("heart-app")
      ?.appendChild(renderer.domElement);
  };

  let start = 0;
  let targetStart = 1;

  gsap.ticker.add(animate);
  function animate() {
    // Scroll
    const scroll = window.scrollY / window.innerHeight;

    // Linear interpolation
    time = performance.now() * 0.0006;
    const deltaTime = time - lastTime;
    lastTime = time;

    const markerMouse = marker.position.clone();
    for (const k in markerMouse) {
      if (k == "x" || k == "y" || k == "z")
        vMarkerMouseDamp[k] = THREE.MathUtils.damp(
          vMarkerMouseDamp[k],
          markerMouse[k],
          10,
          deltaTime
        );
    }

    /////////////
    // Stop mouse
    // start = THREE.MathUtils.damp(start, targetStart, 10, deltaTime);
    
    // console.log(start);
    function mouseStop() {
      start = THREE.MathUtils.damp(1, 0, 10, deltaTime);
    }
    window.addEventListener("pointermove", (e) => {
      start = 1;
      if (timeoutMouse) clearTimeout(timeoutMouse);
      timeoutMouse = setTimeout(mouseStop, 300);
      onPointerMove(e);
    });
    /////////////

    // Uniforms
    uniforms.uTime.value += 0.01;
    uniforms.mousePos.value.copy(vMarkerMouseDamp);
    uniforms.uStopMouse.value = stopMouse;

    // Render intersects
    window.requestAnimationFrame(renderIntersects);

    // Camera
    newScrollLerp = THREE.MathUtils.lerp(newScrollLerp, scroll, lerpFactor);
    newCameraPosition.set(
      10 * Math.sin(newScrollLerp * Math.PI * 2),
      0,
      10 * Math.cos(newScrollLerp * Math.PI * 2)
    );
    camera.position.copy(newCameraPosition);
    camera.lookAt(instancedMeshHeart.position);

    // Render
    renderer.render(scene, camera);
  }
});
