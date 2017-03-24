import React from 'react';
import * as redux from 'redux';
import { connect } from 'react-redux';
import { Motion, TransitionMotion, StaggeredMotion, spring } from 'react-motion';

import * as actions from 'app/actions/actions';

import Card from 'app/components/Card';
import ExternalLink from 'app/components/ExternalLink';

export class CardList extends React.Component {
    constructor(props) {
        super(props);
        this.cards = [
            {
                title: 'About',
                next: 'Skills',
                children: [
                    <div key='whoami'>
                        <h3><pre><code>$ whoami</code></pre></h3>
                        <p>jamiecharry</p>
                    </div>,
                    <div key='man'>
                        <h3><pre><code>$ man jamiecharry</code></pre></h3>
                        <p>I grew up modding Xboxes for fun, then studied Physics because it's fun, now I build web applications because it's, you guessed it, super fun.</p>
                        <p>I explore the intersection of technology, education, elucidation, and behavior change</p>
                        <p>Utimately I want people to be more thoughtful of the world around them</p>
                    </div>,
                    <div key='whereis'>
                        <h3><pre><code>$ whereis jamiecharry</code></pre></h3>
                        <p>/brooklyn/ny/</p>
                    </div>
                ]
            },
            {
                title: 'Skills',
                next: 'Resume',
                last: 'About',
                children: [
                    <div key='languages'>
                        <h3><pre><code>$ which languages</code></pre></h3>
                        <p>Javascript / ES6</p>
                        <p>Python</p>
                        <p>HTML/CSS/SASS</p>
                    </div>,
                    <div key='frameworks'>
                        <h3><pre><code>$ which frameworks</code></pre></h3>
                        <p>React/Redux</p>
                        <p>jQuery, D3, MapboxGL, HTML5 canvas</p>
                        <p>Phaser, Box2D</p>
                    </div>,
                    <div key='backend'>
                        <h3><pre><code>$ which backend</code></pre></h3>
                        <p>Node/Express/Webpack</p>
                        <p>NoSQL - MongoDB (mongoose)</p>
                        <p>Nginx, Linux/Unix</p>
                    </div>,
                    <div key='other'>
                        <h3><pre><code>$ what else</code></pre></h3>
                        <p>Web Infrastructure, HTTP, REST, AJAX</p>
                        <p>Git/Github, OOP design, Functional Paradigms</p>
                    </div>
                ]
            },
            {
                title: 'Resume',
                last: 'Skills',
                children: [
                    <div key='about'>
                        <p>I'm self driven, and recklessly seek new skills, play with new technologies, and soak up as much as I can.</p>
                    </div>,
                    <div key='school'>
                        <h3>School</h3>
                        <p>MPS NYU ITP</p>
                        <p>B.Sc Physics - Northeastern University</p>
                    </div>,
                    <div key='jobs'>
                        <h3>Jobs</h3>
                        <p>Makerbot - Test Engineer / Hardware Project Manager</p>
                        <p>Utrect University - Research Assistant</p>
                    </div>,
                    <div key='hobbies'>
                        <h3>Hobbies</h3>
                        <p>Following along with MOOC's (currently taking Professor Ng's Machine Learning Course)</p>
                    </div>
                ]
            }
        ];

        this.handleCardChange = this.handleCardChange.bind(this);
    }

    handleCardChange(direction) {
        let { currentCard, dispatch } = this.props;

        // Only render the card that's visible
        let visibleCard = this.cards.filter((card) => {
            return currentCard.id === card.title ? card : null;
        });

        var card = visibleCard[0];

        switch (direction) {
            case 'last':
                dispatch(actions.nextCard(card.last, 'back'));
                break;
            case 'next':
                dispatch(actions.nextCard(card.next, 'forward'));
        }
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
            <div>
                <div className='card-list'>
                    <p>swipe or drag</p>
                    <Card dir={currentCard.dir} next={card.next} last={card.last} key={card.title} contents={card} />
                    <div className='arrows'>
                        {card.last ? <button onClick={() => {this.handleCardChange('last'); }}>LAST</button> : <button></button>}
                        {card.next ? <button onClick = {() => {this.handleCardChange('next'); }}>NEXT</button> : <button></button>}
                    </div>
                </div>
            </div>
        );
    }
}

export default connect((state) => {
    return {
        currentCard: state.currentCard
    };
})(CardList);
