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
    directionalLight.shadow.mapSize.width = 2048  // default
    directionalLight.shadow.mapSize.height = 2048  // default
    directionalLight.shadow.camera.near = 0.1  // default
    directionalLight.shadow.camera.far = 2000  // default
    directionalLight.shadow.bias = -0.00005
    directionalLight.castShadow = true;

    return { ambientLight, hemiLight, directionalLight }
}

function generateRenderer({ width, height, toneMapping }) {
    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setSize(width, height)
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    renderer.toneMapping = toneMapping ? toneMapping : THREE.CineonToneMapping
    renderer.toneMappingExposure = 1.8
    renderer.outputColorSpace = THREE.LinearSRGBColorSpace
    return renderer
}

function getCapsule(scaleTo) {
    const geo = new THREE.CylinderGeometry()
    const mat = new THREE.MeshBasicMaterial({
        color: 0x000000,
        depthTest: false,
        transparent: true,
        opacity: 0.2,
        side: THREE.DoubleSide,
        wireframe: true
    })
    const maxSize = 0.3
    const mesh = new THREE.Mesh(geo, mat)
    const box = new THREE.Box3().setFromObject(mesh);
    const boxSize = box.getSize(new THREE.Vector3());
    const scale = new THREE.Vector3(
        (scaleTo.x >= maxSize ? maxSize : scaleTo.x) / boxSize.x,
        scaleTo.y / boxSize.y,
        (scaleTo.z >= maxSize ? maxSize : scaleTo.z) / boxSize.z
    )
    mesh.scale.set(scale.x, scale.y, scale.z)
    let size = box.setFromObject(mesh).getSize(new THREE.Vector3());
    mesh.position.setY(size.y / 2);
    mesh.name = 'raycastMesh'
    return mesh
}

export { removeAllChild, generateLights, generateRenderer, getCapsule }