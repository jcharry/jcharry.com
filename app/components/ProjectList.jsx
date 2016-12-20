import React from 'react';
import { connect } from 'react-redux';
import { TransitionMotion, spring, presets } from 'react-motion';

import * as actions from 'app/actions/actions';
import $ from 'jquery';

import Project from 'app/components/Project';
import Filter from 'app/components/Filter';

export class ProjectList extends React.Component {
    constructor(props) {
        super(props);
        this.getDefaultStyles = this.getDefaultStyles.bind(this);
        this.getStyles = this.getStyles.bind(this);
        this.willLeave = this.willLeave.bind(this);
        this.willEnter = this.willEnter.bind(this);
    }

    // componentDidMount() {
    //     const { dispatch } = this.props;
    //     dispatch(actions.currentPage('work'));
    // }

    getDefaultStyles() {
        const { projects } = this.props;
        return projects.map((prj, i) => {
            return {
                data: {
                    ...prj.id
                },
                key: prj.id,
                style: {
                    marginTop: 100,
                    opacity: 0
                }
            };
        });
    }

    getStyles() {
        const { projects } = this.props;
        return projects.map((prj, i) => {
            return {
                data: {
                    ...prj,
                },
                key: prj.id,
                style: {
                    marginTop: spring(0, presets.noWobble),
                    opacity: spring(1, presets.gentle)
                }
            };
        });
    }

    willEnter() {
        return {
            marginTop: 100,
            opacity: 0
        };
    }

    willLeave() {
        return {
            marginTop: spring(-100),
            opacity: spring(0)
        };
    }

    render() {
        const { projects } = this.props;
        return (
            <TransitionMotion
                defaultStyles={this.getDefaultStyles()}
                styles={this.getStyles()}
                willEnter={this.willEnter}>
                {styles =>
                <div className="project-list">
                    {styles.map(({key, style, data}) => {
                        return <Project key={key} style={style} id={data.id} />;
                    }
                    )}
                </div>
                }
            </TransitionMotion>
        );
    }
}

export default ProjectList;

    // handleTouchStart(e) {
    //     this.isTouching = true;
    //     console.log(e.touches);
    //     this.startingCoordinates = {
    //         x: e.touches[0].clientX,
    //         y: e.touches[0].clientY
    //     };
    // }

    // handleTouchMove(e) {
    //     var { dispatch } = this.props;
    //     var distX = e.touches[0].clientX - this.startingCoordinates.x;
    //     var distY = e.touches[0].clientY - this.startingCoordinates.y;
    //     dispatch(actions.startDragging());
    //
    //     var lastPos = parseInt(this._elt.style.left);
    //     if (!lastPos) { lastPos = 0; }
    //
    //     console.log(lastPos);
    //     if (lastPos > 0) {
    //         this._elt.style.left = '0px';
    //     } else if (lastPos < -this._elt.offsetWidth + window.innerWidth) {
    //         this._elt.style.left = -this._elt.offsetWidth + window.innerWidth + 'px';
    //     } else {
    //         var distDragged = lastPos + distX + 'px';
    //         this._elt.style.left = lastPos + distX + 'px';
    //         this.startingCoordinates = {
    //             x: e.touches[0].clientX,
    //             y: e.touches[0].clientY
    //         };
    //     }
    // }

    // handleTouchEnd(e) {
    //     var { dispatch } = this.props;
    //     this.isTouching = false;
    //     console.log('touch end on list');
    //     dispatch(actions.stopDragging());
    // }

    // componentDidUpdate() {
    //     var { selectedProject } = this.props;
    //
    //     if (selectedProject.id === '') {
    //         // this._elt.style.left = '0px';
    //         // window.scrollTo(0,0);
    //         return;
    //     }
    // }

    // handleCloseButton(e) {
    //     e.preventDefault();
    //     e.stopPropagation();
    //     const { router } = this.props;
    //
    //     router.push('/');
    // }
    //
