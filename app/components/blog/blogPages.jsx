/*
 * blogPages.jsx
 * Copyright (C) 2016 jamiecharry <jamiecharry@Jamies-Air-2.home>
 *
 * Distributed under terms of the MIT license.
 */
import React from 'react';

let posts = [
    {
        title: 'post 1',
        id: 'post1',
        url: 'post1',
        thumbnailSrc: '/images/blog/post1.png',
        content:
            <div>
                <p>Post 1</p>
            </div>
    },
    {
        title: 'post 2',
        id: 'post2',
        url: 'post2',
        content:
            <div>
                <p>Post 2</p>
            </div>
    },
    {
        title: 'post 3',
        id: 'post3',
        url: 'post3',
        content:
            <div>
                <p>Post 2</p>
            </div>
    },
    {
        title: 'post 1',
        id: 'post4',
        url: 'post1',
        thumbnailSrc: '/images/blog/post1.png',
        content:
            <div>
                <p>Post 1</p>
            </div>
    },
    {
        title: 'post 1',
        id: 'post5',
        url: 'post1',
        thumbnailSrc: '/images/blog/post1.png',
        content:
            <div>
                <p>Post 1</p>
            </div>
    },
    {
        title: 'post 1',
        id: 'post6',
        url: 'post1',
        thumbnailSrc: '/images/blog/post1.png',
        content:
            <div>
                <p>Post 1</p>
            </div>
    }
];


let lookup = {};
posts.forEach(post => {
    lookup[post.id] = post;
});

export default posts;
export { lookup };
