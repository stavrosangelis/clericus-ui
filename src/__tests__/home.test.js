/* globals afterAll, afterEach, beforeAll, describe, expect, it */
import React from 'react';
import { act, render, screen, cleanup, waitFor } from '@testing-library/react';

import { Provider } from 'react-redux';
import { BrowserRouter as Router } from 'react-router-dom';
import store from '../redux/store';
import server from '../__mocks/mock-server';

import HomeSlider from '../components/home/Carousel';
import SectionNumbers from '../components/home/Section.numbers';
import About from '../components/home/About';
import HighLights from '../components/home/Highlights';
import News from '../components/home/News';
import Welcome from '../components/home/Welcome';
import Visualisations from '../components/home/Visualisations';

// Enable API mocking before tests.
beforeAll(() => server.listen());

// Reset any runtime request handlers we may add during the tests.
afterEach(() => {
  server.resetHandlers();
  cleanup();
});

// Disable API mocking after the tests are done.
afterAll(() => server.close());

// slider
describe('HomeSlider component', () => {
  it('renders carousel', async () => {
    await act(async () => {
      const { container } = render(<HomeSlider />);
      const carousel = container.querySelector('.home-carousel');
      expect(container.contains(carousel)).toBe(true);
    });
  });
  it('renders carousel item', async () => {
    await act(async () => {
      const { container } = render(<HomeSlider />);
      const carouselItem = container.querySelector('.carousel-item');
      expect(container.contains(carouselItem)).toBe(true);
    });
  });
  it('loads carousel items', async () => {
    await act(async () => {
      render(<HomeSlider />);
      await waitFor(() => screen.getByText('Irish Cultural Centre (Paris)'));
    });
  });
});

// section numbers
function SectionNumbersWrapper(props) {
  return (
    <Provider store={store()}>
      {/* eslint-disable-next-line */}
      <SectionNumbers  {...props} />
    </Provider>
  );
}
describe('SectionNumbers component', () => {
  it('renders section numbers', async () => {
    await act(async () => {
      const { container } = render(<SectionNumbersWrapper />);
      const section = container.querySelector('.section-numbers');
      expect(container.contains(section)).toBe(true);
    });
  });
});

// about
function AboutWrapper() {
  return (
    <Router>
      <About />
    </Router>
  );
}

describe('About component', () => {
  it('renders about', async () => {
    await act(async () => {
      render(<AboutWrapper />);
      await waitFor(() => screen.getByText('About Clericus'));
    });
  });
});

// highlights
function HighlightsWrapper() {
  return (
    <Router>
      <HighLights />
    </Router>
  );
}
describe('Highlights component', () => {
  it('renders highlights', async () => {
    await act(async () => {
      render(<HighlightsWrapper />);
      const items = await screen.findAllByText('Peter Yorke');
      expect(items).toHaveLength(2);
    });
  });
});

// news
function NewsWrapper() {
  return (
    <Router>
      <News />
    </Router>
  );
}
describe('News component', () => {
  it('renders news', async () => {
    await act(async () => {
      render(<NewsWrapper />);
      await waitFor(() => screen.getByText('Jack P. Hanlon'));
    });
  });
});

// welcome
function WelcomeWrapper() {
  return (
    <Router>
      <Welcome />
    </Router>
  );
}
describe('Welcome component', () => {
  it('renders welcome', async () => {
    await act(async () => {
      render(<WelcomeWrapper />);
      await waitFor(() => screen.getByText('Welcome Fáilte Vale'));
    });
  });
});

// visualisations
function VisualisationsWrapper() {
  return (
    <Router>
      <Visualisations />
    </Router>
  );
}
describe('Visualisations component', () => {
  it('renders visualisations', async () => {
    await act(async () => {
      render(<VisualisationsWrapper />);
      screen.getByText('Spatial distribution');
    });
  });
});
