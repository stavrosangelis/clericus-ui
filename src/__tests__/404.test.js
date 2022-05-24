/* globals describe, it */
import React from 'react';
import { act, render, screen } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';

import NotFound from '../views/404';

function NotFoundWrapper() {
  return (
    <Router>
      <NotFound />
    </Router>
  );
}
describe('404 error not found view', () => {
  it('renders 404 error not found view', async () => {
    await act(async () => {
      render(<NotFoundWrapper />);
      screen.getByText('The requested page does not exist.');
    });
  });
});
