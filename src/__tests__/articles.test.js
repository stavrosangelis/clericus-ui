/* globals afterAll, afterEach, beforeAll, describe, expect, it */
import React from 'react';
import { act, render, screen, cleanup, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import store from '../redux/store';
import server from '../__mocks/mock-server';
import Articles from '../views/Articles';

// Enable API mocking before tests.
beforeAll(() => server.listen());

// Reset any runtime request handlers we may add during the tests.
afterEach(() => {
  server.resetHandlers();
  cleanup();
});

// Disable API mocking after the tests are done.
afterAll(() => server.close());

function ArticlesWrapper(props) {
  return (
    <Provider store={store()}>
      <MemoryRouter initialEntries={['/article-category/about']}>
        <Routes>
          {/* eslint-disable-next-line */}
          <Route path='/article-category/:permalink' element={<Articles {...props} />} />
        </Routes>
      </MemoryRouter>
    </Provider>
  );
}
describe('Articles view', () => {
  it('renders articles view', async () => {
    await act(async () => {
      render(<ArticlesWrapper />);
      const items = await screen.findAllByText('About');
      expect(items).toHaveLength(2);
    });
  });
  it('renders articles', async () => {
    await act(async () => {
      render(<ArticlesWrapper />);
      await waitFor(() => screen.getByText('St. Patrick’s College Maynooth'));
      await waitFor(() => screen.getByText('About Clericus'));
      await waitFor(() => screen.getByText('Arts and Humanities Institute'));
      await waitFor(() => screen.getByText('Maynooth University'));
    });
  });
});
