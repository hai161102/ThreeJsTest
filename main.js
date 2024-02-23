import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { generateRenderer, removeAllChild, generateLights, getCapsule } from './utils/Utils'
import GrowParticleSystem from './manager/effects/GrowParticleSystem'
import Match from './match/Match'

import System, {
    Emitter,
    Rate,
    Span,
    Position,
    Mass,
    Radius,
    Life,
    PointZone,
    Vector3D,
    Alpha,
    Scale,
    Color,
    SpriteRenderer,
} from 'three-nebula';


import particleSystemLevelUp from "./assets/effects/levelup.json" assert { type: 'json' };
console.log(particleSystemLevelUp)


const app = document.getElementById('app')
const side1 = document.getElementById('side1')
const side2 = document.getElementById('side2')

const toneMapping = document.getElementById('tone')
const toneMappingExposure = document.getElementById('tonemap')
const toneMappingExposureValue = document.getElementById('tonemapvalue')

const tones = [
    {
        key: 'THREE.NoToneMapping',
        value: THREE.NoToneMapping
    },
    {
        key: 'THREE.LinearToneMapping',
        value: THREE.LinearToneMapping
    },
    {
        key: 'THREE.ReinhardToneMapping',
        value: THREE.ReinhardToneMapping
    },
    {
        key: 'THREE.CineonToneMapping',
        value: THREE.CineonToneMapping
    },
    {
        key: 'THREE.ACESFilmicToneMapping',
        value: THREE.ACESFilmicToneMapping
    },
    {
        key: 'THREE.AgXToneMapping',
        value: THREE.AgXToneMapping
    },
    {
        key: 'THREE.CustomToneMapping',
        value: THREE.CustomToneMapping
    },
]

tones.forEach(tone => {
    const option = document.createElement('option')
    option.value = tone.value
    option.innerText = tone.key
    toneMapping.appendChild(option)
})


const textureLoader = new THREE.TextureLoader();
const loader = new GLTFLoader();
const raycaster = new THREE.Raycaster();
function initScene(modelPath, {
    side,
    toneMapping,
    shader,
    scale
}) {
    const renderer = generateRenderer({ width: side.clientWidth, height: side.clientHeight, toneMapping: toneMapping })

    let animationMixer
    const camera = new THREE.PerspectiveCamera(60, side.clientWidth / side.clientHeight, 0.1, 1000);
    camera.position.set(5, 5, 5);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xdedede);

    const { ambientLight, hemiLight, directionalLight } = generateLights()
    scene.add(ambientLight);
    scene.add(hemiLight);
    scene.add(directionalLight);

    const size = 50;
    const divisions = 50;

    const gridHelper = new THREE.GridHelper(size, divisions);
    scene.add(gridHelper);
    const controls = new OrbitControls(camera, renderer.domElement);

    const planeGeometry = new THREE.PlaneGeometry(1000, 1000, 1, 1);
    const planeMaterial = new THREE.ShadowMaterial({
        opacity: 0.15,
        color: 0x000000,
        fog: true,
        blending: THREE.NormalBlending
    })
    const plane = new THREE.Mesh(planeGeometry, planeMaterial)
    plane.name = 'ground'
    plane.rotateX(-Math.PI / 2)
    plane.position.set(0, 0, 0)
    plane.receiveShadow = true
    scene.add(plane)
    let particleSystem;
    let flameParticles;

    textureLoader.load('./assets/textures/environment.jpg', (data) => {
        if (data) {
            // scene.background = data;
            // scene.environment = data;
            loader.load(modelPath, (model) => {
                if (model) {
                    model.scene.traverse((child) => {
                        if (child.isMesh) {
                            child.castShadow = true
                            child.receiveShadow = true
                            child.material.roughness = 0.5
                            child.material.envMap = data
                            child.material.needsUpdate = true;
                            const boxSize = child.geometry.boundingBox.getSize(new THREE.Vector3());
                            model.scene.add(getCapsule(boxSize.clone()).clone(false));
                        }
                    })
                    scale && model.scene.scale.set(scale.x, scale.y, scale.z);

                    directionalLight.target = model.scene
                    animationMixer = new THREE.AnimationMixer(model.scene)
                    if (model.animations.length > 0) {
                        const clip = model.animations.find(animation => animation.name === 'idle')
                        if (clip) {
                            let action = animationMixer.clipAction(clip)
                            action.loop = true
                            action.play()
                        }
                    }
                    scene.add(model.scene);
                    camera.lookAt(model.scene.position)
                    camera.updateMatrix()
                    controls.target.set(model.scene.position.x, model.scene.position.y, model.scene.position.z)
                    controls.update();
                    textureLoader.load('./assets/textures/thingLight.png', (data) => {
                        if (data) {
                            data.flipY = false;
                            flameParticles = new GrowParticleSystem({canvas: side, texture: data, emit_every: 0.5, particle_life: 0.5});
                            flameParticles.setPosition(new THREE.Vector3(0, 0, 0));
                            model.scene.add(flameParticles.getMesh());
                        }
                    });
                }
            })
        }
    }, undefined, (err) => {
        console.log(err);
    });
    
    // System.fromJSONAsync(particleSystemLevelUp.particleSystemState, THREE).then(system => {
    //     const particleRenderer = new SpriteRenderer(scene, THREE);
    //     particleSystem = system.addRenderer(particleRenderer)
    //     console.log(particleSystem)
    // }, err => {
    //     console.log(err)
    // });

    const update = (dt) => {
        controls.update();
        renderer.render(scene, camera);
        animationMixer && animationMixer.update(dt)
        directionalLight.updateMatrix()
        particleSystem && particleSystem.update()
        flameParticles && flameParticles.update(dt);
    }
    window.addEventListener('resize', resize);
    // document.addEventListener('mouseup')

    let raycastObjet = null
    let listMesh = []
    side.addEventListener('mousedown', (e) => {
        // console.clear()
        listMesh = []
        const point = new THREE.Vector2(
            (e.clientX / side.clientWidth) * 2 - 1,
            - (e.clientY / side.clientHeight) * 2 + 1
        )
        scene.traverse((child) => {
            if (child.name === 'raycastMesh') {
                listMesh.push(child)
            }
        })
        raycaster.setFromCamera(point, camera);
        const intersects = raycaster.intersectObjects(listMesh, false);
        if (intersects.length > 0) {
            const { object } = intersects[0]
            object && object !== plane && object !== gridHelper && (raycastObjet = object.parent)
        }
    })
    side.addEventListener('mousemove', (e) => {
        if (!raycastObjet) return
        const point = new THREE.Vector2(
            (e.clientX / side.clientWidth) * 2 - 1,
            - (e.clientY / side.clientHeight) * 2 + 1
        )
        raycaster.setFromCamera(point, camera);
        const intersects = raycaster.intersectObject(plane, false);
        if (intersects.length > 0) {
            const data = intersects[0]
            if (data) {
                raycastObjet.position.set(data.point.x, data.point.y + 0.2, data.point.z);
            }
        }
    })

    side.addEventListener('mouseup', (e) => {
        raycastObjet && raycastObjet.position.setY(0)
        raycastObjet = null
    })

    function resize() {
        const width = side.clientWidth;
        const height = side.clientHeight;

        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height);

        flameParticles && flameParticles.updateAspect();
    }


    return { renderer, update }

}

const getToneMap = (value) => {
    switch (value) {
        case 0: return THREE.NoToneMapping;
        case 1: return THREE.LinearToneMapping;
        case 2: return THREE.ReinhardToneMapping;
        case 3: return THREE.CineonToneMapping;
        case 4: return THREE.ACESFilmicToneMapping;
        case 5: return THREE.CustomToneMapping;
        case 6: return THREE.AgXToneMapping;
        default: return THREE.NoToneMapping;
    }
}

// let view1 = initScene('./assets/models/Astronaut.glb', { side: side1 })
let view2 = initScene('./assets/models/dragon_lv3.glb', {
    side: side2,
    // scale: new THREE.Vector3(4, 4, 4)
})
// side1.appendChild(view1.renderer.domElement)
side2.appendChild(view2.renderer.domElement)



toneMapping.value = view2.renderer.toneMapping;
toneMappingExposure.value = view2.renderer.toneMappingExposure;
toneMappingExposureValue.value = view2.renderer.toneMappingExposure;

toneMapping.addEventListener('change', (event) => {
    const toneMap = getToneMap(parseInt(event.target.value))
    // view1 = initScene('./assets/models/dragon_lv3.glb', { side: side1, toneMapping: toneMap })
    view2 = initScene('./assets/models/dragon_lv3.glb', {
        side: side2, toneMapping: toneMap,
        // scale: new THREE.Vector3(4, 4, 4)
    })
    // removeAllChild(side1)
    removeAllChild(side2)
    // side1.appendChild(view1.renderer.domElement)
    side2.appendChild(view2.renderer.domElement)
})

toneMappingExposure.addEventListener('change', (event) => {
    let value = parseFloat(event.target.value)
    // view1.renderer.toneMappingExposure = value;
    view2.renderer.toneMappingExposure = value;
    toneMappingExposureValue.value = value;
})

toneMappingExposureValue.addEventListener('change', (event) => {
    let value = parseFloat(event.target.value)
    // view1.renderer.toneMappingExposure = value;
    view2.renderer.toneMappingExposure = value;
    toneMappingExposure.value = value;
})
// const match = Match.generate(app)

let previous = Date.now()

const animate = () => {
    const now = Date.now()
    const delta = (now - previous) / 1000;
    // view1 && view1.update(delta)
    view2 && view2.update(delta)
    // match && match.render(delta)
    previous = now;
    requestAnimationFrame(animate)
}

animate()
