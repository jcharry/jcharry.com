/*
 * FilterList.jsx
 * Copyright (C) 2016 jamiecharry <jamiecharry@Jamies-Air-2.home>
 *
 * Distributed under terms of the MIT license.
 */
import React from 'react';
import { TransitionMotion, spring, presets } from 'react-motion';

class FilterList extends React.Component {
    constructor(props) {
        super(props);

        this.getDefaultStyles = this.getDefaultStyles.bind(this);
        this.getStyles = this.getStyles.bind(this);
        this.willLeave = this.willLeave.bind(this);
        this.willEnter = this.willEnter.bind(this);
        // this.handleToggle = this.handleToggle.bind(this);
    }

    getDefaultStyles() {
        return this.props.items.map(item => ({...item, style: {height: 0, opacity: 1}}));
    }

    getStyles() {
        const {items } = this.props;
        return items.map((item, i) => {
            return {
                ...item,
                style: {
                    height: spring(30, presets.gentle),
                    opacity: spring(1, presets.gentle),
                }
            };
        });
    }

    willLeave() {
        return {
            height: spring(0),
            opacity: spring(0)
        };
    }

    willEnter() {
        return {
            height: 0,
            opacity: 1,
        };
    }

    render() {
        const { items, handleToggle } = this.props;
        // const itemsLeft = items.filter(({data: {isOn}}) => {
        //     console.log(isOn);
        //     return !isOn;
        // }).length;

        return (
            <TransitionMotion
                defaultStyles={this.getDefaultStyles()}
                styles={this.getStyles()}
                willLeave={this.willLeave}
                willEnter={this.willEnter}>
                {styles =>
                <ul className="filter-list">
                    {styles.map(({key, style, data: {isOn, text}}) =>
                    <li key={key} style={style} className={isOn ? 'selected filter-list-item' : 'filter-list-item'}>
                        <div className="view">
                            <p
                                className='filter-list-item'
                                onClick={handleToggle.bind(null, key)}>
                                {text}
                            </p>
                        </div>
                    </li>
                    )}
                </ul>
                }
            </TransitionMotion>
            );
    }
}

export default FilterList;
