/* globals afterAll, afterEach, beforeAll, describe, it */
import React from 'react';
import { act, render, screen, cleanup } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
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

function Wrapper(props) {
  return (
    <Provider store={store()}>
      <MemoryRouter initialEntries={['/temporal/91341']}>
        <Routes>
          {/* eslint-disable-next-line */}
          <Route path='/temporal/:_id' element={<Temporal {...props} />} />
        </Routes>
      </MemoryRouter>
    </Provider>
  );
}
describe('Temporal view', () => {
  it('renders a temporal view', async () => {
    await act(async () => {
      render(<Wrapper />);
      await screen.findAllByText(`21-09-1782`);
    });
  });
  it("renders a temporal's details", async () => {
    await act(async () => {
      render(<Wrapper />);
      await screen.findByText(`Dates`);
      await screen.findByText(`1782 September 21 - 31 September 21`);
    });
  });
  it("renders an temporal's related events", async () => {
    await act(async () => {
      render(<Wrapper />);
      await screen.findByText(`Events`);
      await screen.findAllByText(`is time of`);
      await screen.findAllByText(`Ordination`);
    });
  });
});
