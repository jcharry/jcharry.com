import React from 'react';
import * as redux from 'redux';
import { connect } from 'react-redux';
import { hashHistory } from 'react-router';
import { TransitionMotion, spring } from 'react-motion';

import * as actions from 'app/actions/actions';
import MenuItem from 'app/components/MenuItem';

export class FanMenu extends React.Component {
    constructor(props) {
        super(props);

        this.menuItems = [];
        this.getDefaultStyles = this.getDefaultStyles.bind(this);
        this.getStyles = this.getStyles.bind(this);
        this.willEnter = this.willEnter.bind(this);
        this.willLeave = this.willLeave.bind(this);
    }

    getDefaultStyles() {
        return this.menuItems.map((item) => {
            return {
                key: item.title,
                data: item,
                style: {
                    left: 100,
                    top: 100
                }
            };
        });
    }
    getStyles() {
        var { currentPage } = this.props;
        var theta = 0; //Math.PI;
        var r = currentPage === 'home' ? 150 : 700;

        return this.menuItems.map((item) => {
            var retVal = {
                key: item.title,
                data: item,
                style: {
                    left: spring((window.innerWidth / 2) - (r*Math.cos(theta))),
                    top: spring((window.innerHeight / 2) - (r*Math.sin(theta)))
                }
            };
            theta += Math.PI / 4;
            return retVal;
        });
    }

    willEnter() {
        return {
            top: window.innerHeight / 2,
            left: window.innerWidth / 2
        };
    }

    willLeave() {
        return {
            top: spring(window.innerHeight / 2),
            left: spring(window.innerWidth / 2)
        };
    }

    render() {
        var { fanDisplayOpen } = this.props;
        this.menuItems = fanDisplayOpen ? [
            {title: 'work', url: '/work'},
            {title: 'about', url: '/about'},
            {title: 'contact', url: '/contact'},
            {title: 'blog', url: '/blog'},
            {title: 'itp', url: 'http://itp.jcharry.com', external: true}
        ] : [
            {title: 'work', url: '/work'},
            {title: 'about', url: '/about'},
            {title: 'contact', url: '/contact'},
            {title: 'blog', url: '/blog'},
            {title: 'itp', url: 'http://itp.jcharry.com', external: true}
        ];
        return (
            <div className='fan-menu'>
                <TransitionMotion
                    styles={this.getStyles()}
                    willEnter={this.willEnter}
                    willLeave={this.willLeave}>
                    {styles =>
                        <div>
                            {styles.map(({key, style, data}) => {
                            return <MenuItem
                                key={key}
                                style={style}
                                open
                                title={data.title}
                                url={data.url}
                                external={data.external}/>;
                            })}
                        </div>
                    }
                </TransitionMotion>
            </div>
        );
    }
}

export default connect((state) => {
    return {
        fanDisplayOpen: state.fanDisplayOpen,
        currentPage: state.currentPage
    };
})(FanMenu);

