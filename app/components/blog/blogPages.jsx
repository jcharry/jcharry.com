/*
 * blogPages.jsx
 * Copyright (C) 2016 jamiecharry <jamiecharry@Jamies-Air-2.home>
 *
 * Distributed under terms of the MIT license.
 */
import React from 'react';

let posts = [
    {
        title: 'UNDER MAINTENANCE',
        id: 'post1',
        url: 'post1',
        thumbnailSrc: '',
        content:
            <div>
                <p>UNDER MAINTENANCE</p>
            </div>
    }
];


let lookup = {};
posts.forEach(post => {
    lookup[post.id] = post;
});

export default posts;
export { lookup };
