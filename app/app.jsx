// Client side modules
import ReactDOM from 'react-dom';
import React from 'react';
import { Provider } from 'react-redux';
import router from 'app/router/index';

import Main from 'app/components/Main';

// REDUX
import configure from './store/configureStore';
var store = configure();

// Main styles
import './styles/main.scss';

ReactDOM.render(
    <div>
        <Provider store={store}>
            <Main />
        </Provider>
    </div>,
    document.getElementById('app')
);

