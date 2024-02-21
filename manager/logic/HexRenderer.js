import Face from "../models/Face";

export default class HexRenderer {
    constructor({col, row, radius, triangles}) {
        this.m_faces = new Array<Face>(col * row);
    }

    drawData() {

    }
}