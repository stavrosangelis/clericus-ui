// __tests__/views/home.js
import React, { lazy } from 'react';
import Enzyme, {shallow} from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import Home from '../views/home';

Enzyme.configure({adapter: new Adapter()});

const HomeSlider = lazy(() => import('../components/home/carousel'));
const SectionNumbers = lazy(() => import('../components/home/section-numbers'));
const About = lazy(() => import('../components/home/about'));
const HighLights = lazy(() => import('../components/home/highlights'));
const News = lazy(() => import('../components/home/news'));
const Welcome = lazy(() => import('../components/home/welcome'));
const Visualisations = lazy(() => import('../components/home/visualisations'));

it("renders Home slider header", () => {
  const home = shallow(<Home />);
  console.log(expect(home.find(HomeSlider)))
  expect(home.find(HomeSlider)).toHaveLength(1);
});

it.skip("renders Home section numbers", () => {
  const home = shallow(<Home />);
  expect(home.find(SectionNumbers)).toHaveLength(1);
});

it.skip("renders Home about", () => {
  const home = shallow(<Home />);
  expect(home.find(About)).toHaveLength(1);
});

it.skip("renders Home highlights", () => {
  const home = shallow(<Home />);
  expect(home.find(HighLights)).toHaveLength(1);
});

it.skip("renders Home slider news", () => {
  const home = shallow(<News />);
  expect(home.find(HomeSlider)).toHaveLength(1);
});

it.skip("renders Home slider welcome", () => {
  const home = shallow(<Home />);
  expect(home.find(Welcome)).toHaveLength(1);
});

it.skip("renders Home slider visualisations", () => {
  const home = shallow(<Home />);
  expect(home.find(Visualisations)).toHaveLength(1);
});
