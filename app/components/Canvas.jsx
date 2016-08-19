import React from 'react';
import * as redux from 'redux';
import { connect } from 'react-redux';
import Pixi from 'pixi.js';

import * as actions from 'app/actions/actions';
import Tween from 'app/lib/Tween';
import MyFace from 'app/components/MyFace';
import particleSystem from 'app/lib/ParticleSystem';
import particle from 'app/lib/Particle';

export class Canvas extends React.Component {
    constructor(props) {
        super(props);

        this.animate = this.animate.bind(this);
        this.handleWindowResize = this.handleWindowResize.bind(this);

        this.tweens = [];
    }

    // Pixi.js animation loop
    animate(time) {
        var that = this;
        this.system.update();
        this.tweens.forEach((tween) => {
            tween.update(time);
            tween.propsToAnimate.forEach((prop) => {
                if (prop === 'scale') {
                    that.me.sprite.scale.set(tween.scale);
                } else {
                    that.me.sprite[prop] = tween[prop];
                }
            });
        });

        // Check me for shaking, if not shaking
        // count idle time...if idle time
        // hits a threshold, then trigger a shake
        if (this.me.isShaking) {
            this.me.idleTime = 0;
        } else {
            this.me.idleTime += 1;

            if (this.me.idleTime > this.me.timeToShake) {
                this.me.shake();
            }
        }

        //this.drawBackground(time);

        this.renderer.render(this.stage);
        this.frame = requestAnimationFrame(this.animate);
    }

    setupGraphics() {
        this.graphics = new PIXI.Graphics();
    }

    cantor(x, y, len) {
        y += 20;
        this.graphics.moveTo(x, y);
        this.graphics.lineTo(x + len, y);

        if (len > 1) {
            var randomHex = '0x'+Math.floor(Math.random()*16777215).toString(16);
            console.log(randomHex);
            this.graphics.lineStyle(2, randomHex, 1);
            this.cantor(x, y, len / 3);
            this.cantor(x + len*2/3, y, len/3);
        }
    }
    drawCircle(x, y, r) {
        this.graphics.drawCircle(x, y, r);

        r = r/2;
        if (r > 2) {
            //this.drawCircle(x - r, y, r );
            //this.drawCircle(x + r, y, r );
            this.drawCircle(x, y + r, r );
            this.drawCircle(x, y - r, r );
        }
    }

    drawBackground(time) {

        //this.graphics.clear();

        var x = 0;
        var y = 10;
        var r = 800;
        var len = window.innerWidth;
        this.graphics.lineStyle(2, 0xffffff, 1);
        //this.drawCircle(x, y, r);
        //this.cantor(x, y, len);

    }


    componentDidMount() {
        var { dispatch } = this.props;

        var h = window.innerHeight + 300;
        var w = window.innerWidth + 300;
        this.renderer = PIXI.autoDetectRenderer(w, h, {transparent: true});
        this._elt.appendChild(this.renderer.view);

        // create the root of the scene graph
        this.stage = new PIXI.Container();
        this.stage.width = w;
        this.stage.height = h;
        this.graphics = new PIXI.Graphics();
        //this.stage.interactive = true;
        //this.stage.hitArea = new PIXI.Rectangle(0, 0, window.innerWidth, window.innerHeight);

        //this.stage.on('mousedown', this.handleMouseDown);
        //this.stage.addChild(this.graphics);

        this.bg = new PIXI.Sprite.fromImage(require('../images/winter-sunset.png'));
        this.bg.width = w;
        this.bg.height = h;
        this.bg.alpha = 0.5;
        this.bg.x = window.innerWidth / 2;
        this.bg.y = window.innerHeight / 2;
        this.bg.anchor.x = 0.5;
        this.bg.anchor.y = 0.5;
        this.stage.addChild(this.bg);
        //this.me.sprite.zOrder = 100;
        window.addEventListener('resize', this.handleWindowResize);

        this.system = particleSystem(this.stage);
        var numParticles = 50;
        var particleDist = (window.innerWidth - 10) / numParticles;
        for (var i = 0; i < numParticles; i++) {
            this.system.addParticle(i * particleDist, Math.random() * 100 + 30, Math.random() * 22 + 8);
        }
        this.stage.addChild(this.system.graphics);
        window.particleSystem = this.system;
        this.me = new MyFace(this.stage, this.tweens, dispatch);
        this.system.addCollider(this.me.sprite);

        //this.drawBackground();

        //this.system.applyForce({x: -0.01, y:-0.01});
        // Sets up tweens for entering the screen
        // shoudl only run once on intial component load
        //this.me.enter();
        //setInterval(() => {
            //this.system.applyForce({x: 0.05*forceDir});
            //setTimeout(() => {
                //this.system.setAcceleration({x: 0});
            //},5000);
            //forceDir = -forceDir;
        //}, 10000);

        var that = this;
        requestAnimationFrame(this.animate);
        setTimeout(function() {
            that.me.enter();
        }, 3000);
    }

    componentDidUpdate(prevProps) {
        var { currentPage } = this.props;
        this.me.currentPage = currentPage;

        if (prevProps.currentPage !== currentPage) {
            switch(currentPage) {
                case 'Projects':
                    this.me.projectsPage();
                    break;
                case 'Me':
                    this.me.mePage();
                    break;
                case 'Contact':
                    break;
                case 'home':
                    this.me.homePage();
                    break;
                default:
                    break;
            }
        }
    }

    handleMouseDown(e) {
        e.stopPropagation();
    }

    handleWindowResize(e) {
        this.renderer.view.width = window.innerWidth;
        this.renderer.view.height = window.innerHeight;
        this.renderer.resize(window.innerWidth, window.innerHeight);
    }

    render() {
        return (
            <div className='bg-cvs' ref={(c) => {this._elt=c;}}>
            </div>
        );
    }
}

export default connect((state) => {
    return {
        currentPage: state.currentPage
    };
})(Canvas); 



