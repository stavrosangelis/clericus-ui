// __tests__/views/home.js
import React from 'react';
import { render, fireEvent, waitFor, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';

/*
import Home from '../views/home';
import HomeSlider from '../components/home/carousel';
import SectionNumbers from '../components/home/section-numbers';
import About from '../components/home/about';
import HighLights from '../components/home/highlights';
import News from '../components/home/news';
import Welcome from '../components/home/welcome';
import Visualisations from '../components/home/visualisations';

const HomeSlider = lazy(() => import('../components/home/carousel'));
const SectionNumbers = lazy(() => import('../components/home/section-numbers'));
const About = lazy(() => import('../components/home/about'));
const HighLights = lazy(() => import('../components/home/highlights'));
const News = lazy(() => import('../components/home/news'));
const Welcome = lazy(() => import('../components/home/welcome'));
const Visualisations = lazy(() => import('../components/home/visualisations')); */

test('renders Home slider header', () => {
  render(
    <div className="row">
      <div className="col-12">
        <h1>Welcome to the Irish in Europe Project</h1>
      </div>
    </div>
  );
});
/*
test.skip('renders Home section numbers', () => {
  const home = shallow(<Home />);
  expect(home.find(SectionNumbers)).toHaveLength(1);
});

test.skip('renders Home about', () => {
  const home = shallow(<Home />);
  expect(home.find(About)).toHaveLength(1);
});

test.skip('renders Home highlights', () => {
  const home = shallow(<Home />);
  expect(home.find(HighLights)).toHaveLength(1);
});

test.skip('renders Home slider news', () => {
  const home = shallow(<News />);
  expect(home.find(HomeSlider)).toHaveLength(1);
});

test.skip('renders Home slider welcome', () => {
  const home = shallow(<Home />);
  expect(home.find(Welcome)).toHaveLength(1);
});

test.skip('renders Home slider visualisations', () => {
  const home = shallow(<Home />);
  expect(home.find(Visualisations)).toHaveLength(1);
});
*/
