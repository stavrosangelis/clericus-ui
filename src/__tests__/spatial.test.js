/* globals afterAll, afterEach, beforeAll, describe, it */
import React from 'react';
import { act, render, screen, cleanup } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import store from '../redux/store';
import server from '../__mocks/mock-server';

import Spatial from '../views/Spatial';

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
      <MemoryRouter initialEntries={['/spatial/72063']}>
        <Routes>
          {/* eslint-disable-next-line */}
          <Route path='/spatial/:_id' element={<Spatial {...props} />} />
        </Routes>
      </MemoryRouter>
    </Provider>
  );
}
describe('Spatial view', () => {
  it('renders a spatial view', async () => {
    await act(async () => {
      render(<Wrapper />);
      await screen.findAllByText(`Ahascragh`);
    });
  });
  it("renders a spatial's details", async () => {
    await act(async () => {
      render(<Wrapper />);
      await screen.findByText(`Details`);
      await screen.findAllByText(`Ballinasloe Municipal District`);
    });
  });
  it("renders a spatial's organisations", async () => {
    await act(async () => {
      render(<Wrapper />);
      await screen.findByText(`Organisations`);
      await screen.findAllByText(`is location of`);
      await screen.findAllByText(`Ahascragh`);
    });
  });
});
