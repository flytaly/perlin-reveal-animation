import * as THREE from 'three';
import vertex from './shaders/vertex.glsl';
import fragment from './shaders/fragment.glsl';
import BaseSketch from './base-sketch';
import perlin from './perlin-512x512.jpg';
import gsap from 'gsap';

export default class Sketch extends BaseSketch {
    constructor(selector) {
        super(selector, { withOrbitControls: false });

        this.settings = { progress: 0 };
        this.time = 0;
        this.addObjects();

        gsap.to(this.settings, {
            progress: 1,
            duration: 1,
            onUpdate: () => this.nextRender(),
            onComplete: () => {
                this.guiInit();
                this.animate();
            },
        });
    }

    addObjects() {
        this.material = new THREE.ShaderMaterial({
            side: THREE.DoubleSide,
            uniforms: {
                uTime: { value: 0 },
                uMaskTexture: {
                    value: this.drawText({
                        text: 'Hello \n world!',
                        horizontalPadding: 1.8,
                        lineHeight: 2.5,
                        fontFamily: 'Nunito',
                    }),
                },
                uColor: { value: new THREE.Color('black') },
                uRevealTexture: { value: new THREE.TextureLoader().load(perlin) },
                uRevealProgress: { value: this.settings.progress },
            },
            /* wireframe: true, */
            vertexShader: vertex,
            fragmentShader: fragment,
            transparent: true,
        });
        const geometry = new THREE.PlaneGeometry(2, 2, 1, 1);
        const plane = new THREE.Mesh(geometry, this.material);
        this.scene.add(plane);
    }

    nextRender() {
        this.time += 0.05;

        this.material.uniforms.uRevealProgress.value = this.settings.progress;
        this.material.uniforms.uTime.value = this.time;

        this.render();
    }

    animate() {
        this.nextRender();
        this.rafId = requestAnimationFrame(this.animate.bind(this));
    }
}

new Sketch('container');
