import * as THREE from 'three'

export default class Face {
    constructor({vertices, triangles, uvs}) {
        this.vertices = vertices;
        this.triangles = triangles;
        this.uvs = uvs;
    }
}