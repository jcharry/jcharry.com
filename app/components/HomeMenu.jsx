import React from 'react';
import * as redux from 'redux';
import { connect } from 'react-redux';
import { hashHistory } from 'react-router';
import { TransitionMotion, spring } from 'react-motion';

import * as actions from 'app/actions/actions';
import MenuItem from 'app/components/MenuItem';

export class HomeMenu extends React.Component {
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
                    left: 10,
                    top: 100
                }
            };
        });
    }
    getStyles() {
        var { currentPage } = this.props;

        return this.menuItems.map((item, i) => {
            var retVal = {
                key: item.title,
                data: item,
                style: {
                    left: spring(10),
                    top: spring(i * 30 + 100)
                }
            };
            return retVal;
        });
    }

    willEnter() {
        return {
            left: -100
        };
    }

    willLeave() {
        return {
            left: spring(10)
        };
    }

    render() {
        var { fanDisplayOpen } = this.props;
        this.menuItems = [
            {title: 'work', url: '/work'},
            {title: 'about', url: '/about'},
            {title: 'contact', url: '/contact'},
            {title: 'blog', url: '/blog'},
            {title: 'itp', url: 'http://itp.jcharry.com', external: true}
        ];
        return (
            <div className='home-menu'>
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
})(HomeMenu);
