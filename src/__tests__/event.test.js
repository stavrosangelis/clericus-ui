/* globals afterAll, afterEach, beforeAll, describe, it */
import React from 'react';
import { act, render, screen, cleanup, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter as Router } from 'react-router-dom';
import store from '../redux/store';
import server from '../__mocks/mock-server';

import Event from '../views/Event';

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
      _id: '86171',
    },
  },
};
function Wrapper(props) {
  return (
    <Provider store={store()}>
      <Router>
        {/* eslint-disable-next-line */}
        <Event {...defaultProps} {...props}/>
      </Router>
    </Provider>
  );
}
describe('Event view', () => {
  it('renders an event view', async () => {
    await act(async () => {
      render(<Wrapper />);
      await waitFor(() => screen.findAllByText(`'said to bee a Jesuit'`));
    });
  });
  it("renders an event's people", async () => {
    await act(async () => {
      render(<Wrapper />);
      await waitFor(() => screen.findAllByText('James Gibbons'));
    });
  });
  it("renders an event's dates", async () => {
    await act(async () => {
      render(<Wrapper />);
      await waitFor(() => screen.findAllByText(`1698`));
    });
  });
  it("renders an event's locations", async () => {
    await act(async () => {
      render(<Wrapper />);
      await waitFor(() => screen.findAllByText(`Dublin`));
    });
  });
});
