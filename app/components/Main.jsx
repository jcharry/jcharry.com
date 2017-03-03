import React from 'react';
import * as redux from 'redux';
import { connect } from 'react-redux';
import { hashHistory } from 'react-router';

import $ from 'jquery';
// require('jquery-mousewheel');

import * as actions from 'app/actions/actions';

// import Canvas from 'app/components/Canvas';

export class Main extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            loaded: false
        };
    }

    componentDidMount() {
        setTimeout(() => {
            this.setState({
                loaded: true
            });
        }, 1000);
    }

    // componentDidUpdate(prevProps, prevState) {
    //     var { fanDisplayOpen, currentPage } = this.props;
    // }
    //
    render() {
        var { fanDisplayOpen, currentPage } = this.props;
        const { loaded } = this.state;
        return (
            <div className='main'>
                {/* {loaded && <Canvas />} */}
                {this.props.children}
            </div>
        );
    }

}

export default connect((state) => {
    return {
        fanDisplayOpen: state.fanDisplayOpen,
        currentPage: state.currentPage,
        // selectedProject: state.selectedProject
    };
})(Main);

