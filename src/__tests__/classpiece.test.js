/* globals afterAll, afterEach, beforeAll, describe, it */
import React from 'react';
import { act, render, screen, cleanup, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter as Router } from 'react-router-dom';
import store from '../redux/store';
import server from '../__mocks/mock-server';

import Classpiece from '../views/Classpiece';

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
      _id: '20896',
    },
  },
};
function ClasspieceWrapper(props) {
  return (
    <Provider store={store()}>
      <Router>
        {/* eslint-disable-next-line */}
        <Classpiece {...defaultProps} {...props}/>
      </Router>
    </Provider>
  );
}
describe('Classpiece view', () => {
  it('renders a classpiece view', async () => {
    await act(async () => {
      render(<ClasspieceWrapper />);
      await waitFor(() => screen.findAllByText('SPCM 1861'));
    });
  });
  it('renders a classpiece events', async () => {
    await act(async () => {
      render(<ClasspieceWrapper />);
      await waitFor(() => screen.findAllByText('Classpiece 1861 compilation'));
    });
  });
  it('renders a classpiece people', async () => {
    await act(async () => {
      render(<ClasspieceWrapper />);
      await waitFor(() => screen.findAllByText('Martin Ansbro'));
    });
  });
  it('renders a classpiece organisations', async () => {
    await act(async () => {
      render(<ClasspieceWrapper />);
      await waitFor(() => screen.findAllByText(`is related to`));
    });
  });
});
