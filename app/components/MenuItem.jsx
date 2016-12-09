import React from 'react';
import * as redux from 'redux';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import ExternalLink from 'app/components/ExternalLink';

import * as actions from 'app/actions/actions';

export class MenuItem extends React.Component {
    render() {
        var { title, style, open, url, external } = this.props;
        var s = {
            ...style,
            zIndex: open ? 10 : -10
        };

        const renderTag = () => {
            if (external) {
                return <ExternalLink
                    url={url}
                    style={s}
                    cls='menu-item'>
                    {title}
                </ExternalLink>;
            }
            return <Link
                style={s}
                to={url}
                className='menu-item'>
                {title}
            </Link>;
        };

        return renderTag();
    }
}

export default connect()(MenuItem);
