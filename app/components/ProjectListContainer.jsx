/*
 * ProjectListContainer.jsx
 * Copyright (C) 2016 jamiecharry <jamiecharry@Jamies-Air-2.home>
 *
 * Distributed under terms of the MIT license.
 */
import React from 'react';
import { connect } from 'react-redux';

import Filter from 'app/components/Filter';
import ProjectList from 'app/components/ProjectList';

class ProjectListContainer extends React.Component {
    constructor(props) {
        super(props);
        this.filterProjects = this.filterProjects.bind(this);
    }

    filterProjects() {
        var { projects, projectListFilter } = this.props;
        let filteredProjects = Object.keys(projects).filter(prj => {
            let project = projects[prj];
            return projectListFilter === 'all' ? true :
                project.category === projectListFilter ? true : false;
        }).map(prj => {
            return projects[prj];
        });

        return filteredProjects;
    }

    render() {
        // const prjs = this.filterProjects();
        return (
            <div className='project-page-container'>
                <Filter />
                <ProjectList projects={this.filterProjects()} />
            </div>
        );
    }
}

export default connect(state => {
    return {
        projects: state.projects,
        projectListFilter: state.projectListFilter
    };
})(ProjectListContainer);
