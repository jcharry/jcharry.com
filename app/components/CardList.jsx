import React from 'react';
import * as redux from 'redux';
import { connect } from 'react-redux';
import { Motion, TransitionMotion, StaggeredMotion, spring } from 'react-motion';

import * as actions from 'app/actions/actions';

import Card from 'app/components/Card';

export class CardList extends React.Component {
    constructor(props) {
        super(props);
        this.cards = [
            {
                title: 'Skills',
                next: 'About',
                children: [
                    <div key='proficient'>
                        <h3>Proficient</h3>
                        <p>Javascript/ES6</p>
                        <p>React/Redux</p>
                        <p>Node/Express</p>
                        <p>D3</p>
                    </div>,
                    <div key='solid'>
                        <h3>Solid</h3>
                        <p>Python w/ Flask</p>
                        <p>Mapping w/ Mapbox, D3</p>
                        <p>2D Canvas Animation</p>
                        <p>Webpack</p>
                        <p>Databases - Firebase, MongoDB</p>
                    </div>,
                    <div key='improving'>
                        <h3>Improving</h3>
                        <p>Testing w/ Mocha, Karma</p>
                        <p>Machine Learning Algorithms</p>
                        <p>PHP/SQL</p>
                    </div>
                ]
            },
            {
                title: 'About',
                last: 'Skills',
                children: [
                    <div key='whoami'>
                        <h3>Who Am I</h3>
                        <p>Just a city boy</p>
                    </div>,
                    <div key='whatelse'>
                        <h3>What else</h3>
                        <p>I've done flips off trees.</p>
                    </div>
                ]
            }
        ];
    }

    render() {
        var { currentCard } = this.props;
        var that = this;

        // Only render the card that's visible
        var visibleCard = this.cards.filter((card) => {
            return currentCard.id === card.title ? card : null;
        });
        var card = visibleCard[0];

        return (
            <div className='card-list'>
                <p>swipe or drag</p>
                <Card dir={currentCard.dir} next={card.next} last={card.last} key={card.title} contents={card} />
            </div>
        );
    }
}

export default connect((state) => {
    return {
        currentCard: state.currentCard
    };
})(CardList);
