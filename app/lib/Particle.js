export default class Particle {
    constructor(x, y, r, myFace) {

        this.position = {
            x: x,
            y: y
        };
        this.velocity = {
            x: Math.random() * 1.2 - 0.6,
            y: Math.random() * 0.6 - 0.3
        };
        this.acceleration = {
            x: 0,
            y: 0.01
        };

        this.myFace = myFace;

        //var img = require('../images/smokeparticle.png');
        var img = require('../images/doc-gray-circle.png');
        //var img = require('../images/drop.png');
        this.sprite = new PIXI.Sprite.fromImage(img);
        this.sprite.x = this.position.x;
        this.sprite.y = this.position.y;
        this.sprite.anchor.set(0.5);
        this.size = Math.random() * r + 3;
        this.sprite.width = this.size;
        this.sprite.height = this.size;
        this.sprite.alpha = Math.random();
        this.collided = false;

        this.r = r;
    }

    applyForce(force) {
        this.acceleration.x += force.x;
        this.accleration.y += force.y;
    }

    update(graphics) {
        this.checkEdges();
        this.checkForMyFace();
        this.velocity.x += this.acceleration.x;
        this.velocity.y += this.acceleration.y;
        this.sprite.x += this.velocity.x;
        this.sprite.y += this.velocity.y;
    }

    checkForMyFace() {
        var xDist = this.sprite.x - this.myFace.x;
        var yDist = this.sprite.y - this.myFace.y;
        var dist = Math.sqrt(xDist*xDist + yDist*yDist);
        if (dist < (this.myFace.width / 2) + (this.size/2) && !this.collided) {
            //var theta = Math.tan(this.sprite.x / this.sprite.y);
            //this.velocity.x = -this.velocity.x;
            this.velocity.y = -this.velocity.y;
            this.collided = true;
            var that = this;
            setTimeout(() => {
                this.collided = false;
            },1000);
        }
    }

    checkEdges() {
        if ((this.sprite.x + this.sprite.width) > window.innerWidth ||
            this.sprite.x < 0) {
                this.velocity.x = -this.velocity.x;

            } else if ((this.sprite.y + this.sprite.height) > window.innerHeight || 
            this.sprite.y < 0) {
                this.velocity.y = -this.velocity.y;
            }
    }
}
