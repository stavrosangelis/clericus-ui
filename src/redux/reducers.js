import defaultState from './default-state';

const initialState = defaultState;

function rootReducer(state = initialState, action) {
  if (action.type === 'GENERIC_UPDATE') {
    return { ...state, ...action.payload };
  }
  return state;
}
export default rootReducer;
