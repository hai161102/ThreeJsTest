
import * as THREE from 'three'
import { AdditiveBlending, Color, DoubleSide, Mesh, MeshBasicMaterial, NormalBlending, PlaneGeometry, TextureLoader } from "three";

import ParticleSystem from "./ParticleSystem";

export default class GrowParticleSystem extends ParticleSystem {
    constructor({canvas, texture, emit_every, particle_life, radius = 0.5, segments = 32 }) {
        super({canvas, texture, emit_every, particle_life });
        // this.speed = 1;
        this.radius = radius;
        this.segments = segments;
        this.positions = [];
        // this.generatePositions();
        // console.log(this.positions)
        new TextureLoader().load('../../assets/textures/lightQ.png', (data) => {
            if (data) {
                const planeGeometry = new PlaneGeometry(radius * 2, radius * 2, 1, 1)
                const planeMaterial = new THREE.MeshLambertMaterial({
                    map: data,
                    emissiveMap: data,
                    emissive: new Color(0xFFFF00),
                    color: new Color(0xFFFF00),
                    transparent: true,
                    blending: THREE.AdditiveBlending,
                })
                const plane = new Mesh(planeGeometry, planeMaterial)
                plane.rotateX(-Math.PI / 2)
                this.mesh.add(plane)
                console.log(this.mesh)

            }
        })
    }

    generatePositions() {
        let angleDeg = 360 / this.segments;
        let angleRad = angleDeg * Math.PI / 180;
        for (let i = 0; i < this.segments; i++) {
            let x = Math.sin(angleRad * i) * this.radius;
            let y = Math.cos(angleRad * i) * this.radius;
            this.positions.push([x, 0, y]);
        }
    }
    update(dt) {
        // this.positions.forEach(pos => {
        //     this.spawn({position: [pos[0], 0, pos[2]], scale: [0.5, 1, 0.5], color: new Color(0xFF8080) })
        // })
        let angle = Math.random() * (Math.PI * 2);
        let x = Math.sin(angle) * this.radius;
        let y = Math.cos(angle) * this.radius;
        this.spawn({ position: [x, 0.2, y], scale: 0.5, color: new Color(0xFFFF00) })
        for (let i = 0; i < this.particles.length; i++) {
            this.particles[i].position[1] += dt * this.speed;
        }
        super.update(dt);
    }
}