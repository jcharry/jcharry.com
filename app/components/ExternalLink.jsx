/*
 * ExternalLink.jsx
 * Copyright (C) 2016 jamiecharry <jamiecharry@Jamies-Air-2.home>
 *
 * Distributed under terms of the MIT license.
 */
import React from 'react';

class ExternalLink extends React.Component {
    constructor(props) {
        super(props);
        this.handleClick = this.handleClick.bind(this);
    }

    handleClick(e) {
        const { url } = this.props;
        e.preventDefault();
        window.open(url, '_blank');
    }

    render() {
        const { url, style, cls } = this.props;
        return (
            <a style={style}
                className={cls}
                onClick={this.handleClick}>
                {this.props.children}
            </a>
        );
    }
}

export default ExternalLink;
