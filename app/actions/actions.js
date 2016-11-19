export const clearSelectedProject = () => {
    return {
        type: 'CLEAR_SELECTED_PROJECT'
    };
};

export const toggleSelectedProject = (id, index) => {
    return {
        type: 'TOGGLE_SELECTED_PROJECT',
        id,
        index
    };
};

export const startDragging = () => {
    return {
        type: 'START_DRAGGING'
    };
};
export const stopDragging = () => {
    return {
        type: 'STOP_DRAGGING'
    };
};

export const nextCard = (id, dir) => {
    return {
        type: 'SHOW_NEXT_CARD',
        id,
        dir
    };
};

export const toggleFanDisplay = () => {
    return {
        type: 'TOGGLE_FAN_DISPLAY'
    };
};

export const currentPage = (pageName) => {
    return {
        type: 'SET_CURRENT_PAGE',
        pageName
    };
};
