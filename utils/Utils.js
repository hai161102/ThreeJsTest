import * as THREE from 'three';

function removeAllChild(element) {
    while (element.firstChild) {
        element.removeChild(element.firstChild);
    }
}

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

function generateRenderer({width, height, toneMapping}) {
    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setSize(width, height)
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    renderer.toneMapping = toneMapping ? toneMapping : THREE.CineonToneMapping
    renderer.toneMappingExposure = 1.8
    renderer.outputColorSpace = THREE.LinearSRGBColorSpace
    return renderer
}

export {removeAllChild, generateLights, generateRenderer}