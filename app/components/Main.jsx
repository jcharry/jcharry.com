import React from 'react';
import * as redux from 'redux';
import { connect } from 'react-redux';
import { hashHistory } from 'react-router';

import $ from 'jquery';
require('jquery-mousewheel');

import * as actions from 'app/actions/actions';

import projects from 'app/db/projects';
import ProjectList from 'app/components/ProjectList';
import Canvas from 'app/components/Canvas';
import FanMenu from 'app/components/FanMenu';
import Me from 'app/components/Me';

export class Main extends React.Component {
    constructor(props) {
        super(props);

        //this.handleMouseWheel = this.handleMouseWheel.bind(this);
    }

    mouseWheelHandler(event, delta) {
        this.scrollLeft -= (delta);
        event.preventDefault();
    }

    scrollHorizontally(e) {
        e = window.event || e;
        var delta = Math.max(-1, Math.min(1, (e.wheelDelta || -e.detail)));
        document.documentElement.scrollLeft -= (delta*40); // Multiplied by 40
        document.body.scrollLeft -= (delta*40); // Multiplied by 40
        e.preventDefault();
    }

    componentDidUpdate() {
        var { fanDisplayOpen, currentPage } = this.props;
        console.log('fan should open');

        // If we're looking at projects, set mousewheel to scroll
        // horizontally
        if (currentPage === 'Projects') {
            if (window.addEventListener) {
                // IE9, Chrome, Safari, Opera
                window.addEventListener("mousewheel", this.scrollHorizontally, false);
                // Firefox
                window.addEventListener("DOMMouseScroll", this.scrollHorizontally, false);
            } else {
                // IE 6/7/8
                window.attachEvent("onmousewheel", this.scrollHorizontally);
            }
            //$('html, body').mousewheel(this.mouseWheelHandler);
            //$('html, body').on('mousewheel', this.mouseWheelHandler);
            //console.log($('html, body').mousewheel);
            
        } else {
            if (window.removeEventListener) {
                // IE9, Chrome, Safari, Opera
                window.removeEventListener("mousewheel", this.scrollHorizontally, false);
                // Firefox
                window.removeEventListener("DOMMouseScroll", this.scrollHorizontally, false);
            } else {
                // IE 6/7/8
                window.detachEvent("onmousewheel", this.scrollHorizontally);
            }
            //$('html, body').off('mousewheel', this.mouseWheelHandler);
            console.log(window.mousewheel);
            //console.log($('html, body').mousewheel);
        }

        // Disable All touch events
        $('html, body').on('touchstart touchmove', (e) => {
            e.preventDefault();
        });
    }

    render() {
        var { dispatch, fanDisplayOpen, currentPage } = this.props;
        return (
            <div className='main'>
                <FanMenu />
                <Canvas />
                {currentPage !== 'home' && <button className='back-button' onTouchStart={() => {dispatch(actions.currentPage('home'));}} onClick={() => {dispatch(actions.currentPage('home'));}}>x</button>}
                <div style={{opacity: currentPage === 'home' ? 1 : 0}} className='home-text'>
                    <p>Hi, I'm Jamie</p>
                    <p>Full Stack Web Developer & Creative Coder, Currently purusing MPS at NYU ITP</p>
                </div>
                {currentPage === 'Projects' && <ProjectList projects={projects}/>}
                {currentPage === 'Me' && <Me />}
            </div>
        );
    }

}

export default connect((state) => {
    return {
        fanDisplayOpen: state.fanDisplayOpen,
        currentPage: state.currentPage
    };
})(Main);

