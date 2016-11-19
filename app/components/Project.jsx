import React from 'react';
import * as redux from 'redux';
import { connect } from 'react-redux';
import { Motion, spring } from 'react-motion';
import Tween from 'app/lib/Tween';

import * as actions from 'app/actions/actions';

export class Project extends React.Component {
    constructor(props) {
        super(props);

        this.handleClick = this.handleClick.bind(this);
        this.getStyles = this.getStyles.bind(this);
        this.elementWidth = window.innerWidth < 500 ? 200 : 300;
    }

    handleClick(e) {
        var { dispatch, isDragging, project, selectedProject, index } = this.props;
        e.preventDefault();

        if (!isDragging) {
            //var offset = window.innerWidth - this.elementWidth;
            //if (selectedProject.id === '') {
                //offset = 0;
            //} else if (selectedProject.id !== project.id && index < selectedProject.index) {
                //offset = 0;
            //}

            dispatch(actions.toggleSelectedProject(project.id, index));
            //var startPos = window.scrollX;
            //var finalPos = this._elt.offsetLeft - offset;
            //var dist = finalPos - startPos;
            //var tweens = [];
            //var scrollTween = new Tween(tweens)
                //.duration(150)
                //.start({
                    //left: startPos
                //})
                //.end({
                    //left: dist
                //})
                //.easing('easeInOutQuad')
                //.complete(() => {
                    //clearInterval(scrollInterval);
                //});

            //tweens.push(scrollTween);
            //var time = 0;
            //var interval = 16;
            //var scrollInterval = setInterval(() => {
                //tweens.forEach((tween) => {
                    //tween.update(time);
                    ////window.scrollTo(tween.left, 0);
                //});
                //time += interval;
            //}, interval);
            //window.scrollTo(this._elt.offsetLeft - offset, 0);
        }

        //e.stopPropagation();
    }

    getStyles() {
        var { selectedProject, project } = this.props;
        var width = window.innerWidth > window.innerHeight ? window.innerHeight : window.innerWidth;
        console.log(width);
        return {
            width: selectedProject.id === project.id ? spring(window.innerWidth) : spring(this.elementWidth)
        };
    }

    render() {
        var { project, style, selectedProject } = this.props;

        var img = require('../images/'+project.imgsrc);
        var renderTech = () => {
            if (project.technologies) {
                return project.technologies.map((tech) => {
                    return <p key={tech}>{tech}</p>;
                });
            }
        };

        var classes = '';
        if (selectedProject.id === '') {
            classes = 'project';
        } else {
            classes = selectedProject.id === project.id ? 'project selected-project' : 'project blurred';
            // if (window.innerWidth > window.innerHeight) {
            //     classes += ' width-greater';
            // } else {
            //     classes += ' height-greater';
            // }
        }
        return (
            <Motion defaultStyle={{width: 200, opacity: 1}} style={this.getStyles()}>
                {interpolatingStyle =>
                <div style={{...interpolatingStyle, ...style}}
                    className={classes}
                    onTouchEnd={this.handleClick}
                    onClick={this.handleClick}>
                    <h3 className='title-text'>{project.title}</h3>
                    <div className='prj-img-bg'
                            style={{
                                width: interpolatingStyle.width
                                }}>
                        <img className='prj-img'
                            style={{
                                opacity: selectedProject.id === project.id ? 0.3 : 1
                                }}
                            src={img}/>
                    </div>
                    {selectedProject.id === project.id ?
                        <div>
                            <SelectedProject project={project} />
                        </div> :
                        <div style={{position: 'relative'}}>
                            <p className='title-text'>{project.blurb}</p>
                        </div>
                    }
                </div>
                }
            </Motion>
        );
    }
}

export default connect((state) => {
    return {
        selectedProject: state.selectedProject,
        isDragging: state.isDragging
    };
})(Project);

class SelectedProject extends React.Component {
    constructor(props) {
        super(props);

        this.handleClick = this.handleClick.bind(this);
    }

    handleClick(e) {
        e.stopPropagation();
    }
    handleLinkClick(e) {
        e.preventDefault();
        window.open(e.currentTarget.href, '_blank');
    }

    render() {
        var { project } = this.props;
        var renderDocumentationLinks = () => {
            if (typeof project.documentationLink === 'string') {
                return project.documentationLink ? <a onClick={this.handleLinkClick} onTouchEnd={this.handleLinkClick} href={project.documentationLink}>Documentation</a> : null;
            } else {
                return project.documentationLink.map((link, i) => {
                    return <a onClick={this.handleLinkClick} onTouchEnd={this.handleLinkClick} href={link} key={i}>Documentation {i+1}</a>;
                });
            }
        };

        return (
            <div className='selected-project-text'>
                <div />
                <p>{project.desc}</p>
                <p>Tech: {project.technologies}</p>
                <p>{project.date}</p>
                {project.projectLink && <a onClick={this.handleLinkClick} onTouchEnd={this.handleLinkClick} href={project.projectLink}>Project link</a>}
                {renderDocumentationLinks()}
            </div>
        );
    }
}
