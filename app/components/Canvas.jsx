import React from 'react';
import * as redux from 'redux';
import { connect } from 'react-redux';
import Matter from 'matter-js';

import * as actions from 'app/actions/actions';

export class Canvas extends React.Component {
    constructor(props) {
        super(props);

        this.animate = this.animate.bind(this);
        this.handleWindowResize = this.handleWindowResize.bind(this);
        this.playPause = this.playPause.bind(this);
        this.addBody = this.addBody.bind(this);
        this.reset = this.reset.bind(this);
        this.drawTemporaryConstraint = this.drawTemporaryConstraint.bind(this);
        this.selectedBodyForConstraint = null;
        this.initializeEventListeners = this.initializeEventListeners.bind(this);

        this.state = {
            isPlaying: true,
            selected: ''
        };
    }

    addConstraint(bodyA, bodyB) {
        const c = Matter.Constraint.create({
            bodyA,
            bodyB,
            stiffness: 0.5
        });

        this.constraints.push(c);
        Matter.World.add(this.world, c);
    }

    addBody() {
        const { selected } = this.state;
        let b;
        switch (selected) {
            case 'rect':
                b = Matter.Bodies.rectangle(this.mouse.position.x, this.mouse.position.y, 25, 25, { restitution: 1 });
                break;
            case 'circle':
                b = Matter.Bodies.circle(this.mouse.position.x, this.mouse.position.y, 25, { restitution: 1 });
                break;
            default:
                break;
        }
        this.bodies.push(b);
        Matter.World.add(this.world, b);
    }

    componentDidMount() {
        var { dispatch } = this.props;
        console.log('canvas mounted');


        var w = window.innerWidth - 300;
        var h = window.innerHeight - 50;
        this._canvas.width = w;
        this._canvas.height = h;
        this.ctx = this._canvas.getContext('2d');

        // FIXME: Mouse and canvas are not in sync.  Mousedown position is one
        // click behind where it should be.  bizarre

        this.engine = Matter.Engine.create(),
        this.world = this.engine.world;

        this.bodies = [];
        this.constraints = [];

        this.mouse = Matter.Mouse.create(this._canvas);
        this.mouseConstraint = Matter.MouseConstraint.create(this.engine, {
            mouse: this.mouse,
            constraint: {
                stiffness: 0.2
            }
        });

        this.initializeEventListeners();


        Matter.World.add(this.world, this.mouseConstraint);

        this.myFacePhysics = Matter.Bodies.circle(500, 20, 25, {restitution: 1});
        this.walls = {
            left: {
                physics: Matter.Bodies.rectangle(0, this._canvas.height / 2, 10, this._canvas.height, {isStatic: true})
            },
            right: {
                physics: Matter.Bodies.rectangle(this._canvas.width - 8, this._canvas.height / 2, 10, this._canvas.height, {isStatic: true}),
            },
            bottom: {
                physics: Matter.Bodies.rectangle(this._canvas.width / 2, this._canvas.height - 5, this._canvas.width, 10, {isStatic: true})
            },
            top: {
                physics: Matter.Bodies.rectangle(this._canvas.width / 2, 0, this._canvas.width, 10, {isStatic: true})
            }
        };

        this.bodies = this.bodies.concat([this.walls.left.physics, this.walls.right.physics, this.walls.bottom.physics, this.walls.top.physics, this.myFacePhysics]);

        Matter.World.add(this.world, [this.walls.left.physics, this.walls.right.physics, this.walls.bottom.physics, this.walls.top.physics, this.myFacePhysics]);

        this.animate(16.666);
    }

    initializeEventListeners() {
        this._canvas.addEventListener('mousedown', (e) => {
            console.log('mousedonw at ', this.mouse.mousedownPosition);
            let selected = this.state.selected;
            if (selected === 'rect' || selected === 'circle') {
                this.addBody(selected);
            } else if (selected === 'spring') {
                const bodies = Matter.Query.point(this.bodies, this.mouse.mousedownPosition);
                if (bodies.length > 0) {
                    const b = bodies[0];
                    if (this.selectedBodyForConstraint) {
                        // Second body selected, add constraint, clear out
                        // selected body
                        if (b !== this.selectedBodyForConstraint) {
                            this.addConstraint(
                                this.selectedBodyForConstraint,
                                b
                            );
                            // Matter.World.add(this.engine.world, c);
                            this.selectedBodyForConstraint = null;
                        }
                    } else {
                        this.selectedBodyForConstraint = b;
                    }
                }
            }
        });
    }

    componentWillUnmount() {
        console.log(this.frame);
        window.cancelAnimationFrame(this.frame);
        this.frame = null;
    }

    // Pixi.js animation loop
    animate(time) {
        this.frame = requestAnimationFrame(this.animate);
        // Matter.Engine.update(this.engine);
        this.renderMatter();
    }

    drawSelectedObject() {
        const { selected } = this.state;
        this.ctx.beginPath();
        this.ctx.strokeStyle = 'red';
        switch (selected) {
            case 'rect':
                this.ctx.rect(this.mouse.position.x - 25, this.mouse.position.y - 25, 25, 25);
                this.ctx.stroke();
                break;
            case 'circle':
                this.ctx.arc(this.mouse.position.x, this.mouse.position.y, 25, 0, Math.PI * 2);
                this.ctx.stroke();
                break;
            default:
                break;
        }
    }

    drawTemporaryConstraint() {
        if (this.selectedBodyForConstraint) {
            this.ctx.beginPath();
            this.ctx.moveTo(this.selectedBodyForConstraint.position.x, this.selectedBodyForConstraint.position.y);
            this.ctx.lineTo(this.mouse.position.x, this.mouse.position.y);
            this.ctx.strokeStyle = 'red';
            this.ctx.stroke();
        }
    }

    renderMatter() {
        // const { isPlaying, primativesPanelSelection, selectedObject } = this.props;
        // console.log('rendering');
        const { isPlaying, selected } = this.state;

        // clear the canvas with a transparent fill, to allow the canvas background to show
        // const worldX = this.world.bounds.min.x;
        // const worldY = this.activeState.world.bounds.min.y;
        // const worldWidth = this.activeState.world.bounds.max.x - worldX;
        // const worldHeight = this.activeState.world.bounds.max.y - worldY;

        this.ctx.globalCompositeOperation = 'source-in';
        this.ctx.fillStyle = 'transparent';
        this.ctx.fillRect(0, 0, this._canvas.width, this._canvas.height);
        this.ctx.globalCompositeOperation = 'source-over';

        this.ctx.fillStyle = '#fff';
        this.ctx.fillRect(0, 0, this._canvas.width, this._canvas.height);

        if (isPlaying) {
            Matter.Engine.update(this.engine, 16.666);
        }

        for (let i = 0; i < this.bodies.length; i++) {
            this.ctx.beginPath();
            const body = this.bodies[i];
            this.ctx.strokeStyle = body.render.strokeStyle;
            this.ctx.lineWidth = 1;
            // if (body.id === selectedObject) {
                // this.ctx.strokeStyle = 'green';
                // this.ctx.lineWidth = 3;
            // }

            const vertices = body.vertices;

            this.ctx.moveTo(vertices[0].x, vertices[0].y);

            for (let j = 1; j < vertices.length; j += 1) {
                this.ctx.lineTo(vertices[j].x, vertices[j].y);
            }

            this.ctx.lineTo(vertices[0].x, vertices[0].y);

            this.ctx.stroke();
        }

        for (let i = 0; i < this.constraints.length; i++) {
            const c = this.constraints[i];
            if (c.type !== 'mouseConstraint') {
                this.ctx.beginPath();
                this.ctx.moveTo(c.bodyA.position.x, c.bodyA.position.y);
                this.ctx.lineTo(c.bodyB.position.x, c.bodyB.position.y);
                this.ctx.strokeStyle = 'red';
                this.ctx.lineWidth = 1;
                // if (c.id === selectedObject) {
                //     this.ctx.strokeStyle = 'green';
                //     this.ctx.lineWidth = 3;
                // }
                this.ctx.stroke();
            }
        }

        this.ctx.strokeStyle = '#333';

        if (selected !== '') {
            this.drawSelectedObject();
        }

        if (this.selectedBodyForConstraint) {
            this.drawTemporaryConstraint();
        }

        // this.pan();
        // window.requestAnimationFrame(this.renderCanvas);
    }



    handleWindowResize(e) {
        // let { currentPage } = this.props;
        // if (currentPage === 'home') {
        //     this.me.homePage();
        // }
        // this._canvas.view.width = window.innerWidth;
        // this._canvas.view.height = window.innerHeight;
        // this._canvas.resize(window.innerWidth, window.innerHeight);
    }

    playPause() {
        this.setState({
            isPlaying: !this.state.isPlaying
        });
    }

    selectItem(itemName) {
        this.setState({
            selected: itemName
        });
    }

    reset() {
        this.bodies = [];
        this.constraints = [];
        this.selectedBodyForConstraint = null;
        Matter.World.clear(this.world);
        Matter.World.add(this.world, [this.walls.left.physics, this.walls.right.physics, this.walls.bottom.physics, this.walls.top.physics]);
        this.bodies = this.bodies.concat([this.walls.left.physics, this.walls.right.physics, this.walls.bottom.physics, this.walls.top.physics]);
    }

    render() {
        const { isPlaying, selected } = this.state;
        return (
            <div className='bg-cvs' ref={(c) => {this._elt=c;}}>
                <div className='buttons'>
                    <img className={selected === 'cursor' ? 'selected' : ''} src='/images/Cursor-48.png' onClick={() => {this.selectItem('cursor');}} />
                    <img className={selected === 'rect' ? 'selected' : ''} src='/images/Rectangle.png' onClick={() => {this.selectItem('rect');}} />
                    <img className={selected === 'circle' ? 'selected' : ''} src='/images/Circle.png' onClick={() => {this.selectItem('circle');}} />
                    <img className={selected === 'spring' ? 'selected' : ''} src='/images/Spring.png' onClick={() => {this.selectItem('spring');}} />
                    <img src={isPlaying ? '/images/Pause-48-black.png' : '/images/Play-48-black.png'} onClick={this.playPause} />
                    <img src='/images/Restart-48-black.png' onClick={this.reset} />
                </div>
                <canvas id='canvas' ref={c => this._canvas = c}/>
            </div>
        );
    }
}

export default connect((state) => {
    return {
        currentPage: state.currentPage
    };
})(Canvas);



