import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { generateLights, generateRenderer, removeAllChild } from "../utils/Utils";

export default class Match {

    static generate(parentElementHTML) {
        const match = new Match(
            generateRenderer(parentElementHTML.clientWidth, parentElementHTML.clientHeight),
            {width: window.innerWidth, height: window.innerHeight}
        )
        removeAllChild(parentElementHTML)
        parentElementHTML.appendChild(match.renderer.domElement)
        return match
    }

    constructor(renderer, {width, height}) {
        this.renderer = renderer;

        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0xdedede);

        this.camera = new THREE.PerspectiveCamera(60, width / height, 1, 1000);
        this.camera.position.set(1, 1, 1);

        this.controls = new OrbitControls(this.camera, renderer.domElement);
        const { ambientLight, hemiLight, directionalLight } = generateLights();
        this.scene.add(ambientLight);
        this.scene.add(hemiLight);
        this.scene.add(directionalLight);

        this.leftSide = new THREE.Object3D();
        this.rightSide = new THREE.Object3D();
        this.scene.add(this.leftSide);
        this.scene.add(this.rightSide);
    }

    addPet(pet, side) {
        if (!side) return
        if (side === 'left') {
            this.leftSide.add(pet)
        }
        else if (side === 'right') {
            this.rightSide.add(pet)
        }
        else return
        
    }

    render(dt) {
        this.controls.update();
        this.renderer.render(this.scene, this.camera);
    }
}