/*
 * Work.jsx
 * Copyright (C) 2016 jamiecharry <jamiecharry@Jamies-Air-2.home>
 *
 * Distributed under terms of the MIT license.
 */
import React from 'react';
import { connect } from 'react-redux';

import ProjectList from 'app/components/ProjectList';
import BackButton from 'app/components/BackButton';

import { currentPage } from 'app/actions/actions';

class Work extends React.Component {
    constructor(props) {
        super(props);

    }

    componentDidMount() {
        const { dispatch } = this.props;
        dispatch(currentPage('work'));
    }

    render() {
        const { router, location } = this.props;
        let url = '/';
        if (location.pathname !== '/work') {
            url = '/work';
        }

        return (
            <div className='work'>
                {this.props.children}
                <BackButton router={router} url={url}/>
            </div>
        );
    }
}

export default connect()(Work);
