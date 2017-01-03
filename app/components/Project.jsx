import React from 'react';
import * as redux from 'redux';
import { connect } from 'react-redux';
import { Motion, spring } from 'react-motion';
import Tween from 'app/lib/Tween';
import { Link } from 'react-router';
import ExternalLink from 'app/components/ExternalLink';

import * as actions from 'app/actions/actions';

export class Project extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        var { id, style, selectedProject, projects } = this.props;

        // TODO: Put this in a separate file
        var map = ['tale', 'ingredients', 'cocoa', 'eafus', 'plasmicreflections', 'quppled', 'qad', 'solarsynth', 'colorflowers', 'artistcomp', 'particlesandwaves' ];

        const project = projects[id];
        var img = require('../images/'+project.imgsrc);

        const url = `/work/id/${project.id}`;

        if (id === 'hundreddays') {
            return (
                <ExternalLink cls='project'
                    url={project.projectLink}
                    style={style}>
                        <div className='prj-img-bg'>
                            <img className='prj-img' src={`/${img}`}/>
                        </div>
                        <h3 className='project-item-title'>{project.title}</h3>
                        <p className='project-item-subheader'>{project.blurb}</p>
                </ExternalLink>
            );
        }

        return (
            <Link className='project'
                to={url}
                style={style}>
                    <div className='prj-img-bg'>
                        <img className='prj-img' src={`/${img}`}/>
                    </div>
                    <h3 className='project-item-title'>{project.title}</h3>
                    <p className='project-item-subheader'>{project.blurb}</p>
            </Link>
            );
    }
}

export default connect((state) => {
    return {
        selectedProject: state.selectedProject,
        isDragging: state.isDragging,
        projects: state.projects
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
