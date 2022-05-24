/* globals afterAll, afterEach, beforeAll, describe, it */
import React from 'react';
import { act, render, screen, cleanup } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter as Router } from 'react-router-dom';
import store from '../redux/store';
import server from '../__mocks/mock-server';

import Classpieces from '../views/Classpieces';

// Enable API mocking before tests.
beforeAll(() => server.listen());

// Reset any runtime request handlers we may add during the tests.
afterEach(() => {
  server.resetHandlers();
  cleanup();
});

// Disable API mocking after the tests are done.
afterAll(() => server.close());

function ClasspiecesWrapper(props) {
  return (
    <Provider store={store()}>
      <Router>
        {/* eslint-disable-next-line */}
        <Classpieces {...props}/>
      </Router>
    </Provider>
  );
}
describe('Classpieces view', () => {
  it('renders classpieces view', async () => {
    await act(async () => {
      render(<ClasspiecesWrapper />);
      await screen.findAllByText('SPCM 1861');
    });
  });
  it('renders classpieces count', async () => {
    await act(async () => {
      render(<ClasspiecesWrapper />);
      await screen.findAllByText('Total: 70');
    });
  });
  it('renders classpieces filters', async () => {
    await act(async () => {
      render(<ClasspiecesWrapper />);
      await screen.findAllByText('Filters');
    });
  });
});
