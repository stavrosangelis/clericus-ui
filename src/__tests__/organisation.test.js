/* globals afterAll, afterEach, beforeAll, describe, expect, it */
import React from 'react';
import { act, render, screen, cleanup } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import store from '../redux/store';
import server from '../__mocks/mock-server';

import Organisation from '../views/Organisation';

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
      <MemoryRouter initialEntries={['/organisation/189']}>
        <Routes>
          {/* eslint-disable-next-line */}
          <Route path='/organisation/:_id' element={<Organisation {...props} />} />
        </Routes>
      </MemoryRouter>
    </Provider>
  );
}

describe('Organisation view', () => {
  it('renders an organisation view', async () => {
    await act(async () => {
      render(<Wrapper />);
      const items = await screen.findAllByText(`Dublin`);
      expect(items).toHaveLength(2);
    });
  });
  it("renders an organisation's alternate appellations", async () => {
    await act(async () => {
      render(<Wrapper />);
      await screen.findByText('Dublinensis');
    });
  });
  it("renders an organisation's locations", async () => {
    await act(async () => {
      render(<Wrapper />);
      await screen.findByText('Locations');
      await screen.findByText('hasItsEpiscopalSeeIn');
    });
  });
  it("renders an organisation's events", async () => {
    await act(async () => {
      render(<Wrapper />);
      await screen.findByText(`Events`);
      await screen.findAllByText(`is related to`);
    });
  });
  it("renders an organisation's people", async () => {
    await act(async () => {
      render(<Wrapper />);
      await screen.findByText(`People`);
      await screen.findAllByText(`is affiliation of`);
    });
  });
  it("renders an organisation's organisations", async () => {
    await act(async () => {
      render(<Wrapper />);
      await screen.findByText(`Organisations`);
      await screen.findAllByText(`has part`);
      await screen.findByText(`Inch [Parish]`);
    });
  });
});
