/* globals afterAll, afterEach, beforeAll, describe, it */
import React from 'react';
import { act, render, screen, cleanup } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import store from '../redux/store';
import server from '../__mocks/mock-server';

import Spatials from '../views/Spatials';

// Enable API mocking before tests.
beforeAll(() => server.listen());

// Reset any runtime request handlers we may add during the tests.
afterEach(() => {
  server.resetHandlers();
  cleanup();
});

// Disable API mocking after the tests are done.
afterAll(() => server.close());

function Wrapper(props) {
  return (
    <Provider store={store()}>
      <MemoryRouter initialEntries={['/spatials']}>
        <Routes>
          {/* eslint-disable-next-line */}
          <Route path='/spatials' element={<Spatials {...props} />} />
        </Routes>
      </MemoryRouter>
    </Provider>
  );
}
describe('Spatials view', () => {
  it('renders spatials view', async () => {
    await act(async () => {
      render(<Wrapper />);
      await screen.findAllByText(`Locations`);
    });
  });
  it('renders spatials count', async () => {
    await act(async () => {
      render(<Wrapper />);
      await screen.findAllByText('Total: 537');
    });
  });
  it('renders spatials list', async () => {
    await act(async () => {
      render(<Wrapper />);
      await screen.findByText('Ahascragh');
    });
  });
});
