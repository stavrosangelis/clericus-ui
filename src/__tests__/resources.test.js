/* globals afterAll, afterEach, beforeAll, describe, it */
import React from 'react';
import { act, render, screen, cleanup } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import store from '../redux/store';
import server from '../__mocks/mock-server';

import Resources from '../views/Resources';

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
      <MemoryRouter initialEntries={['/resources']}>
        <Routes>
          {/* eslint-disable-next-line */}
          <Route path='/resources' element={<Resources {...props} />} />
        </Routes>
      </MemoryRouter>
    </Provider>
  );
}
describe('Resources view', () => {
  it('renders resources view', async () => {
    await act(async () => {
      render(<Wrapper />);
      await screen.findAllByText(`Resources`);
    });
  });
  it('renders resources count', async () => {
    await act(async () => {
      render(<Wrapper />);
      await screen.findAllByText('Total: 4224');
    });
  });
  it('renders resources filters', async () => {
    await act(async () => {
      render(<Wrapper />);
      await screen.findByText('Filters');
    });
  });
  it('renders resources list', async () => {
    await act(async () => {
      render(<Wrapper />);
      await screen.findByText('1704 thumbnail');
    });
  });
});
