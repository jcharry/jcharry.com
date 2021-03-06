import React from 'react';
import { connect } from 'react-redux';
import FilterList from 'app/components/FilterList';

import * as actions from 'app/actions/actions';

class Filter extends React.Component {
    constructor(props) {
        super(props);
        const { projectListFilter } = this.props;
        let items = [
                { key: 'all', data: {text: 'All', isOn: true }},
                { key: 'web', data: {text: 'Web', isOn: false }},
                { key: 'apps', data: {text: 'Apps', isOn: false }},
                { key: 'teaching', data: {text: 'Teaching', isOn: false }},
                { key: 'physical', data: {text: 'Physical', isOn: false }},
                { key: 'visual', data: {text: 'Visual', isOn: false }},
                { key: 'experiments', data: {text: 'Experiments', isOn: false }}
        ].map(item => {
            return {
                key: item.key,
                data: {
                    text: item.data.text,
                    isOn: item.key === projectListFilter
                }
            };
        });
        this.state = {
            open: true,
            items
        };

        this.toggleFilter = this.toggleFilter.bind(this);
        this.toggleItem = this.toggleItem.bind(this);
    }

    toggleFilter(e) {
        e.preventDefault();
        // dispatch(actions.toggleFilterMenu(!this.state.open);
        // this.setState({
        //     open: !this.state.open
        // });
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
                {/* <p onClick={this.toggleFilter}>{projectListFilter} */}
                {/*     {this.state.open ?  <span className='unicode'>&#8673;</span> :<span className='unicode'>&#8675;</span>} */}
                {/* </p> */}

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
