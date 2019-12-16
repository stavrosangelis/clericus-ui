import {createStore, applyMiddleware} from "redux";
import rootReducer from "./reducers";
import thunk from 'redux-thunk';
import {defaultState} from './default-state';

function configureStore(state = defaultState) {
  const store = createStore(
    rootReducer,
    state,
    applyMiddleware(thunk),
  );
  return store;
}
export default configureStore;
