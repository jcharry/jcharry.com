import React from 'react';
import { browserHistory, Router, Route, IndexRoute } from 'react-router';

import Main from 'app/components/Main';
import ProjectPage from 'app/components/ProjectPage';
import ProjectListContainer from 'app/components/ProjectListContainer';
import Work from 'app/components/Work';
import Home from 'app/components/Home';
import About from 'app/components/About';
import Contact from 'app/components/Contact';
import Blog from 'app/components/blog/Blog';
import BlogPage from 'app/components/blog/BlogPage';
import BlogListContainer from 'app/components/blog/BlogListContainer';

export default (
    <Router history={browserHistory}>
        <Route path='/' component={Main}>
            <IndexRoute component={Home} />
            <Route path='/work' component={Work}>
                <IndexRoute component={ProjectListContainer} />
                <Route path='/work/id/:projectId' component={ProjectPage} />
            </Route>
            <Route path='/about' component={About} />
            <Route path='/contact' component={Contact} />
            <Route path='/blog' component={Blog}>
                <IndexRoute component={BlogListContainer} />
                <Route path='/blog/:post' component={BlogPage} />
            </Route>
        </Route>
    </Router>
);
