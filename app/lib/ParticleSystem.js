export default class ParticleSystem {
    constructor(particles, colliders) {
        this.particles = particles || [];
        this.graphics = new PIXI.Graphics();
        this.colliders = colliders || [];
    }

    addParticle(stage, particle) {
        this.particles.push(particle);
        stage.addChild(particle.sprite);
    }

    applyForce(force) {
        this.particles.forEach((particle) => {
            particle.applyForce(force);
        });
    }

    update() {
        //this.graphics.clear();
        this.particles.forEach((particle) => {
            particle.update(this.graphics);
        });
    }
}
