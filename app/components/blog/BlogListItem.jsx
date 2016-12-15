/*
 * BlogListItem.jsx
 * Copyright (C) 2016 jamiecharry <jamiecharry@Jamies-Air-2.home>
 *
 * Distributed under terms of the MIT license.
 */
import React from 'react';
import { Link } from 'react-router';

class BlogListItem extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        const { page, style } = this.props;
        return (
            <Link to={`blog/${page.url}`} className='blog-list-item' style={style}>
                <div>
                    <img src={page.thumbnailSrc} />
                </div>
                <div>
                    {page.title}
                </div>
            </Link>
        );
    }
}

export default BlogListItem;
