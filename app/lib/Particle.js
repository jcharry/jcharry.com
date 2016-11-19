const particle = function(x, y, r) {
    //let face = myFace;
    let position = {
        x,
        y
    };
    let velocity = {
        x: Math.random() * 1.2 - 0.6,
        y: Math.random() * 0.6 - 0.3
    };
    //let velocity = {
        //x: Math.random() * 3 - 1.5,
        //y: Math.random() * 3 - 1.5
    //};
    var acceleration = {
        x: 0,
        y: 0.01
    };
    let img = require('../images/doc-gray-circle.png');
    let sprite = new PIXI.Sprite.fromImage(img);
    sprite.x = position.x;
    sprite.y = position.y;
    sprite.anchor.set(0.5);
    let size = r || Math.random() * 10;
    sprite.width = size;
    sprite.height = size;
    sprite.alpha = Math.random() * 0.7 + 0.3;
    let collided = false;

    const getVelocity = function() {
        return velocity;
    };

    const setVelocity = function(x, y) {
        velocity.x += x;
        velocity.y += y;
    };

    const reverseXVelocity = function() {
        velocity.x = -velocity.x;
    };
    const reverseYVelocity = function() {
        velocity.y = -velocity.y;
    };
    const reverseVelocity = function() {
        velocity.x = -velocity.x;
        velocity.y = -velocity.y;
    };

    const applyForce = function(force) {
        acceleration.x += force.x || 0;
        acceleration.y += force.y || 0;
    };

    const setAcceleration = function(accel) {
        if (accel.x) {
            acceleration.x = accel.x;
        }
        if (accel.y) {
            acceleration.y = accel.y;
        }
    };

    const checkForMyFace = function() {
        //let xDist = sprite.x - face.x;
        //let yDist = sprite.y - face.y;
        //let dist = Math.sqrt(xDist*xDist + yDist*yDist);
        //if (dist < (face.width / 2) + (size/2) && !collided) {
            //velocity.y = -velocity.y;
            //collided = true;
            //setTimeout(() => {
                //collided = false;
            //},1000);
        //}
    };

    const checkForEdges = function() {
        if ((sprite.x + sprite.width/2) >= window.innerWidth) {
            velocity.x = -velocity.x;
            sprite.x = window.innerWidth - sprite.width/2;
        } else if ((sprite.x - sprite.width/2) <= 0) {
            velocity.x = -velocity.x;
            sprite.x = sprite.width/2;
        } else if ((sprite.y + sprite.height/2) >= window.innerHeight) {
            velocity.y = -velocity.y;
            sprite.y = window.innerHeight - sprite.height/2;
        } else if ((sprite.y - sprite.height/2) <= 0) {
            velocity.y = -velocity.y;
            sprite.y = sprite.height/2;
        }
    };

    let distance = function(x1, x2, y1, y2) {
        return Math.sqrt((x1 - x2)*(x1 - x2) + (y1 - y2)*(y1 - y2));
    };

    const checkForParticleCollision = function(particles) {
        particles.forEach((particle) => {
            if (particle.sprite.x === sprite.x && particle.sprite.y === sprite.y) {
                return; 
            }
            if (distance(sprite.x, particle.sprite.x, sprite.y, particle.sprite.y) <= (sprite.width/2 + particle.sprite.width/2 + 0.5) && !collided) {
                
                let v1 = velocity;
                let v2 = particle.getVelocity();
                // Mag of velocity vector
                let v1Mag = Math.sqrt(v1.x*v1.x + v1.y*v1.y);
                let v2Mag = Math.sqrt(v2.x*v2.x + v2.y*v2.y);
                // angle of motion
                let theta1 = Math.atan2(velocity.y, velocity.x);
                let theta2 = Math.atan2(v2.y, v2.x);
                // phi = angle of collision
                let phi = Math.atan2(particle.sprite.y - sprite.y, particle.sprite.x - sprite.x);
                let m1 = sprite.width/5;
                let m2 = particle.sprite.width/5;
                let totalMass = m1+m2;

                let v1x = ((v1Mag*Math.cos(theta1 - phi)*(m1 - m2) + 2*m2*v2Mag*Math.cos(theta2 - phi)) / totalMass)* Math.cos(phi) + v1Mag * Math.sin(theta1 - phi) * Math.cos(phi + Math.PI/2);
                let v1y = ((v1Mag*Math.cos(theta1 - phi)*(m1 - m2) + 2*m2*v2Mag*Math.cos(theta2 - phi)) / totalMass)*Math.sin(phi)  + v1Mag * Math.sin(theta1 - phi) * Math.sin(phi + Math.PI/2);

                velocity.x = Math.abs(v1x) < 1.5 ? v1x : Math.sign(v1x)*1.5;
                velocity.y = Math.abs(v1y) < 1.5 ? v1y : Math.sign(v1y)*1.5;
                sprite.x = sprite.x + velocity.x;
                sprite.y = sprite.y + velocity.y;
            }
        });
    };

    const checkForColliders = function(colliders) {
        colliders.forEach((collider) => {
            if (distance(sprite.x, collider.x, sprite.y, collider.y) <= (sprite.width/2 + collider.width/2)) {
                let phi = Math.atan2(collider.y - sprite.y, collider.x - sprite.x);
                let theta1 = Math.atan2(velocity.y, velocity.x);
                let v1Mag = Math.sqrt(velocity.x*velocity.x + velocity.y*velocity.y);
                let v2Mag = 0;
                let theta2 = 0;
                let m1 = 1, m2 = 10000;
                let totalMass = m1+m2;
                let v1x = ((v1Mag*Math.cos(theta1 - phi)*(m1 - m2) + 2*m2*v2Mag*Math.cos(theta2 - phi)) / totalMass)* Math.cos(phi) + v1Mag * Math.sin(theta1 - phi) * Math.cos(phi + Math.PI/2);
                let v1y = ((v1Mag*Math.cos(theta1 - phi)*(m1 - m2) + 2*m2*v2Mag*Math.cos(theta2 - phi)) / totalMass)*Math.sin(phi)  + v1Mag * Math.sin(theta1 - phi) * Math.sin(phi + Math.PI/2);
                velocity.x = v1x;
                velocity.y = v1y;
            }
        });
    };

    const checkForThresholdDist = function(particle, threshold) {
        if (distance(sprite.x, particle.sprite.x, sprite.y, particle.sprite.y) < threshold) {
            return true;
        } else {
            return false;
        }
    };

    const findNearbyParticles = function(particleList) {
        let nearby = [];
        let collisions = [];
        particleList.forEach(function(p) {
            if (sprite.x !== p.sprite.x && sprite.y !== p.sprite.y) {
                // If we're 30 pixels away from another particle...
                if(checkForThresholdDist(p, 50)) {
                    nearby.push(p);
                }
            }
        });
        return nearby;
    };

    const update = function(graphics) {
        velocity.x += acceleration.x;
        velocity.y += acceleration.y;
        sprite.x += velocity.x;
        sprite.y += velocity.y;
    };


    return {
        applyForce,
        update,
        sprite,
        getVelocity,
        setVelocity,
        findNearbyParticles,
        setAcceleration,
        checkForMyFace,
        checkForEdges,
        checkForParticleCollision,
        checkForColliders
    };
};

export default particle;
