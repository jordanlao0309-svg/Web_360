// --- CONFIGURACIÓN ---
const panoramas = [
    'img/panorama1.jpg',
    'img/panorama2.jpg',
    'img/panorama3.jpg',
    'img/panorama12.jpeg',
    'img/img360.jpg'
];
let currentPanoramaIndex = 0;

// Variables globales de Three.js
let camera, scene, renderer, sphere;

// Variables para el control de rotación (Mouse / Touch)
let isUserInteracting = false;
let onMouseDownMouseX = 0, onMouseDownMouseY = 0;
let lon = 0, onMouseDownLon = 0;
let lat = 0, onMouseDownLat = 0;
let phi = 0, theta = 0;

// --- AJUSTES EXTRAS ---
const SENSITIVITY = 0.07; // Sensibilidad de rotación (un poco más suave)
const MIN_FOV = 20;      // Zoom máximo permitido
const MAX_FOV = 85;      // Zoom mínimo permitido

init();
animate();

function init() {
    const container = document.getElementById('container');

    // 1. Crear Cámara (Se redujo el FOV de 75 a 60 para que la imagen no se vea estirada en los bordes)
    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 1100);
    camera.target = new THREE.Vector3(0, 0, 0);

    // 2. Crear Escena
    scene = new THREE.Scene();

    // 3. Crear Geometría de Cilindro (ideal para panorámicas normales de celular)
    // Radio arriba, Radio abajo, Altura, Fragmentos, Subdivisiones de alto, Abierto de las tapas (true)
    const geometry = new THREE.CylinderGeometry(500, 500, 700, 60, 1, true);
    // Invertir geometría para ponernos "dentro" del cilindro
    geometry.scale(-1, 1, 1);

    const material = new THREE.MeshBasicMaterial();

    sphere = new THREE.Mesh(geometry, material);
    scene.add(sphere);

    // Cargar la vista predeterminada inicial
    loadPanorama(panoramas[currentPanoramaIndex]);

    // 4. Configurar el Motor de Renderizado
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(renderer.domElement);

    // 5. Configurar Eventos (Mouse)
    document.addEventListener('mousedown', onPointerDown, false);
    document.addEventListener('mousemove', onPointerMove, false);
    document.addEventListener('mouseup', onPointerUp, false);
    document.addEventListener('wheel', onDocumentMouseWheel, { passive: false });

    // 6. Configurar Eventos (Móviles / Táctil)
    document.addEventListener('touchstart', onPointerDown, { passive: false });
    document.addEventListener('touchmove', onPointerMove, { passive: false });
    document.addEventListener('touchend', onPointerUp, false);

    // Adaptar vista al redimensionar pantalla
    window.addEventListener('resize', onWindowResize, false);

    // Lógica de los botones extras
    document.getElementById('btn-prev').addEventListener('click', () => changePanorama(-1));
    document.getElementById('btn-next').addEventListener('click', () => changePanorama(1));
}

function loadPanorama(url) {
    const textureLoader = new THREE.TextureLoader();
    textureLoader.load(url, function (texture) {
        sphere.material.map = texture;
        sphere.material.needsUpdate = true;
    }, undefined, function (err) {
        console.error('No se pudo cargar la imagen: ' + url, err);
    });
}

function changePanorama(direction) {
    currentPanoramaIndex += direction;

    if (currentPanoramaIndex < 0) currentPanoramaIndex = panoramas.length - 1;
    if (currentPanoramaIndex >= panoramas.length) currentPanoramaIndex = 0;

    loadPanorama(panoramas[currentPanoramaIndex]);
}

// --- FUNCIONES DE INTERACCIÓN ---

function onPointerDown(event) {
    if (event.type === 'touchstart') {
        event.preventDefault();
    }

    isUserInteracting = true;

    const clientX = event.clientX || event.touches[0].clientX;
    const clientY = event.clientY || event.touches[0].clientY;

    onMouseDownMouseX = clientX;
    onMouseDownMouseY = clientY;

    onMouseDownLon = lon;
    onMouseDownLat = lat;
}

function onPointerMove(event) {
    if (isUserInteracting === true) {
        const clientX = event.clientX || event.touches[0].clientX;
        const clientY = event.clientY || event.touches[0].clientY;

        lon = (onMouseDownMouseX - clientX) * SENSITIVITY + onMouseDownLon;
        lat = (clientY - onMouseDownMouseY) * SENSITIVITY + onMouseDownLat;
    }
}

function onPointerUp(event) {
    isUserInteracting = false;
}

function onDocumentMouseWheel(event) {
    event.preventDefault();

    camera.fov += event.deltaY * 0.05;

    camera.fov = Math.max(MIN_FOV, Math.min(MAX_FOV, camera.fov));
    camera.updateProjectionMatrix();
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// --- BUCLE DE ANIMACIÓN ---
function animate() {
    requestAnimationFrame(animate);
    update();
}

function update() {
    // Limitamos cuánto se puede mirar arriba/abajo para no ver los huecos superior e inferior del cilindro
    lat = Math.max(-30, Math.min(30, lat));

    phi = THREE.MathUtils.degToRad(90 - lat);
    theta = THREE.MathUtils.degToRad(lon);

    camera.target.x = 500 * Math.sin(phi) * Math.cos(theta);
    camera.target.y = 500 * Math.cos(phi);
    camera.target.z = 500 * Math.sin(phi) * Math.sin(theta);

    camera.lookAt(camera.target);

    renderer.render(scene, camera);
}
