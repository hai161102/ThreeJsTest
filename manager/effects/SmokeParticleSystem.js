import ParticleSystem from "./ParticleSystem";

export default class SmokeParticleSystem extends ParticleSystem {
    spawn() {
        super.spawn();
        this.particles[this.particles.length - 1].dartX = Math.random() * 0.005 * (Math.random() > 0.5 ? 1 : -1);
        this.particles[this.particles.length - 1].dartZ = Math.random() * 0.005 * (Math.random() > 0.5 ? 1 : -1);
    }

    update(dt) {
        for (let i = 0; i < this.particles.length; i++) {
            this.particles[i].position[0] += this.particles[i].dartX;
            this.particles[i].position[1] += 0.005;
            this.particles[i].position[2] += this.particles[i].dartZ;
            this.particles[i].scale -= 0.001;
            this.particles[i].alpha -= 0.01;
        }

        super.update(dt);
    }
}