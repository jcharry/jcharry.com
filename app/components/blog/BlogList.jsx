/*
 * BlogList.jsx
 * Copyright (C) 2016 jamiecharry <jamiecharry@Jamies-Air-2.home>
 *
 * Distributed under terms of the MIT license.
 */
import React from 'react';
import BlogListItem from 'app/components/blog/BlogListItem';
import { TransitionMotion, spring, presets } from 'react-motion';

class BlogList extends React.Component {
    constructor(props) {
        super(props);
        this.getDefaultStyles = this.getDefaultStyles.bind(this);
        this.getStyles = this.getStyles.bind(this);
        this.willLeave = this.willLeave.bind(this);
        this.willEnter = this.willEnter.bind(this);
    }

    getDefaultStyles() {
        const { posts } = this.props;
        return posts.map((post, i) => {
            return {
                data: {
                    ...post
                },
                key: post.id,
                style: {
                    marginTop: 100,
                    opacity: 0
                }
            };
        });
    }

    getStyles() {
        const { posts } = this.props;
        return posts.map((post, i) => {
            return {
                data: {
                    ...post,
                },
                key: post.id,
                style: {
                    marginTop: spring(0, presets.noWobble),
                    opacity: spring(1, presets.gentle)
                }
            };
        });
    }

    willEnter() {
        return {
            marginTop: 100,
            opacity: 0
        };
    }

    willLeave() {
        return {
            marginTop: spring(-100),
            opacity: spring(0)
        };
    }

    render() {
        const { posts } = this.props;
        return (
            <div className='blog-container row'>
                <TransitionMotion
                    defaultStyles={this.getDefaultStyles()}
                    styles={this.getStyles()}
                    willLeave={this.willLeave}
                    willEnter={this.willEnter}>
                    {styles =>
                    <div className='blog-post-list columns small-12 medium-8 small-centered medium-centered large-centered'>
                        {styles.map(({key, style, data}) => {
                            return <BlogListItem key={key} page={data} style={style} />;
                        })}
                    </div>
                    }
                </TransitionMotion>
            </div>
        );
    }
}

export default BlogList;
