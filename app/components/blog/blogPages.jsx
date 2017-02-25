import React from 'react';
import {Link} from 'react-router';
import ExternalLink from 'app/components/ExternalLink';
import SyntaxHighlighter, { registerLanguage } from 'react-syntax-highlighter/dist/light';
import js from 'highlight.js/lib/languages/javascript';
import vim from 'highlight.js/lib/languages/vim';
import html from 'highlight.js/lib/languages/xml';
import solarized from 'react-syntax-highlighter/dist/styles/solarized-dark';
import Latex from 'react-latex';

registerLanguage('javascript', js);
registerLanguage('vim', vim);
registerLanguage('html', html);

// Import Posts
// PHYSICS ENGINE POSTS
import post10 from './blogPages/physicsengine/post10';
import post9 from './blogPages/physicsengine/post9';
import post8 from './blogPages/physicsengine/post8';
import post7 from './blogPages/physicsengine/post7';
import post6 from './blogPages/physicsengine/post6';
import post5 from './blogPages/physicsengine/post5';
import post4 from './blogPages/physicsengine/post4';
import post3 from './blogPages/physicsengine/post3';
import post2 from './blogPages/physicsengine/post2';
import post1 from './blogPages/physicsengine/post1';

// VIM POSTS
import vim1 from './blogPages/vim/post1';

// REACT POSTS
import react1 from './blogPages/react/post1';

// MACHINE LEARNING POSTS
import ml1 from './blogPages/machinelearning/post1';

let posts = [
    // Physics Engine
    {title: 'Building a Physics Engine, Pt. 10 - Collision Detection using Separating Axis Theorem (SAT)', id: 'physengine10', url: 'physengine10', last: 'physengine9', next: 'physengine11', content: post10},
    {title: 'Building a Physics Engine, Pt. 9 - Diversion 1: Visualizing Our System for Debugging', id: 'physengine9', url: 'physengine9', last: 'physengine8', next: 'physengine10', content: post9},
    {title: 'Building a Physics Engine, Pt. 8 - Spatial Subdivision', id: 'physengine8', url: 'physengine8', last: 'physengine7', next: 'physengine9', content: post8},
    {title: 'Building a Physics Engine, Pt. 7 - Axis-Aligned Bounding-Box (AABB)', id: 'physengine7', url: 'physengine7', last: 'physengine6', next: 'physengine8', content: post7},
    {title: 'Building a Physics Engine, Pt. 6 - Translation, Rotation, and Scaling', id: 'physengine6', url: 'physengine6', last: 'physengine5', next: 'physengine7', content: post6},
    {title: 'Building a Physics Engine, Pt. 5 - Organization, Webpack, and a Library', id: 'physengine5', url: 'physengine5', last: 'physengine4', next: 'physengine6', content: post5},
    {title: 'Building a Physics Engine, Pt. 4 - Circle, Polygon, and the Update Loop', id: 'physengine4', url: 'physengine4', next: 'physengine5', last: 'physengine3', content: post4},
    {title: 'Building a Physics Engine, Pt. 3 - The Renderer', id: 'physengine3', url: 'physengine3', next: 'physengine4', last: 'physengine2', content: post3},
    {title: 'Building a Physics Engine, Pt. 2 - A Body in The World', id: 'physengine2', url: 'physengine2', last: 'physengine1', next: 'physengine3', content: post2},
    {title: 'Building a Physics Engine, Pt. 1 - The Why', id: 'physengine1', url: 'physengine1', next: 'physengine2', content: post1},
    {title: 'React + MapboxGL', id: 'reactmapboxgl', url: 'reactmapboxgl', content: react1},
    {title: 'Javascript Gradient Descent', id: 'javascript-gradient-descent', url: 'javascript-gradient-descent', content: ml1},


    // VIM
    {title: 'Vim Made Me a Better Programmer', id: 'vim-made-me-a-better-programmer', url: 'vim-made-me-a-better-programmer', thumbnailSrc: '', content: vim1}
];


let lookup = {};
posts.forEach(post => {
    lookup[post.id] = post;
});

export default posts;
export { lookup };
