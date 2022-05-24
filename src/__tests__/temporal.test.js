/* globals afterAll, afterEach, beforeAll, describe, it */
import React from 'react';
import { act, render, screen, cleanup, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter as Router } from 'react-router-dom';
import store from '../redux/store';
import server from '../__mocks/mock-server';

import Temporal from '../views/Temporal';

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
      _id: '91341',
    },
  },
};
function Wrapper(props) {
  return (
    <Provider store={store()}>
      <Router>
        {/* eslint-disable-next-line */}
        <Temporal {...defaultProps} {...props}/>
      </Router>
    </Provider>
  );
}
describe('Temporal view', () => {
  it('renders a temporal view', async () => {
    await act(async () => {
      render(<Wrapper />);
      await waitFor(() => screen.findAllByText(`21-09-1782`));
    });
  });
  it("renders a temporal's details", async () => {
    await act(async () => {
      render(<Wrapper />);
      await waitFor(() => screen.findByText(`Dates`));
      await waitFor(() =>
        screen.findByText(`1782 September 21 - 31 September 21`)
      );
    });
  });
  it("renders an temporal's related events", async () => {
    await act(async () => {
      render(<Wrapper />);
      await waitFor(() => screen.findByText(`Events`));
      await waitFor(() => screen.findAllByText(`is time of`));
      await waitFor(() => screen.findAllByText(`Ordination`));
    });
  });
});
