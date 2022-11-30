import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import * as dat from 'dat.gui';

export default class BaseSketch {
    constructor(selector, { withOrbitControls = true, width = null, height = null } = {}) {
        this.container = document.getElementById(selector);
        this.width = width || this.container.offsetWidth;
        this.height = height || this.container.offsetHeight;
        this.scene = new THREE.Scene();

        this.renderer = new THREE.WebGLRenderer();

        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.setSize(this.width, this.height);
        this.renderer.setClearColor(0xffffff, 1);
        this.renderer.physicallyCorrectLights = true;
        this.renderer.outputEncoding = THREE.sRGBEncoding;

        this.container.appendChild(this.renderer.domElement);

        this.addCamera(true);
        this.camera.position.set(0, 0, 2);
        this.camera.lookAt(0, 0, 0);

        if (withOrbitControls) {
            new OrbitControls(this.camera, this.renderer.domElement);
        }

        this.time = 0;

        this.setupResize();
        if (!width || !height) this.resize();
    }

    addCamera(isOrthographic = false) {
        this.isOrthographic = isOrthographic;
        const aspect = this.width / this.height;
        if (!isOrthographic) {
            this.camera = new THREE.PerspectiveCamera(
                70, //
                aspect,
                0.001,
                1000,
            );
            return;
        }
        this.frustumSize = 3;
        this.camera = new THREE.OrthographicCamera(
            (this.frustumSize * aspect) / -2,
            (this.frustumSize * aspect) / 2,
            this.frustumSize / 2,
            this.frustumSize / -2,
            0.3,
            2000,
        );
    }

    setupResize() {
        window.addEventListener('resize', this.resize.bind(this));
    }

    guiInit() {
        this.gui = new dat.GUI();
        /* this.settings = { progress: 0 }; */
        this.gui.add(this.settings, 'progress', 0, 1, 0.01);
    }

    stop() {
        if (this.rafId) {
            cancelAnimationFrame(this.rafId);
        }
        if (this.guiInit) {
            this.guiInit.destroy();
        }
        while (this.container.firstChild) {
            this.container.removeChild(this.container.firstChild);
        }
    }

    resize() {
        this.width = this.container.offsetWidth;
        this.height = this.container.offsetHeight;
        this.renderer.setSize(this.width, this.height);
        const aspect = this.width / this.height;
        this.camera.aspect = this.width / this.height;

        if (this.isOrthographic) {
            this.camera.left = (-aspect * this.frustumSize) / 2;
            this.camera.right = (aspect * this.frustumSize) / 2;
            this.camera.top = this.frustumSize / 2;
            this.camera.bottom = this.frustumSize / -2;
        }

        if (this.material && this.material.uniforms.uResolution) {
            this.material.uniforms.uResolution.value.x = this.width;
            this.material.uniforms.uResolution.value.y = this.height;
            this.material.uniforms.uResolution.value.z = this.width;
            this.material.uniforms.uResolution.value.w = this.height;
        }
        this.camera.updateProjectionMatrix();
    }

    render() {
        this.renderer.render(this.scene, this.camera);
    }

    drawText({ text, fontFamily = 'Roboto', horizontalPadding = 0.75, lineHeight = 1.5 } = {}) {
        const texCanvas = document.createElement('canvas');
        const texCtx = texCanvas.getContext('2d');
        const idealCanvasSize = 2048;
        const maxTextureSize = Math.min(this.renderer.capabilities.maxTextureSize, idealCanvasSize);
        texCanvas.width = maxTextureSize;
        texCanvas.height = maxTextureSize;

        texCtx.fillStyle = '#fff';
        texCtx.fillRect(0, 0, texCanvas.width, texCanvas.height);
        texCtx.fillStyle = '#000';
        texCtx.strokeStyle = '#fff';
        texCtx.lineWidth = 1;
        texCtx.textAlign = 'center';
        texCtx.textBaseline = 'middle';
        const referenceFontSize = 250;
        texCtx.font = `${referenceFontSize}px ${fontFamily}`;
        const metrics = texCtx.measureText(text);
        const fontHeight = metrics.fontBoundingBoxAscent + metrics.fontBoundingBoxDescent;
        /* const actualHeight = metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent; */
        const textWidth = metrics.width;
        const deltaWidth = (texCanvas.width * horizontalPadding) / textWidth;
        const fontSise = referenceFontSize * deltaWidth;
        texCtx.font = `${fontSise}px ${fontFamily}`;
        const lines = text.split('\n');

        const lineHeightPx = fontHeight * lineHeight;
        const startHeight = texCanvas.height / 2 - (lineHeightPx * (lines.length - 1)) / 2;
        lines.forEach((l, i) => {
            const offset = i * lineHeightPx;
            texCtx.fillText(l, texCanvas.width / 2, startHeight + offset);
        });

        return new THREE.CanvasTexture(texCanvas);
    }
}
