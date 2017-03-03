import React from 'react';
import * as redux from 'redux';
import { connect } from 'react-redux';
import Pixi from 'pixi.js';
// import Matter from 'matter-js';

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
        this.move = this.move.bind(this);
        Pixi.utils._saidHello = true;

        // Matter Stuff
        //     var Engine = Matter.Engine,
        // Render = Matter.Render,
        // Runner = Matter.Runner,
        // Composites = Matter.Composites,
        // Common = Matter.Common,
        // MouseConstraint = Matter.MouseConstraint,
        // Mouse = Matter.Mouse,
        // World = Matter.World,
        // Query = Matter.Query,
        // Svg = Matter.Svg,
        // Bodies = Matter.Bodies;

        // create engine
        this.engine = Matter.Engine.create(),
        this.world = this.engine.world;

        Matter.Engine.run(this.engine);
    }

    // Pixi.js animation loop
    animate(time) {
        this.frame = requestAnimationFrame(this.animate);

        this.myFaceSprite.position = this.myFacePhysics.position;
        this.myFaceSprite.rotation = this.myFacePhysics.angle;

        Object.keys(this.walls).forEach(pos => {
            let wall = this.walls[pos].physics;
            // this.graphics.lineStyle(2, 0x0000FF, 1);
            this.graphics.beginFill(0xdddddd, 1);
            let x = wall.bounds.min.x;
            let y = wall.bounds.min.y;
            let width = wall.bounds.max.x - x;
            let height = wall.bounds.max.y - y;
            this.graphics.drawRect(x, y, width, height);
        });

        this.renderer.render(this.stage);
    }

    drawBackground(time) {
        var x = 0;
        var y = 10;
        var r = 800;
        var len = window.innerWidth;
        // this.graphics.lineStyle(2, 0xffffff, 1);
    }


    componentDidMount() {
        var { dispatch } = this.props;
        console.log('canvas amounted');

        var h = window.innerHeight;
        var w = window.innerWidth;
        this.renderer = PIXI.autoDetectRenderer(w, h, {transparent: true, antialias: true});
        this.renderer.backgroundColor = 0xeeeeee;
        this._elt.appendChild(this.renderer.view);

        // create the root of the scene graph
        this.stage = new PIXI.Container();
        this.stage.width = w;
        this.stage.height = h;

        this.graphics = new PIXI.Graphics();
        this.stage.addChild(this.graphics);

        this.mouse = Matter.Mouse.create(this.renderer.view);
        this.mouseConstraint = Matter.MouseConstraint.create(this.engine, {
            mouse: this.mouse,
            constraint: {
                stiffness: 0.2
            }
        });

        Matter.World.add(this.world, this.mouseConstraint);

        this.myFacePhysics = Matter.Bodies.circle(500, 20, 25, {restitution: 1});
        this.walls = {
            left: {
                physics: Matter.Bodies.rectangle(300, this.renderer.height / 2, 10, this.renderer.height, {isStatic: true})
            },
            right: {
                physics: Matter.Bodies.rectangle(this.renderer.width - 8, this.renderer.height / 2, 10, this.renderer.height, {isStatic: true}),
            },
            bottom: {
                physics: Matter.Bodies.rectangle(300 + (this.renderer.width - 300) / 2, this.renderer.height - 5, this.renderer.width - 300, 10, {isStatic: true})
            },
            top: {
                physics: Matter.Bodies.rectangle(300 + (this.renderer.width - 300) / 2, 0, this.renderer.width - 300, 10, {isStatic: true})
            }
        };

        Matter.World.add(this.world, [this.walls.left.physics, this.walls.right.physics, this.walls.bottom.physics, this.walls.top.physics, this.myFacePhysics]);

        this.myFaceSprite = new PIXI.Sprite.fromImage('/images/profile_clipped.png');
        this.myFaceSprite.width = this.myFacePhysics.circleRadius * 2;
        this.myFaceSprite.height = this.myFacePhysics.circleRadius * 2;
        this.myFaceSprite.anchor.x = 0.5;
        this.myFaceSprite.anchor.y = 0.5;
        this.stage.addChild(this.myFaceSprite);
    }

    move() {
        const { currentPage } = this.props;
        switch(currentPage) {
            case 'work':
                this.me.projectsPage();
                break;
            case 'about':
                this.me.mePage();
                break;
            case 'contact':
                this.me.contactPage();
                break;
            case 'home':
                this.me.homePage();
                break;
            case 'blog':
                this.me.blogPage();
            default:
                break;
        }
    }

    handleWindowResize(e) {
        // let { currentPage } = this.props;
        // if (currentPage === 'home') {
        //     this.me.homePage();
        // }
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



