import React from 'react';
import {
  act,
  render,
  screen,
  cleanup,
  waitForElementToBeRemoved,
  waitFor,
} from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter as Router } from 'react-router-dom';
import store from '../redux/store';
import server from '../__mocks/mock-server';

import Article from '../views/article';

// Enable API mocking before tests.
beforeAll(() => server.listen());

// Reset any runtime request handlers we may add during the tests.
afterEach(() => {
  server.resetHandlers();
  cleanup();
});

// Disable API mocking after the tests are done.
afterAll(() => server.close());

const defaultProps = {
  match: {
    params: {
      permalink: 'about',
    },
  },
};
const ArticleWrapper = (props) => (
  <Provider store={store()}>
    <Router>
      <Article {...defaultProps} {...props} />
    </Router>
  </Provider>
);
describe('Article view', () => {
  it('renders article view', async () => {
    await act(async () => {
      render(<ArticleWrapper />);
      const items = await screen.findAllByText('About Clericus');
      expect(items).toHaveLength(2);
    });
  });
});
