/*
 * ProjectPage.jsx
 * Copyright (C) 2016 jamiecharry <jamiecharry@Jamies-Air-2.home>
 *
 * Distributed under terms of the MIT license.
 */
import React from 'react';
import { connect } from 'react-redux';
import projectPages from 'app/db/projectPages';
import { Motion, spring } from 'react-motion';

class ProjectPage extends React.Component {
    constructor(props) {
        super(props);

    }

    componentDidMount() {
        console.log('project page mounted');
    }

    render() {
        const projects = this.props.projects;
        let id = this.props.routeParams.projectId;
        let project = projectPages[id];
        return (
            <Motion defaultStyle={{opacity: 0, marginTop: 200}} style={{opacity: spring(1), marginTop: spring(0)}}>
                {style => {
                    return (
                    <div style={style} className='project-page row align-center small-10 med-8 large-6'>
                            {project}
                        </div>
                    );
                }}
            </Motion>
        );
    }
}

export default connect((state) => {
    return {
        projects: state.projects
    };
})(ProjectPage);
