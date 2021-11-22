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

import Spatials from '../views/spatials';

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
      <Spatials {...props} />
    </Router>
  </Provider>
);
describe('Spatials view', () => {
  it('renders spatials view', async () => {
    await act(async () => {
      render(<Wrapper />);
      await waitFor(() => screen.findAllByText(`Locations`));
    });
  });
  it('renders spatials count', async () => {
    await act(async () => {
      render(<Wrapper />);
      await waitFor(() => screen.findAllByText('Total: 537'));
    });
  });
  it('renders spatials list', async () => {
    await act(async () => {
      render(<Wrapper />);
      await waitFor(() => screen.findByText('Ahascragh'));
    });
  });
});
