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

import Articles from '../views/articles';

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
const ArticlesWrapper = (props) => (
  <Provider store={store()}>
    <Router>
      <Articles {...defaultProps} {...props} />
    </Router>
  </Provider>
);
describe('Articles view', () => {
  it('renders articles view', async () => {
    await act(async () => {
      render(<ArticlesWrapper />);
      const items = await screen.findAllByText('About');
      expect(items).toHaveLength(2);
    });
  });
  it('renders articles', async () => {
    await act(async () => {
      render(<ArticlesWrapper />);
      await waitFor(() => screen.getByText('St. Patrick’s College Maynooth'));
      await waitFor(() => screen.getByText('About Clericus'));
      await waitFor(() => screen.getByText('Arts and Humanities Institute'));
      await waitFor(() => screen.getByText('Maynooth University'));
    });
  });
});
