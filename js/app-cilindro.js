const panoramas = [
    'img/cilindro/panorama1.jpg',
    'img/cilindro/panorama2.jpg',
    'img/cilindro/panorama3.jpg',
    'img/cilindro/panorama4.jpg',
    'img/cilindro/panorama5.jpg',
    'img/cilindro/panorama6.jpg',
    'img/cilindro/panorama7.jpg',
    'img/cilindro/panorama8.jpg',
    'img/cilindro/panorama9.jpg',
    'img/cilindro/panorama10.jpg',
    'img/cilindro/panorama11.jpg',
    'img/cilindro/panorama12.jpeg'
];
let currentPanoramaIndex = 0;
let camera, scene, renderer, cylinder;
let isUserInteracting = false;
let onMouseDownMouseX = 0, onMouseDownMouseY = 0;
let lon = 0, onMouseDownLon = 0;
let lat = 0, onMouseDownLat = 0;
let phi = 0, theta = 0;

let isTourActive = false;
let tourTimer = null;

const SENSITIVITY = 0.07;
const MIN_FOV = 20;
const MAX_FOV = 85;

init();
animate();

function init() {
    const container = document.getElementById('container');
    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 1100);
    camera.target = new THREE.Vector3(0, 0, 0);

    scene = new THREE.Scene();
    const geometry = new THREE.CylinderGeometry(500, 500, 700, 60, 1, true);
    geometry.scale(-1, 1, 1);

    const material = new THREE.MeshBasicMaterial();
    cylinder = new THREE.Mesh(geometry, material);
    scene.add(cylinder);

    loadPanorama(panoramas[currentPanoramaIndex]);

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(renderer.domElement);

    document.addEventListener('mousedown', onPointerDown, false);
    document.addEventListener('mousemove', onPointerMove, false);
    document.addEventListener('mouseup', onPointerUp, false);
    document.addEventListener('wheel', onDocumentMouseWheel, { passive: false });
    document.addEventListener('touchstart', onPointerDown, { passive: false });
    document.addEventListener('touchmove', onPointerMove, { passive: false });
    document.addEventListener('touchend', onPointerUp, false);
    window.addEventListener('resize', onWindowResize, false);

    document.getElementById('btn-prev').addEventListener('click', () => changePanorama(-1));
    document.getElementById('btn-next').addEventListener('click', () => changePanorama(1));
    document.getElementById('btn-tour').addEventListener('click', toggleTour);
}

function loadPanorama(url) {
    const textureLoader = new THREE.TextureLoader();
    textureLoader.load(url, function (texture) {
        cylinder.material.map = texture;
        cylinder.material.needsUpdate = true;
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

function toggleTour() {
    isTourActive = !isTourActive;
    const btn = document.getElementById('btn-tour');
    if (isTourActive) {
        btn.innerHTML = '⏸ Pausar Recorrido';
        btn.style.backgroundColor = '#ef4444'; // Color rojo
        btn.style.borderColor = '#ef4444';
        
        // Cambiar de imagen cada 8 segundos de forma automática
        tourTimer = setInterval(() => {
            changePanorama(1);
        }, 8000); 
    } else {
        btn.innerHTML = '▶ Recorrido Automático';
        btn.style.backgroundColor = '#f59e0b'; // Color amarillo original
        btn.style.borderColor = '#f59e0b';
        clearInterval(tourTimer);
    }
}

function onPointerDown(event) {
    if (event.type === 'touchstart') event.preventDefault();
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

function onPointerUp() {
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

function animate() {
    requestAnimationFrame(animate);
    update();
}

function update() {
    // Rotar cámara automáticamente si el tour está activo y el usuario no está tocando
    if (isTourActive && !isUserInteracting) {
        lon += 0.06; // Velocidad del giro
    }

    lat = Math.max(-30, Math.min(30, lat));
    phi = THREE.MathUtils.degToRad(90 - lat);
    theta = THREE.MathUtils.degToRad(lon);
    camera.target.x = 500 * Math.sin(phi) * Math.cos(theta);
    camera.target.y = 500 * Math.cos(phi);
    camera.target.z = 500 * Math.sin(phi) * Math.sin(theta);
    camera.lookAt(camera.target);
    renderer.render(scene, camera);
}
