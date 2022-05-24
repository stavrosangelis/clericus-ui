/* globals afterAll, afterEach, beforeAll, describe, it */
import React from 'react';
import { act, render, screen, cleanup } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import store from '../redux/store';
import server from '../__mocks/mock-server';

import Person from '../views/Person';

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
      <MemoryRouter initialEntries={['/person/8891']}>
        <Routes>
          {/* eslint-disable-next-line */}
          <Route path='/person/:_id' element={<Person {...props} />} />
        </Routes>
      </MemoryRouter>
    </Provider>
  );
}
describe('Person view', () => {
  it('renders an person view', async () => {
    await act(async () => {
      render(<Wrapper />);
      await screen.findAllByText(`Patrick Adams`);
    });
  });
  it("renders an person's alternate appellations", async () => {
    await act(async () => {
      render(<Wrapper />);
      await screen.findAllByText('Pádraigh MacAdam');
    });
  });
  it("renders an person's events", async () => {
    await act(async () => {
      render(<Wrapper />);
      await screen.findByText(`Events`);
      await screen.findAllByText(`participated in`);
      await screen.findAllByText(`Matriculation into 1st Arts and Philosophy`);
    });
  });
  it("renders an person's organisations", async () => {
    await act(async () => {
      render(<Wrapper />);
      await screen.findByText(`Organisations`);
      await screen.findAllByText(`has affiliation`);
    });
  });
  it("renders an person's classpieces", async () => {
    await act(async () => {
      render(<Wrapper />);
      await screen.findByText(`Classpieces`);
      await screen.findAllByText(`is depicted on`);
      await screen.findByText(`SPCM 1936-1937`);
    });
  });
  it("renders an person's resources", async () => {
    await act(async () => {
      render(<Wrapper />);
      await screen.findByText(`Resources`);
      await screen.findAllByText(`has representation object`);
      await screen.findAllByText(`Pádraigh MacAdam`);
    });
  });
});
