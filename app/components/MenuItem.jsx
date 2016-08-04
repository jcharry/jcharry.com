import React from 'react';
import * as redux from 'redux';
import { connect } from 'react-redux';

import * as actions from 'app/actions/actions';

export class MenuItem extends React.Component {
    constructor(props) {
        super(props);

        this.handleClick = this.handleClick.bind(this);
    }

    handleClick(e) {
        var { dispatch, title } = this.props;

        e.stopPropagation();
        if (title === 'Blog') {
            window.open('http://blog.jcharry.com', '_blank');
            return;
        }
        dispatch(actions.currentPage(title));
    }

    render() {
        var { title, style, open } = this.props;
        var s = {
            ...style,
            zIndex: open ? 10 : 0
        };
        return (
            <div style={s} onTouchStart={this.handleClick} onClick={this.handleClick} className='menu-item'>
                {title}
            </div>
        );
    }
}

export default connect()(MenuItem);
 
