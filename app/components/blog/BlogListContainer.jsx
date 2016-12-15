/*
 * BlogListContainer.jsx
 * Copyright (C) 2016 jamiecharry <jamiecharry@Jamies-Air-2.home>
 *
 * Distributed under terms of the MIT license.
 */
import React from 'react';
import BlogList from 'app/components/blog/BlogList';
import blogPages from 'app/components/blog/blogPages';

class BlogListContainer extends React.Component {
    constructor(props) {
        super(props);

    }

    //TODO: Implement filtering
    filterPosts(posts) {
        return posts;
    }

    render() {
        return (
            <BlogList posts={blogPages} />
        );
    }
}

export default BlogListContainer;
