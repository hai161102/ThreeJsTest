import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { generateRenderer, removeAllChild } from './utils/Utils'
import Match from './match/Match'
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

function generateLights() {

    const ambientLight = new THREE.AmbientLight(0xffffff, 1);

    const hemiLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 0.6);
    hemiLight.position.set(0, 10, 0);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(0, 10, 0);
    directionalLight.shadow.mapSize.width = 512  // default
    directionalLight.shadow.mapSize.height = 512  // default
    directionalLight.shadow.camera.near = 1  // default
    directionalLight.shadow.camera.far = 2000  // default
    directionalLight.shadow.bias = -0.00005
    directionalLight.castShadow = true;

    return { ambientLight, hemiLight, directionalLight }
}

function initScene(modelPath, {
    side,
    toneMapping,
    shader,
    scale
}) {

    const renderer = generateRenderer({ width: side.clientWidth, height: side.clientHeight, toneMapping: toneMapping })

    let animationMixer
    const camera = new THREE.PerspectiveCamera(60, side.clientWidth / side.clientHeight, 0.1, 1000);
    camera.position.set(0, 0.2, 1);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xdedede);

    const { ambientLight, hemiLight, directionalLight } = generateLights()
    scene.add(ambientLight);
    scene.add(hemiLight);
    scene.add(directionalLight);

    const controls = new OrbitControls(camera, renderer.domElement);

    const planeGeometry = new THREE.PlaneGeometry(1000, 1000, 1, 1);
    const planeMaterial = new THREE.ShadowMaterial({
        opacity: 0.15,
        color: 0x000000,
        fog: true,
        blending: THREE.NormalBlending
    })
    const plane = new THREE.Mesh(planeGeometry, planeMaterial)
    plane.rotateX(-Math.PI / 2)
    plane.position.set(0, 0, 0)
    plane.receiveShadow = true
    scene.add(plane)
    textureLoader.load('./assets/textures/environment.jpg', (data) => {
        if (data) {
            // scene.background = data;
            // scene.environment = data;
            loader.load(modelPath, (data) => {
                if (data) {
                    scale && data.scene.scale.set(scale.x, scale.y, scale.z);
                    data.scene.traverse((child) => {
                        if (child.isMesh) {
                            child.castShadow = true
                            child.receiveShadow = true
                            // child.material.roughness = 0.5
                            child.material.envMap = data
                            child.material.needsUpdate = true;
                        }
                    })
                    directionalLight.target = data.scene
                    animationMixer = new THREE.AnimationMixer(data.scene)
                    if (data.animations.length > 0) {
                        const clip = data.animations.find(animation => animation.name === 'idle')
                        if (clip) {
                            let action = animationMixer.clipAction(clip)
                            action.loop = true
                            action.play()
                        }
                    }
                    scene.add(data.scene);
                    controls.target.set(data.scene.position.x, data.scene.position.y, data.scene.position.z)
                    controls.update();
                }
            })
        }
    }, undefined, (err) => {
        console.log(err);
    });
    const update = (dt) => {
        controls.update();
        renderer.render(scene, camera);
        animationMixer && animationMixer.update(dt)
    }
    window.addEventListener('resize', resize);


    function resize() {
        const width = side.clientWidth;
        const height = side.clientHeight;

        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height);
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

let view1 = initScene('./assets/models/dragon_lv3.glb', { side: side1})
let view2 = initScene('./assets/models/foxrain_lv2.glb', { side: side2
    // , scale: new THREE.Vector3(4, 4, 4)
})
side1.appendChild(view1.renderer.domElement)
side2.appendChild(view2.renderer.domElement)

toneMapping.value = view1.renderer.toneMapping;
toneMappingExposure.value = view1.renderer.toneMappingExposure;
toneMappingExposureValue.value = view1.renderer.toneMappingExposure;

toneMapping.addEventListener('change', (event) => {
    const toneMap = getToneMap(parseInt(event.target.value))
    view1 = initScene('./assets/models/dragon_lv3.glb', { side: side1, toneMapping: toneMap })
    view2 = initScene('./assets/models/foxrain_lv2.glb', { side: side2, toneMapping: toneMap,
        // scale: new THREE.Vector3(4, 4, 4)
    })
    removeAllChild(side1)
    removeAllChild(side2)
    side1.appendChild(view1.renderer.domElement)
    side2.appendChild(view2.renderer.domElement)
})

toneMappingExposure.addEventListener('change', (event) => {
    let value = parseFloat(event.target.value)
    view1.renderer.toneMappingExposure = value;
    view2.renderer.toneMappingExposure = value;
    toneMappingExposureValue.value = value;
})

toneMappingExposureValue.addEventListener('change', (event) => {
    let value = parseFloat(event.target.value)
    view1.renderer.toneMappingExposure = value;
    view2.renderer.toneMappingExposure = value;
    toneMappingExposure.value = value;
})
// const match = Match.generate(app)

let previous = Date.now()

const animate = () => {
    const now = Date.now()
    const delta = (now - previous) / 1000;
    view1 && view1.update(delta)
    view2 && view2.update(delta)
    // match && match.render(delta)
    previous = now;
    requestAnimationFrame(animate)
}

animate()
