/*
 * Contact.jsx
 * Copyright (C) 2016 jamiecharry <jamiecharry@Jamies-Air-2.home>
 *
 * Distributed under terms of the MIT license.
 */
import React from 'react';
import BackButton from 'app/components/BackButton';
import { connect } from 'react-redux';

import { currentPage } from 'app/actions/actions';

class Contact extends React.Component {
    constructor(props) {
        super(props);

    }

    componentDidMount() {
        const { dispatch } = this.props;
        dispatch(currentPage('contact'));
    }

    render() {
        const { router, location } = this.props;
        return (
            <div className='contact'>
                <BackButton router={router} url='/' />
                Coming Soon
            </div>
        );
    }
}

export default connect()(Contact);
