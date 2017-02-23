/*
 * Home.jsx
 * Copyright (C) 2016 jamiecharry <jamiecharry@Jamies-Air-2.home>
 *
 * Distributed under terms of the MIT license.
 */
import React from 'react';
import { connect } from 'react-redux';

import FanMenu from 'app/components/FanMenu';

import * as actions from 'app/actions/actions';

class Home extends React.Component {
    constructor(props) {
        super(props);
    }

    componentDidMount() {
        const { dispatch } = this.props;
        dispatch(actions.currentPage('home'));
        setTimeout(() => {
            document.getElementsByClassName('click-me')[0].style.opacity = 1;
        }, 1000);
    }

    render() {
        const { currentPage } = this.props;
        return (
            <div className='home'>
                <FanMenu />
                <div style={{opacity: currentPage === 'home' ? 1 : 0}} className='home-text'>
                    <p>Hi, I'm Jamie</p>
                    <p>Full Stack Web Developer & Creative Coder, Currently pursuing MPS at NYU ITP</p>
                    {/* <img src={require('../images/clickme.png')} className='click-me' /> */}
                </div>
            </div>
        );
    }
}

export default connect((state) => {
    return {
        currentPage: state.currentPage
    };
})(Home);
