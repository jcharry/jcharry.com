import React from 'react';
import { connect } from 'react-redux';

import FanMenu from 'app/components/FanMenu';
import HomeMenu from 'app/components/HomeMenu';

import * as actions from 'app/actions/actions';

class Home extends React.Component {
    constructor(props) {
        super(props);
    }

    componentDidMount() {
        const { dispatch } = this.props;
        dispatch(actions.currentPage('home'));
    }

    render() {
        const { currentPage } = this.props;
        return (
            <div className='home'>
                <HomeMenu />
                <div style={{opacity: currentPage === 'home' ? 1 : 0}} className='home-text' itemScope itemType='http://schema.org/Person'>
                    <h1>Hi, I'm <span itemProp='name'>Jamie Charry</span></h1>
                    <p>Full Stack Web Developer & Creative Coder, Currently pursuing MPS at NYU ITP</p>
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
