/* globals afterAll, afterEach, beforeAll, describe, it */
import React from 'react';
import { act, render, screen, cleanup, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import server from '../__mocks/mock-server';

import Search from '../views/Generic.search';

function Wrapper(props) {
  return (
    <MemoryRouter initialEntries={['/search/john']}>
      <Routes>
        {/* eslint-disable-next-line */}
        <Route path='/search/:term' element={<Search {...props} />} />
      </Routes>
    </MemoryRouter>
  );
}

// Enable API mocking before tests.
beforeAll(() => server.listen());

// Reset any runtime request handlers we may add during the tests.
afterEach(() => {
  server.resetHandlers();
  cleanup();
});

// Disable API mocking after the tests are done.
afterAll(() => server.close());

describe('Render Search view', () => {
  it('renders search view', async () => {
    await act(async () => {
      render(<Wrapper />);
      screen.findAllByText('Search');
    });
  });
  it('renders articles results view', async () => {
    await act(async () => {
      render(<Wrapper />);
      // await waitFor(() => screen.getByText('Articles'));
      await waitFor(() => {
        screen.getByText('Articles');
        screen.getByText('John Harty');
      });
    });
  });
  it('renders events results view', async () => {
    await act(async () => {
      render(<Wrapper />);
      await waitFor(() => {
        screen.getByText('Events');
        screen.getByText('Scholarship');
      });
    });
  });
  it('renders people results view', async () => {
    await act(async () => {
      render(<Wrapper />);
      await waitFor(() => {
        screen.getByText('People');
        screen.getByText('John Carr');
      });
    });
  });
  it('renders resources results view', async () => {
    await act(async () => {
      render(<Wrapper />);
      await waitFor(() => {
        screen.getByText('Resources');
        screen.getByText('John Fitzgibbon');
      });
    });
  });
});
