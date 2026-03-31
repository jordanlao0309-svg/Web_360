# Visores Interactivos 360 y Cilíndrico 🌐

Este proyecto es una aplicación web interactiva desarrollada con **Three.js** puro que permite visualizar imágenes panorámicas de dos maneras diferentes:

1. **Visor 360º (Esférico):** Diseñado para fotografías equirectangulares que cubren un campo de visión completo de 360 grados en todas las direcciones (cielo y suelo).
2. **Visor Cilíndrico:** Diseñado para fotografías panorámicas estándar (como las tomadas con teléfonos móviles), mostrándolas en un anillo a tu alrededor con un recorrido guiado.

## Características ✨

- **100% Web Nativo:** Construido con HTML, CSS, y JavaScript puro (sin frameworks como React o Angular).
- **Three.js:** Renderizado 3D fluido y soporte para WebGL.
- **Controles Universales:** Soporte completo para exploración con ratón (arrastrar y zoom con la rueda) y para dispositivos móviles (táctil).
- **Recorrido Automático:** El visor cilíndrico cuenta con un botón para iniciar un tour guiado automático que rota suavemente la cámara y avanza entre la galería de imágenes.
- **Diseño Responsivo:** Interfaz adaptable a cualquier tamaño de pantalla.

## Estructura de Archivos 📁

```text
/
├── index.html               # Menú principal de navegación
├── visor-360.html           # Interfaz del visor esférico
├── visor-cilindro.html      # Interfaz del visor cilíndrico
├── js/
│   ├── app-360.js           # Lógica Three.js para la esfera completa
│   └── app-cilindro.js      # Lógica Three.js (Auto-Tour) para el cilindro
└── img/
    ├── 360/                 # (Carpeta) Fotos equirectangulares completas
    └── cilindro/            # (Carpeta) Fotos panorámicas de celular estándar
```

## Visualización Local 🚀

Debido a cómo funcionan los motores 3D en web y las políticas de seguridad (CORS), no puedes simplemente hacer doble clic en el `index.html`. Necesitas ejecutar un pequeño servidor local.

### Usando VS Code (Recomendado)
1. Abre esta carpeta en **Visual Studio Code**.
2. Instala la extensión **Live Server**.
3. Abre el archivo `index.html` y haz clic en el botón **"Go Live"** en la barra inferior del editor.

### Usando Terminal (Node.js)
Si tienes Node.js instalado, abre tu terminal en la carpeta del proyecto y ejecuta:
```bash
npx http-server -p 3000 -c-1
```
Y abre `http://localhost:3000` en tu navegador de internet.
