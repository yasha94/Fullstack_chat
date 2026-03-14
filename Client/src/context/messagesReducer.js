export const MESSAGES_ACTIONS = {
    SET_LOADING:    'SET_LOADING',
    SET_SENDING:    'SET_SENDING',
    SET_ERROR:      'SET_ERROR',
    SET_MESSAGES:   'SET_MESSAGES',   // replace state on initial load / chat switch
    APPEND_OLDER:   'APPEND_OLDER',   // pagination — older messages appended at the tail
    ADD_MESSAGE:    'ADD_MESSAGE',    // single new message (socket incoming or sent ack)
    RESET:          'RESET',          // clear when switching active chat
};

export const initialMessagesState = {
    messages: [],
    hasMore:  true,
    cursor:   null,
    loading:  false,
    sending:  false,
    error:    null,
};

export function messagesReducer(state, action) {
    switch (action.type) {

        case MESSAGES_ACTIONS.SET_LOADING:
            return { ...state, loading: action.payload };

        case MESSAGES_ACTIONS.SET_SENDING:
            return { ...state, sending: action.payload };

        case MESSAGES_ACTIONS.SET_ERROR:
            return { ...state, error: action.payload, loading: false, sending: false };

        case MESSAGES_ACTIONS.SET_MESSAGES:
            return {
                ...state,
                messages: action.payload.messages,
                hasMore:  action.payload.hasMore,
                cursor:   action.payload.cursor,
                loading:  false,
                error:    null,
            };

        case MESSAGES_ACTIONS.APPEND_OLDER: {
            // Deduplicate by _id before merging
            const existingIds = new Set(state.messages.map((m) => String(m._id)));
            const newOlder = action.payload.messages.filter(
                (m) => !existingIds.has(String(m._id))
            );
            return {
                ...state,
                messages: [...state.messages, ...newOlder],
                hasMore:  action.payload.hasMore,
                cursor:   action.payload.cursor,
                loading:  false,
            };
        }

        case MESSAGES_ACTIONS.ADD_MESSAGE: {
            // Guard against duplicate insertions (fetch race vs socket delivery)
            const alreadyPresent = state.messages.some(
                (m) => String(m._id) === String(action.payload._id)
            );
            if (alreadyPresent) return state;
            // Prepend — messages list is newest-first
            return {
                ...state,
                messages: [action.payload, ...state.messages],
                sending:  false,
            };
        }

        case MESSAGES_ACTIONS.RESET:
            return initialMessagesState;

        default:
            return state;
    }
}
