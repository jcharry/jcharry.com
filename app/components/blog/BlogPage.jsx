/*
 * BlogPage.jsx
 * Copyright (C) 2016 jamiecharry <jamiecharry@Jamies-Air-2.home>
 *
 * Distributed under terms of the MIT license.
 */
import React from 'react';
import { lookup } from 'app/components/blog/blogPages';
import { Motion, spring } from 'react-motion';
import { Link } from 'react-router';

class BlogPage extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        let id = this.props.routeParams.post;
        let post = lookup[id];
        let next, last;
        if (post.next && lookup[post.next]) {
            next = lookup[post.next].title;
        }
        if (post.last && lookup[post.last]) {
            last = lookup[post.last].title;
        }
        return (
            <Motion defaultStyle={{opacity: 0, marginTop: 200}} style={{opacity: spring(1), marginTop: spring(0)}}>
                {style => {
                    return (
                        <div style={style} className='blog-page row align-center small-12 medium-10 large-8'>
                            <div className='blog-page-links'>
                                {last !== undefined && <Link className='last' to={`/blog/${post.last}`}>Last: {last}</Link>}
                                {next !== undefined && <Link className='next' to={`/blog/${post.next}`}>Next: {next}</Link>}
                            </div>
                            {post.content}
                        </div>
                    );
                }}
            </Motion>
        );
    }
}

export default BlogPage;
