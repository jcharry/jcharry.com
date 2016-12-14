/*
 * Blog.jsx
 * Copyright (C) 2016 jamiecharry <jamiecharry@Jamies-Air-2.home>
 *
 * Distributed under terms of the MIT license.
 */
import React from 'react';
import BackButton from 'app/components/BackButton';
import { connect } from 'react-redux';

import { currentPage } from 'app/actions/actions';

class Blog extends React.Component {
    constructor(props) {
        super(props);

    }

    componentDidMount() {
        const { dispatch } = this.props;
        dispatch(currentPage('blog'));
    }

    render() {
        const { router } = this.props;
        return (
            <div className='blog'>
                Coming Soon
                <BackButton router={router} url='/' />
            </div>
        );
    }
}

export default connect()(Blog);
