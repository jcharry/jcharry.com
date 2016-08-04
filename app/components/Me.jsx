import React from 'react';
import * as redux from 'redux';
import { connect } from 'react-redux';
import { Motion, TransitionMotion, StaggeredMotion, spring } from 'react-motion';

import * as actions from 'app/actions/actions';

import CardList from 'app/components/CardList';
import socialMedia from 'app/db/socialMedia';

export class Me extends React.Component {
    constructor(props) {
        super(props);

    }

    getDefaultStyles() {
        return socialMedia.map((s) => {
            return {
                marginBottom: -1000
            };
        });
    }

    render() {
        return (
            <div className='me-page'>
                <StaggeredMotion
                    defaultStyles={this.getDefaultStyles()}
                    styles={ previouslyInterpolatedStyles => previouslyInterpolatedStyles.map((_, i) => {
                            return i === 0 ?  {marginBottom: spring(0)} : {marginBottom: spring(previouslyInterpolatedStyles[i - 1].marginBottom)};
                        })}>
                    {styles =>
                    <div className='social-media-icons'>
                        {styles.map((style, i) => {
                        return <a href={socialMedia[i].link} className='social-media-icon' style={style} key={i}>
                            <img src={require('../images/'+socialMedia[i].imgsrc)} />
                            </a>;
                        })}
                    </div>
                    }
                </StaggeredMotion>
                <Motion defaultStyle={{bottom: -100}} style={{bottom: spring(10)}}>
                    {interpolatingStyle => <p className='email' style={interpolatingStyle}>jamie dot charry at gmail dot com</p>}
                </Motion>

                <CardList />
            </div>
        );
    }
}

export default connect()(Me);
