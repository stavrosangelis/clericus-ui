import {defaultState} from "./default-state";

const initialState = defaultState;

function rootReducer(state = initialState, action) {
  if (action.type === "GENERIC_UPDATE") {
    return Object.assign({}, state, action.payload);
  }
  return state;
}
export default rootReducer;
