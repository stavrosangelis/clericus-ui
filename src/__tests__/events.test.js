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

import Events from '../views/events';

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
      <Events {...props} />
    </Router>
  </Provider>
);
describe('Events view', () => {
  it('renders events view', async () => {
    await act(async () => {
      render(<Wrapper />);
      await waitFor(() => screen.findAllByText(`'Infirme'`));
    });
  });
  it('renders events count', async () => {
    await act(async () => {
      render(<Wrapper />);
      await waitFor(() => screen.findAllByText('Total: 30119'));
    });
  });
  it('renders events filters', async () => {
    await act(async () => {
      render(<Wrapper />);
      await waitFor(() => screen.findAllByText('Filters'));
    });
  });
});
