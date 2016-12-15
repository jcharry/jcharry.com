/*
 * BlogPage.jsx
 * Copyright (C) 2016 jamiecharry <jamiecharry@Jamies-Air-2.home>
 *
 * Distributed under terms of the MIT license.
 */
import React from 'react';
import { lookup } from 'app/components/blog/blogPages';
import { Motion, spring } from 'react-motion';

class BlogPage extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        let id = this.props.routeParams.post;
        let post = lookup[id];
        return (
            <Motion defaultStyle={{opacity: 0, marginTop: 200}} style={{opacity: spring(1), marginTop: spring(0)}}>
                {style => {
                    return (
                        <div style={style} className='blog-page row align-center small-10 med-8 large-6'>
                            {post.content}
                        </div>
                    );
                }}
            </Motion>
        );
    }
}

export default BlogPage;
