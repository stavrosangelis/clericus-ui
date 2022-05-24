/* globals afterAll, afterEach, beforeAll, describe, it */
import React from 'react';
import { act, render, screen, cleanup } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
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

function ClasspieceWrapper(props) {
  return (
    <Provider store={store()}>
      <MemoryRouter initialEntries={['/classpiece/20896']}>
        <Routes>
          {/* eslint-disable-next-line */}
          <Route path='/classpiece/:_id' element={<Classpiece {...props} />} />
        </Routes>
      </MemoryRouter>
    </Provider>
  );
}
describe('Classpiece view', () => {
  it('renders a classpiece view', async () => {
    await act(async () => {
      render(<ClasspieceWrapper />);
      await screen.findAllByText('SPCM 1861');
    });
  });
  it('renders a classpiece events', async () => {
    await act(async () => {
      render(<ClasspieceWrapper />);
      await screen.findAllByText('Classpiece 1861 compilation');
    });
  });
  it('renders a classpiece people', async () => {
    await act(async () => {
      render(<ClasspieceWrapper />);
      await screen.findAllByText('Martin Ansbro');
    });
  });
  it('renders a classpiece organisations', async () => {
    await act(async () => {
      render(<ClasspieceWrapper />);
      await screen.findAllByText(`is related to`);
    });
  });
});
