/* globals afterAll, afterEach, beforeAll, describe, it */
import React from 'react';
import {
  act,
  fireEvent,
  render,
  screen,
  cleanup,
  waitFor,
} from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import server from '../__mocks/mock-server';

import ContactForm from '../views/Contact.form';

// Enable API mocking before tests.
beforeAll(() => server.listen());

// Reset any runtime request handlers we may add during the tests.
afterEach(() => {
  server.resetHandlers();
  cleanup();
});

// Disable API mocking after the tests are done.
afterAll(() => server.close());

function Wrapper() {
  return (
    <Router>
      <ContactForm />
    </Router>
  );
}

describe('Contact form view', () => {
  it('renders contact form view', async () => {
    await act(async () => {
      render(<Wrapper />);
      await screen.findAllByText('Full Name*');
    });
  });

  it('contact form submit error no name', async () => {
    await act(async () => {
      render(<Wrapper />);
      const btn = await waitFor(() => screen.getByText('Submit'));
      fireEvent.click(btn);
      await waitFor(() =>
        screen.getByText('Please enter your name to continue!')
      );
    });
  });

  it('contact form submit error no email', async () => {
    await act(async () => {
      render(<Wrapper />);
      const inputName = await waitFor(() =>
        screen.getByLabelText('Full Name*')
      );
      fireEvent.change(inputName, { target: { value: 'test' } });
      const btn = await waitFor(() => screen.getByText('Submit'));
      fireEvent.click(btn);
      await waitFor(() =>
        screen.getByText('Please enter a valid email address to continue!')
      );
    });
  });

  it('contact form submit erroneous email value', async () => {
    await act(async () => {
      render(<Wrapper />);
      const inputName = await waitFor(() =>
        screen.getByLabelText('Full Name*')
      );
      const inputEmail = await waitFor(() => screen.getByLabelText('Email*'));
      fireEvent.change(inputName, { target: { value: 'test' } });
      fireEvent.change(inputEmail, { target: { value: 'test@hh' } });
      const btn = await waitFor(() => screen.getByText('Submit'));
      fireEvent.click(btn);
      await waitFor(() =>
        screen.getByText('Please enter a valid email address to continue!')
      );
    });
  });

  it('contact form submit error no subject', async () => {
    await act(async () => {
      render(<Wrapper />);
      const inputName = await waitFor(() =>
        screen.getByLabelText('Full Name*')
      );
      const inputEmail = await waitFor(() => screen.getByLabelText('Email*'));
      fireEvent.change(inputName, { target: { value: 'test' } });
      fireEvent.change(inputEmail, { target: { value: 'test@test.com' } });
      const btn = await waitFor(() => screen.getByText('Submit'));
      fireEvent.click(btn);
      await waitFor(() =>
        screen.getByText('Please enter your subject to continue!')
      );
    });
  });

  it('contact form submit error no message', async () => {
    await act(async () => {
      render(<Wrapper />);
      const inputName = await waitFor(() =>
        screen.getByLabelText('Full Name*')
      );
      const inputEmail = await waitFor(() => screen.getByLabelText('Email*'));
      const inputSubject = await waitFor(() =>
        screen.getByLabelText('Subject*')
      );
      fireEvent.change(inputName, { target: { value: 'test' } });
      fireEvent.change(inputEmail, { target: { value: 'test@test.com' } });
      fireEvent.change(inputSubject, { target: { value: 'asdfghjk' } });
      const btn = await waitFor(() => screen.getByText('Submit'));
      fireEvent.click(btn);
      await waitFor(() =>
        screen.getByText('Your message must contain at least 10 characters!')
      );
    });
  });
});
