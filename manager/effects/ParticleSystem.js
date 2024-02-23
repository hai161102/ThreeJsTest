import * as THREE from 'three'

const vertexShader = `
  uniform float pointMultiplier;

  attribute float scale;
  attribute vec4 colour;
 
  varying vec4 vColour;
 
  void main() {
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * mvPosition;
    gl_PointSize = pointMultiplier * 1500.0 * scale / gl_Position.w;
    vColour = colour;
  }
`;

const fragmentShader = `
  uniform sampler2D diffuseTexture;
  varying vec4 vColour;

  void main() {
    gl_FragColor = texture2D(diffuseTexture, gl_PointCoord) * vColour;
  }
`;

export default class ParticleSystem {
    constructor({canvas, texture, emit_every, particle_life }) {
        this.texture = texture;
        this.emit_every = emit_every;
        this.particle_life = particle_life;
        this.last_emission = 0;
        this.maxHeight = 2;
        this.speed = 3;
        this.vertexShader = vertexShader;
        this.fragmentShader = fragmentShader;
        this.geometry = new THREE.BufferGeometry();
        this.particles = [];
        this.material = new THREE.ShaderMaterial({
            uniforms: {
                diffuseTexture: { value: texture },
                pointMultiplier: { value: canvas.clientHeight / canvas.clientWidth }
            },
            vertexShader,
            fragmentShader,
            blending: THREE.NormalBlending,
            depthTest: true,
            depthWrite: false,
            transparent: true,
            vertexColors: true,
        });
        this.mesh = new THREE.Object3D();
        this.points = new THREE.Points(this.geometry, this.material);
        this.mesh.add(this.points);
        this.clock = new THREE.Clock();
    }

    setPosition(position) {
        this.mesh.position.x = position.x;
        this.mesh.position.y = position.y;
        this.mesh.position.z = position.z;
    }

    getMesh() {
        return this.mesh;
    }

    updateAspect() {
        this.material.uniforms.pointMultiplier.value = window.innerHeight / window.innerWidth;
    }

    spawn({position = [0, 0, 0], scale = 1, color = new THREE.Color(0xffffff)}, random = false) {
        if (random) {
            position = [
                Math.random() - 0.5,
                0,
                Math.random() - 0.5,
            ]
        }
        this.particles.push({
            position,
            scale,
            colour: [color.r, color.g, color.b, 1.0],
            spawnTime: this.clock.elapsedTime,
        });

        this.last_emission = this.clock.elapsedTime;
    }

    update(dt) {
        const elapsedTime = this.clock.getElapsedTime();
        this.particles = this.particles.filter((particle) => elapsedTime - particle.spawnTime < this.particle_life);

        // if (elapsedTime - this.last_emission >= this.emit_every) {
        //     this.spawn({color: new THREE.Color(0xFF8080)}, true);
        // }
        this.particles.forEach((particle) => {
            if (particle.position[1] >= this.maxHeight) {
                this.particles.splice(this.particles.indexOf(particle), 1);
            }
        })

        this.geometry.setAttribute("position", new THREE.Float32BufferAttribute(this.particles.map((particle) => particle.position).flat(), 3));
        this.geometry.setAttribute("scale", new THREE.Float32BufferAttribute(this.particles.map((particle) => particle.scale).flat(), 1));
        this.geometry.setAttribute("colour", new THREE.Float32BufferAttribute(this.particles.map((particle) => particle.colour).flat(), 4));
        this.geometry.attributes.position.needsUpdate = true;
        this.geometry.attributes.scale.needsUpdate = true;
        this.geometry.attributes.colour.needsUpdate = true
    }
}