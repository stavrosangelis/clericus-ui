/* globals afterAll, afterEach, beforeAll, describe, it */
import React from 'react';
import { act, render, screen, cleanup } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
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

function Wrapper(props) {
  return (
    <Provider store={store()}>
      <MemoryRouter initialEntries={['/resource/20896']}>
        <Routes>
          {/* eslint-disable-next-line */}
          <Route path='/resource/:_id' element={<Resource {...props} />} />
        </Routes>
      </MemoryRouter>
    </Provider>
  );
}
describe('Resource view', () => {
  it('renders an resource view', async () => {
    await act(async () => {
      render(<Wrapper />);
      await screen.findAllByText(`Abracham Ua Fúraigh`);
    });
  });
  it("renders an resource's people", async () => {
    await act(async () => {
      render(<Wrapper />);
      await screen.findByText(`People`);
      await screen.findAllByText(`is representation of`);
    });
  });
  it("renders an resource's classpieces", async () => {
    await act(async () => {
      render(<Wrapper />);
      await screen.findByText(`Classpieces`);
      await screen.findAllByText(`is part of`);
      await screen.findByText(`SPCM 1935-1936`);
    });
  });
});
