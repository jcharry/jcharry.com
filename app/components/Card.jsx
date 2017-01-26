import React from 'react';
import * as redux from 'redux';
import { connect } from 'react-redux';
import { Motion, spring } from 'react-motion';

import * as actions from 'app/actions/actions';

export class Card extends React.Component {
    constructor(props) {
        super(props);
        this.isMouseDown = false;

        this.handleMouseDown = this.handleMouseDown.bind(this);
        this.handleMouseUp = this.handleMouseUp.bind(this);
        this.handleMouseMove = this.handleMouseMove.bind(this);
    }

    handleMouseDown(e) {
        this.isMouseDown = true;
        this._elt.style.transition = 'none';
        var x;
        var y;

        if (e.touches) {
            x = e.touches[0].clientX;
            y = e.touches[0].clientY;
        } else {
            x = e.screenX;
            y = e.screenY;
        }

        this.startingCoordinates = {
            x,
            y
        };
    }
    handleMouseUp(e) {
        var { dispatch, next, last } = this.props;
        this.isMouseDown = false;
        this._elt.style.transition = 'all 0.5s';
        this._elt.style.transform = 'rotate(0deg) scale(1)';
        if (parseInt(this._elt.style.left) < -100 ) {
            if (next) {
                //this._elt.style.left = -window.innerWidth + 'px';
                dispatch(actions.nextCard(next, 'forward'));
                return;
            } else {
                this._elt.style.left = 0;
            }
        } else if (parseInt(this._elt.style.left) > 100){
            if (last) {
                //this._elt.style.left = window.innerWidth + 'px';
                dispatch(actions.nextCard(last, 'back'));
                return;
            } else {
                this._elt.style.left = 0;
            }
        } else {
            this._elt.style.left = 0;
        }
    }

    handleMouseMove(e) {

        if (this.isMouseDown) {

            var distDragged;
            if (e.touches) {
                distDragged = e.touches[0].clientX - this.startingCoordinates.x;
            } else {
                distDragged = e.screenX - this.startingCoordinates.x;
            }
            var lastPos = parseInt(this._elt.style.left);
            this._elt.style.left = lastPos + distDragged + 'px';
            this.startingCoordinates.x = e.screenX || e.touches[0].clientX;

            this._elt.style.transform = 'rotate('+parseInt(this._elt.style.left)/100+'deg)';
        }
    }

    componentWillMount() {
    }

    componentDidMount() {
        var { dir } = this.props;
    }

    render() {
        var { contents, dir, next, last } = this.props;
        function renderButtons() {
        }
        return (
            <Motion
                defaultStyle={{left: dir === 'forward' ? window.innerWidth : -window.innerWidth}}
                style={{ left: spring(0) }}>
                {interpolatingStyle =>
                    <div className='card' style={interpolatingStyle} ref={(c) => { this._elt = c;}} onTouchStart={this.handleMouseDown} onTouchMove={this.handleMouseMove} onTouchEnd={this.handleMouseUp} onMouseUp={this.handleMouseUp} onMouseMove={this.handleMouseMove} onMouseDown={this.handleMouseDown}>
                        <div className='card-contents'>
                            <h2>{contents.title}</h2>
                            <div className='list-contents'>
                                {contents.children}
                            </div>
                        </div>

                    </div>
                }
            </Motion>
        );
    }
}

export default connect()(Card);
