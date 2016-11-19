import React from 'react';
import * as redux from 'redux';
import { connect } from 'react-redux';
import { StaggeredMotion, spring } from 'react-motion';
import Dropdown from 'react-dropdown';

import * as actions from 'app/actions/actions';
import $ from 'jquery';

import Project from 'app/components/Project';

export class ProjectList extends React.Component {
    constructor(props) {
        super(props);
        this.handleTouchStart = this.handleTouchStart.bind(this);
        this.handleTouchMove = this.handleTouchMove.bind(this);
        this.handleTouchEnd = this.handleTouchEnd.bind(this);
        this.filter = this.filter.bind(this);
    }

    componentDidMount() {
    }

    getDefaultStyles() {
        var { projects } = this.props;
        return projects.map((project) => {
            return {
                marginTop: 1500,
            };
        });
    }

    handleTouchStart(e) {
        this.isTouching = true;
        console.log(e.touches);
        this.startingCoordinates = {
            x: e.touches[0].clientX,
            y: e.touches[0].clientY
        };
    }

    handleTouchMove(e) {
        var { dispatch } = this.props;
        var distX = e.touches[0].clientX - this.startingCoordinates.x;
        var distY = e.touches[0].clientY - this.startingCoordinates.y;
        dispatch(actions.startDragging());

        var lastPos = parseInt(this._elt.style.left);
        if (!lastPos) { lastPos = 0; }

        console.log(lastPos);
        if (lastPos > 0) {
            this._elt.style.left = '0px';
        } else if (lastPos < -this._elt.offsetWidth + window.innerWidth) {
            this._elt.style.left = -this._elt.offsetWidth + window.innerWidth + 'px';
        } else {
            var distDragged = lastPos + distX + 'px';
            this._elt.style.left = lastPos + distX + 'px';
            this.startingCoordinates = {
                x: e.touches[0].clientX,
                y: e.touches[0].clientY
            };
        }
    }

    handleTouchEnd(e) {
        var { dispatch } = this.props;
        this.isTouching = false;
        console.log('touch end on list');
        dispatch(actions.stopDragging());
    }

    filter(e) {

    }

    componentDidUpdate() {
        var { selectedProject } = this.props;

        if (selectedProject.id === '') {
            // this._elt.style.left = '0px';
            // window.scrollTo(0,0);
            return;
        }

        // console.log(selectedProject);
        // const selectedElt = document.getElementsByClassName('selected-project')[0];
        // window.scrollTo(0, selectedElt.offsetTop);
        // setTimeout(() => {
        // }, 1000);

        // var projectWidth = window.innerWidth < 500 ? 200 : 300;
        // this._elt.style.left = -selectedProject.index * projectWidth - 12 - 24*selectedProject.index + 'px';
    }

                    // <p className='project-list-title' onClick={this.openFilter}>Filter</p>
    onSelect(e) {

    }

    render() {
        var { dispatch, projects } = this.props;

        const options = [ 'all', 'two', 'three' ];

        return (
            <div>
                <div className='project-list-filter'>
                    <p>Projects</p>
                </div>
                <StaggeredMotion
                    defaultStyles={this.getDefaultStyles()}
                    styles={ previouslyInterpolatedStyles => previouslyInterpolatedStyles.map((_, i) => {
                            return i === 0 ?  {marginTop: spring(0)} : {marginTop: spring(previouslyInterpolatedStyles[i - 1].marginTop)};
                        })}>
                    {styles =>
                        <div className='project-list'>
                            {styles.map((style, i) => {
                                return <Project index={i} project={projects[i]} key={i} style={style}/>;
                            })}
                        </div>
                    }
                </StaggeredMotion>
            </div>
        );
    }
}
//{/* <div className='project-list' onTouchStart={this.handleTouchStart} onTouchEnd={this.handleTouchEnd} onTouchMove={this.handleTouchMove} ref={(c) => { this._elt = c; }}> */}

export default connect((state) => {
    return {
        selectedProject: state.selectedProject
    };
})(ProjectList);
