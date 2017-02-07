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

// Google analytics
(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
(i[r].q=i[r].q||[]).push(arguments);},i[r].l=1*new Date();a=s.createElement(o),
m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m);
})(window,document,'script','https://www.google-analytics.com/analytics.js','ga');

ga('create', 'UA-89688645-1', 'auto');
ga('send', 'pageview');
// End Google Analytics

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

