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

import Temporals from '../views/temporals';

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
      <Temporals {...props} />
    </Router>
  </Provider>
);
describe('Temporals view', () => {
  it('renders temporals view', async () => {
    await act(async () => {
      render(<Wrapper />);
      await waitFor(() => screen.findAllByText(`Dates`));
    });
  });
  it('renders temporals count', async () => {
    await act(async () => {
      render(<Wrapper />);
      await waitFor(() => screen.findAllByText('Total: 10003'));
    });
  });
  it('renders temporals list', async () => {
    await act(async () => {
      render(<Wrapper />);
      await waitFor(() => screen.findByText('21-09-1782'));
    });
  });
});
