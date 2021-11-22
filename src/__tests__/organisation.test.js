import React from 'react';
import {
  act,
  render,
  screen,
  cleanup,
  waitForElementToBeRemoved,
  waitFor,
} from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter as Router } from 'react-router-dom';
import store from '../redux/store';
import server from '../__mocks/mock-server';

import Organisation from '../views/organisation';

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
      _id: '189',
    },
  },
};
const Wrapper = (props) => (
  <Provider store={store()}>
    <Router>
      <Organisation {...defaultProps} {...props} />
    </Router>
  </Provider>
);
describe('Organisation view', () => {
  it('renders an organisation view', async () => {
    await act(async () => {
      render(<Wrapper />);
      await waitFor(() => screen.findByText(`Dublin [Diocese]`));
    });
  });
  it('renders an organisation\'s alternate appellations', async () => {
    await act(async () => {
      render(<Wrapper />);
      await waitFor(() => screen.findByText('Dublinensis'));
    });
  });
  it('renders an organisation\'s locations', async () => {
    await act(async () => {
      render(<Wrapper />);
      await waitFor(() => screen.findByText('Locations'));
      await waitFor(() => screen.findByText('hasItsEpiscopalSeeIn'));
    });
  });
  it('renders an organisation\'s events', async () => {
    await act(async () => {
      render(<Wrapper />);
      await waitFor(() => screen.findByText(`Events`));
      await waitFor(() => screen.findAllByText(`is related to`));
    });
  });
  it('renders an organisation\'s people', async () => {
    await act(async () => {
      render(<Wrapper />);
      await waitFor(() => screen.findByText(`People`));
      await waitFor(() => screen.findAllByText(`is affiliation of`));
    });
  });
  it('renders an organisation\'s organisations', async () => {
    await act(async () => {
      render(<Wrapper />);
      await waitFor(() => screen.findByText(`Organisations`));
      await waitFor(() => screen.findAllByText(`has part`));
      await waitFor(() => screen.findByText(`Inch [Parish]`));
    });
  });
});
