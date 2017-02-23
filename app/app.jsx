// Client side modules
import ReactDOM from 'react-dom';
import React from 'react';
import { Provider } from 'react-redux';
import router from 'app/router/index';

import Main from 'app/components/Main';

// REDUX
import { initializeProjects } from 'app/actions/actions';
import configure from './store/configureStore';
var store = configure();

import projects from 'app/db/projects';
store.dispatch(initializeProjects(projects));


// Main styles
import './styles/main.scss';

console.info("Thanks for stopping by and checking out my site!");

ReactDOM.render(
    <div>
        <Provider store={store}>
            {router}
        </Provider>
    </div>,
    document.getElementById('app')
);

