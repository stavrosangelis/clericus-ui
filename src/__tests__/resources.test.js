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

import Resources from '../views/resources';

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
      <Resources {...props} />
    </Router>
  </Provider>
);
describe('Resources view', () => {
  it('renders resources view', async () => {
    await act(async () => {
      render(<Wrapper />);
      await waitFor(() => screen.findAllByText(`Resources`));
    });
  });
  it('renders resources count', async () => {
    await act(async () => {
      render(<Wrapper />);
      await waitFor(() => screen.findAllByText('Total: 4224'));
    });
  });
  it('renders resources filters', async () => {
    await act(async () => {
      render(<Wrapper />);
      await waitFor(() => screen.findByText('Filters'));
    });
  });
  it('renders resources list', async () => {
    await act(async () => {
      render(<Wrapper />);
      await waitFor(() => screen.findByText('1704 thumbnail'));
    });
  });
});
