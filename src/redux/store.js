import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import rootReducer from './reducers';
import defaultState from './default-state';

function configureStore(state = defaultState) {
  const store = createStore(rootReducer, state, applyMiddleware(thunk));
  return store;
}
export default configureStore;
