export const selectedProjectReducer = (state = {id: '', index: 1000} , action) => {
    switch (action.type) {
        case 'CLEAR_SELECTED_PROJECT':
            return {
                ...state,
                id: ''
            };
        case 'TOGGLE_SELECTED_PROJECT':
            return {
                ...state,
                id: state.id === action.id ? '' : action.id,
                index: state.index === action.index ? 1000 : action.index
            };
        default:
            return state;
    }
};

export const projectsReducer = (state = {}, action) => {
    switch (action.type) {
        case 'INITIALIZE_PROJECTS':
            return {...action.projects};
        default:
            return state;
    }
};

export const projectFilterReducer = (state = 'all', action) => {
    switch (action.type) {
        case 'SET_PROJECT_LIST_FILTER':
            return action.category;
        default:
            return state;
    }
};

export const isDraggingReducer = (state = false, action) => {
    switch (action.type) {
        case 'START_DRAGGING':
            return true;
        case 'STOP_DRAGGING':
            return false;
        default:
            return state;
    }
};

export const cardReducer = (state = {id: 'About', dir: 'forward'}, action) => {
    switch (action.type) {
        case 'SHOW_NEXT_CARD':
            return {
                id: action.id,
                dir: action.dir
            };
        default:
            return state;
    }
};

export const currentPageReducer = (state = '', action) => {
    switch (action.type) {
        case 'SET_CURRENT_PAGE':
            return action.pageName;
        default:
            return state;
    }
};

export const fanDisplayReducer = (state = false, action) => {
    switch(action.type) {
        case 'TOGGLE_FAN_DISPLAY':
            return !state;
        default:
            return state;
    }
};
