/*
 * BackButton.jsx
 * Copyright (C) 2016 jamiecharry <jamiecharry@Jamies-Air-2.home>
 *
 * Distributed under terms of the MIT license.
 */
import React from 'react';
import { connect } from 'react-redux';

class BackButton extends React.Component {
    constructor(props) {
        super(props);
        this.handleCloseButton = this.handleCloseButton.bind(this);
    }

    handleCloseButton(e) {
        e.preventDefault();
        e.stopPropagation();
        const { router, url } = this.props;

        router.push(url);
    }

    render() {
        return (
            <a className='back-button' onClick={this.handleCloseButton}></a>
        );
    }
}

export default connect()(BackButton);
