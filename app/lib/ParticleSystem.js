import particle from 'app/lib/Particle';

const particleSystem = function(stage) {
    let particles = [];
    let graphics = new PIXI.Graphics();
    let colliders = [];

    const addParticle = function(x, y, size) {
        let p = particle(x, y, size);
        particles.push(p);
        stage.addChild(p.sprite);
    };

    const addCollider = function(collider) {
        colliders.push(collider);
    };

    const applyForce = function(force) {
        particles.forEach(function(p) {
            p.applyForce(force);
        });
    };

    const setAcceleration = function(accel) {
        particles.forEach(function(p) {
            p.setAcceleration(accel);
        });
    };

    let distance = function(x1, x2, y1, y2) {
        return Math.sqrt((x1 - x2)*(x1 - x2) + (y1 - y2)*(y1 - y2));
    };

    const update = function() {
        graphics.clear();


        // Update particle positions
        particles.forEach(function(p) {
            p.update(graphics);
        });

        // Check for collisions
        particles.forEach(function(p) {
            let nearby = p.findNearbyParticles(particles);
            nearby.forEach((np) => {
                graphics.lineStyle(0.5, 0xccffff, 0.5);
                graphics.moveTo(p.sprite.x, p.sprite.y);
                graphics.lineTo(np.sprite.x, np.sprite.y);
            });
            p.checkForEdges();
            p.checkForColliders(colliders);
            //p.checkForMyFace();
            //p.checkForParticleCollision(particles);
        });
    };

    return {
        update,
        addParticle,
        applyForce,
        graphics,
        setAcceleration,
        addCollider
    };
};

export default particleSystem;
