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

import People from '../views/people';

// Enable API mocking before tests.
beforeAll(() => server.listen());

// Reset any runtime request handlers we may add during the tests.
afterEach(() => {
  server.resetHandlers();
  cleanup();
});

// Disable API mocking after the tests are done.
afterAll(() => server.close());

const Wrapper = (props) => (
  <Provider store={store()}>
    <Router>
      <People {...props} />
    </Router>
  </Provider>
);
describe('People view', () => {
  it('renders people view', async () => {
    await act(async () => {
      render(<Wrapper />);
      await waitFor(() => screen.findAllByText(`People`));
    });
  });
  it('renders people count', async () => {
    await act(async () => {
      render(<Wrapper />);
      await waitFor(() => screen.findAllByText('Total: 23683'));
    });
  });
  it('renders people filters', async () => {
    await act(async () => {
      render(<Wrapper />);
      await waitFor(() => screen.findByText('Filters'));
    });
  });
  it('renders people list', async () => {
    await act(async () => {
      render(<Wrapper />);
      await waitFor(() => screen.findByText('Mahony Thomas'));
    });
  });
});
