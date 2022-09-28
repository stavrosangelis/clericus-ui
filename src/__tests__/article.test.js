/* globals afterAll, afterEach, beforeAll, describe, expect, it */
import React from 'react';
import { act, render, screen, cleanup } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import store from '../redux/store';
import server from '../__mocks/mock-server';

import Article from '../views/Article';

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
      <MemoryRouter initialEntries={['/article/about']}>
        <Routes>
          {/* eslint-disable-next-line */}
          <Route path='/article/:permalink' element={<Article {...props} />} />
        </Routes>
      </MemoryRouter>
    </Provider>
  );
}
describe('Article view', () => {
  it('renders article view', async () => {
    await act(async () => {
      render(<Wrapper />);
      const items = await screen.findAllByText('About Clericus');
      expect(items).toHaveLength(2);
    });
  });
});
