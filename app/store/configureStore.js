import * as redux from 'redux';
import thunk from 'redux-thunk';

import { isDraggingReducer, cardReducer, currentPageReducer, fanDisplayReducer, selectedProjectReducer } from 'app/reducers/reducers';

const configure = (initialState = {}) => {
    var reducer = redux.combineReducers({
        selectedProject: selectedProjectReducer,
        fanDisplayOpen: fanDisplayReducer,
        currentPage: currentPageReducer,
        currentCard: cardReducer,
        isDragging: isDraggingReducer
    });

    var store = redux.createStore(reducer, initialState, redux.compose(
        redux.applyMiddleware(thunk),
        window.devToolsExtension ? window.devToolsExtension() : f => f
    ));

    return store;
};

export default configure;
