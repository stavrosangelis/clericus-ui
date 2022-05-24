/* globals afterAll, afterEach, beforeAll, describe, it */
import React from 'react';
import { act, render, screen, cleanup, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter as Router } from 'react-router-dom';
import store from '../redux/store';
import server from '../__mocks/mock-server';

import Resource from '../views/Resource';

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
      _id: '9199',
    },
  },
};
function Wrapper(props) {
  return (
    <Provider store={store()}>
      <Router>
        {/* eslint-disable-next-line */}
        <Resource {...defaultProps} {...props}/>
      </Router>
    </Provider>
  );
}
describe('Resource view', () => {
  it('renders an resource view', async () => {
    await act(async () => {
      render(<Wrapper />);
      await waitFor(() => screen.findAllByText(`Abracham Ua Fúraigh`));
    });
  });
  it("renders an resource's people", async () => {
    await act(async () => {
      render(<Wrapper />);
      await waitFor(() => screen.findByText(`People`));
      await waitFor(() => screen.findAllByText(`is representation of`));
    });
  });
  it("renders an resource's classpieces", async () => {
    await act(async () => {
      render(<Wrapper />);
      await waitFor(() => screen.findByText(`Classpieces`));
      await waitFor(() => screen.findAllByText(`is part of`));
      await waitFor(() => screen.findByText(`SPCM 1935-1936`));
    });
  });
});
