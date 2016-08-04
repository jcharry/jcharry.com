import React from 'react';
import { hashHistory, Router, Route, IndexRoute } from 'react-router';

import Main from 'app/components/Main';

export default (
    <Router history={hashHistory}>
        <Route path='/'>
            <IndexRoute component={Main} />
        </Route>
    </Router>
);
