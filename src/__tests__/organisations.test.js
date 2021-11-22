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

import Organisations from '../views/organisations';

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
      <Organisations {...props} />
    </Router>
  </Provider>
);
describe('Organisations view', () => {
  it('renders organisations view', async () => {
    await act(async () => {
      render(<Wrapper />);
      await waitFor(() => screen.findAllByText(`Organisations`));
    });
  });
  it('renders organisations count', async () => {
    await act(async () => {
      render(<Wrapper />);
      await waitFor(() => screen.findAllByText('Total: 25'));
    });
  });
  it('renders organisations filters', async () => {
    await act(async () => {
      render(<Wrapper />);
      await waitFor(() => screen.findByText('Filters'));
    });
  });
  it('renders organisations list', async () => {
    await act(async () => {
      render(<Wrapper />);
      await waitFor(() => screen.findByText('All Hallows College (Dublin)'));
    });
  });
});
