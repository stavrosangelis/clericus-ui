/* globals afterAll, afterEach, beforeAll, describe, it */
import React from 'react';
import { act, render, screen, cleanup, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter as Router } from 'react-router-dom';
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

const defaultProps = {
  match: {
    params: {
      _id: '8891',
    },
  },
};
function Wrapper(props) {
  return (
    <Provider store={store()}>
      <Router>
        {/* eslint-disable-next-line */}
        <Person {...defaultProps} {...props}/>
      </Router>
    </Provider>
  );
}
describe('Person view', () => {
  it('renders an person view', async () => {
    await act(async () => {
      render(<Wrapper />);
      await waitFor(() => screen.findAllByText(`Patrick Adams`));
    });
  });
  it("renders an person's alternate appellations", async () => {
    await act(async () => {
      render(<Wrapper />);
      await waitFor(() => screen.findAllByText('Pádraigh MacAdam'));
    });
  });
  it("renders an person's events", async () => {
    await act(async () => {
      render(<Wrapper />);
      await waitFor(() => screen.findByText(`Events`));
      await waitFor(() => screen.findAllByText(`participated in`));
      await waitFor(() =>
        screen.findAllByText(`Matriculation into 1st Arts and Philosophy`)
      );
    });
  });
  it("renders an person's organisations", async () => {
    await act(async () => {
      render(<Wrapper />);
      await waitFor(() => screen.findByText(`Organisations`));
      await waitFor(() => screen.findAllByText(`has affiliation`));
    });
  });
  it("renders an person's classpieces", async () => {
    await act(async () => {
      render(<Wrapper />);
      await waitFor(() => screen.findByText(`Classpieces`));
      await waitFor(() => screen.findAllByText(`is depicted on`));
      await waitFor(() => screen.findByText(`SPCM 1936-1937`));
    });
  });
  it("renders an person's resources", async () => {
    await act(async () => {
      render(<Wrapper />);
      await waitFor(() => screen.findByText(`Resources`));
      await waitFor(() => screen.findAllByText(`has representation object`));
      await waitFor(() => screen.findAllByText(`Pádraigh MacAdam`));
    });
  });
});
