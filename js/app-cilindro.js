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

let raycaster = new THREE.Raycaster();
let mouse = new THREE.Vector2();
let hotspotNext, hotspotPrev;
let startClickX = 0, startClickY = 0;

const SENSITIVITY = 0.07;
const MIN_FOV = 20;
const MAX_FOV = 85;

init();
animate();

function createArrowTexture(direction) {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');

    // Fondo circular negro semitransparente
    ctx.beginPath();
    ctx.arc(128, 128, 100, 0, 2 * Math.PI);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fill();
    ctx.lineWidth = 5;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.stroke();

    // Símbolo de Avance o Retroceso
    ctx.font = 'bold 100px Arial';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(direction === 'next' ? '▶' : '◀', direction === 'next' ? 135 : 120, 138);

    return new THREE.CanvasTexture(canvas);
}

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

    // -- HOTSPOTS (Flechas estilo Street View) --
    // Creamos Sprites interactivos usando la textura del Canvas
    hotspotNext = new THREE.Sprite(new THREE.SpriteMaterial({ map: createArrowTexture('next'), depthTest: false }));
    hotspotNext.scale.set(60, 60, 1);
    hotspotNext.userData = { action: 'next' };
    hotspotNext.position.set(300, -80, 120); // Posicionado adelante al nivel del suelo y a la derecha

    hotspotPrev = new THREE.Sprite(new THREE.SpriteMaterial({ map: createArrowTexture('prev'), depthTest: false }));
    hotspotPrev.scale.set(60, 60, 1);
    hotspotPrev.userData = { action: 'prev' };
    hotspotPrev.position.set(300, -80, -120); // Posicionado adelante al nivel del suelo y a la izquierda

    scene.add(hotspotNext);
    scene.add(hotspotPrev);

    loadPanorama(panoramas[currentPanoramaIndex]);

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(renderer.domElement);

    // Eventos de interacción (mouse, touch)
    document.addEventListener('mousedown', onPointerDown, false);
    document.addEventListener('mousemove', onPointerMove, false);
    document.addEventListener('mouseup', onPointerUp, false);
    document.addEventListener('wheel', onDocumentMouseWheel, { passive: false });
    
    document.addEventListener('touchstart', onPointerDown, { passive: false });
    document.addEventListener('touchmove', onPointerMove, { passive: false });
    document.addEventListener('touchend', onPointerUp, false);
    
    window.addEventListener('resize', onWindowResize, false);
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
    // Sistema cíclico
    if (currentPanoramaIndex < 0) currentPanoramaIndex = panoramas.length - 1;
    if (currentPanoramaIndex >= panoramas.length) currentPanoramaIndex = 0;
    
    loadPanorama(panoramas[currentPanoramaIndex]);
}

function onPointerDown(event) {
    if (event.type === 'touchstart') event.preventDefault();
    isUserInteracting = true;
    
    const clientX = event.clientX || event.touches[0].clientX;
    const clientY = event.clientY || event.touches[0].clientY;
    
    startClickX = clientX;
    startClickY = clientY;

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
    
    let clientX, clientY;
    if (event.type === 'touchend') {
        clientX = event.changedTouches[0].clientX;
        clientY = event.changedTouches[0].clientY;
    } else {
        clientX = event.clientX;
        clientY = event.clientY;
    }

    // Calcular cuánto se movió el cursor. Si fue muy poco, lo tratamos como CLIC y no arrastre de cámara.
    if (Math.abs(clientX - startClickX) < 10 && Math.abs(clientY - startClickY) < 10) {
        
        // Coordenadas normalizadas para el raycaster [-1, 1]
        mouse.x = (clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(clientY / window.innerHeight) * 2 + 1;

        raycaster.setFromCamera(mouse, camera);

        // Disparamos el rayo desde la cámara y cruzamos con los iconos
        const intersects = raycaster.intersectObjects([hotspotNext, hotspotPrev]);
        
        if (intersects.length > 0) {
            const action = intersects[0].object.userData.action;
            if (action === 'next') changePanorama(1);
            if (action === 'prev') changePanorama(-1);
        }
    }
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
    lat = Math.max(-30, Math.min(30, lat));
    phi = THREE.MathUtils.degToRad(90 - lat);
    theta = THREE.MathUtils.degToRad(lon);
    
    camera.target.x = 500 * Math.sin(phi) * Math.cos(theta);
    camera.target.y = 500 * Math.cos(phi);
    camera.target.z = 500 * Math.sin(phi) * Math.sin(theta);
    camera.lookAt(camera.target);
    
    renderer.render(scene, camera);
}
