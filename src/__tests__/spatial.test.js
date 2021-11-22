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

import Spatial from '../views/spatial';

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
      _id: '72063',
    },
  },
};
const Wrapper = (props) => (
  <Provider store={store()}>
    <Router>
      <Spatial {...defaultProps} {...props} />
    </Router>
  </Provider>
);
describe('Spatial view', () => {
  it('renders an spatial view', async () => {
    await act(async () => {
      render(<Wrapper />);
      await waitFor(() => screen.findAllByText(`Ahascragh`));
    });
  });
  it('renders an spatial\'s details', async () => {
    await act(async () => {
      render(<Wrapper />);
      await waitFor(() => screen.findByText(`Details`));
      await waitFor(() => screen.findAllByText(`Ballinasloe Municipal District`));
    });
  });
  it('renders an spatial\'s organisations', async () => {
    await act(async () => {
      render(<Wrapper />);
      await waitFor(() => screen.findByText(`Organisations`));
      await waitFor(() => screen.findAllByText(`is location of`));
      await waitFor(() => screen.findAllByText(`Ahascragh`));
    });
  });
});
