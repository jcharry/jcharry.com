/*
 * Filter.jsx
 * Copyright (C) 2016 jamiecharry <jamiecharry@Jamies-Air-2.home>
 *
 * Distributed under terms of the MIT license.
 */
import React from 'react';
import { connect } from 'react-redux';
import FilterList from 'app/components/FilterList';

import * as actions from 'app/actions/actions';

class Filter extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            open: false,
            items: [
                { key: 'all', data: {text: 'All', isOn: true }},
                { key: 'physical', data: {text: 'Physical', isOn: false }},
                { key: 'design', data: {text: 'Design', isOn: false }},
                { key: 'web', data: {text: 'Web', isOn: false }},
                { key: 'apps', data: {text: 'Apps', isOn: false }},
                { key: 'experiments', data: {text: 'Experiments', isOn: false }}
            ]
        };

        this.toggleFilter = this.toggleFilter.bind(this);
        this.toggleItem = this.toggleItem.bind(this);
    }

    toggleFilter(e) {
        e.preventDefault();
        // dispatch(actions.toggleFilterMenu(!this.state.open);
        this.setState({
            open: !this.state.open
        });
    }

    toggleItem(key) {
        const { dispatch } = this.props;
        dispatch(actions.setProjectListFilter(key));
        this.setState({
            items: this.state.items.map((item) => {
                if (key === item.key) {
                    return {
                        key: key,
                        data: {
                            text: item.data.text,
                            isOn: true
                        }
                    };
                } else {
                    return {
                        key: item.key,
                        data: {
                            text: item.data.text,
                            isOn: false
                        }
                    };
                }
            })
        });
    }

    render() {
        const { projectListFilter } = this.props;
        let items = this.state.open ? this.state.items : [];
        return (
            <div className='filter'>
                <p onClick={this.toggleFilter}>{projectListFilter}
                    {this.state.open ?  <span className='unicode'>&#8673;</span> :<span className='unicode'>&#8675;</span>}
                </p>

                <FilterList handleToggle={this.toggleItem} items={items}/>
            </div>
        );
    }
}

export default connect(state => {
    return {
        projectListFilter: state.projectListFilter
    };
})(Filter);
