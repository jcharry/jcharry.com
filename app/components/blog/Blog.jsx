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
        const { router, location } = this.props;

        let url = '/';
        if (location.pathname !== '/blog') {
            url = '/blog';
        }
        return (
            <div className='blog'>
                {this.props.children}
                <BackButton router={router} url={url} />
            </div>
        );
    }
}

export default connect()(Blog);
