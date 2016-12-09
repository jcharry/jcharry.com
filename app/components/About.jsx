import React from 'react';
import * as redux from 'redux';
import { connect } from 'react-redux';
import { Motion, TransitionMotion, StaggeredMotion, spring } from 'react-motion';

import * as actions from 'app/actions/actions';

import CardList from 'app/components/CardList';
import BackButton from 'app/components/BackButton';
import socialMedia from 'app/db/socialMedia';
import ExternalLink from 'app/components/ExternalLink';

export class About extends React.Component {
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
    componentDidMount() {
        const { dispatch } = this.props;
        dispatch(actions.currentPage('about'));
    }

    handleLinkClick(e) {
        e.preventDefault();
        window.open(e.currentTarget.href, '_blank');
    }
    render() {
        const { router } = this.props;
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
                            return <ExternalLink key={i} style={style} url={socialMedia[i].link}>

                            <img className='social-media-icon' src={require('../images/'+socialMedia[i].imgsrc)} />
                            </ExternalLink>;
                        })}
                    </div>
                    }
                </StaggeredMotion>
                <Motion defaultStyle={{bottom: -100}} style={{bottom: spring(10)}}>
                    {interpolatingStyle => <p className='email' style={interpolatingStyle}>jamie dot charry at gmail dot com</p>}
                </Motion>

                <CardList />
                <BackButton router={router} url='/'/>
            </div>
        );
    }
}

export default connect()(About);
