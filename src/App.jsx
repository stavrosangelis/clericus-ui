import React, { useEffect, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import { loadProgressBar } from 'axios-progress-bar';
import ScrollUp from 'react-scroll-up';
import { useDispatch } from 'react-redux';

// css
import 'axios-progress-bar/dist/nprogress.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import './assets/fonts/roboto/css/roboto.css';
import './assets/fonts/helvetica-neue/style.css';
import './assets/fonts/font-awesome/css/font-awesome.min.css';
import './assets/fonts/pe-icon-7/css/pe-icon-7-stroke.css';
import './assets/fonts/spartan/spartan.css';
import './App.scss';

import Topbar from './components/topbar';
import Header from './components/header';
import Footer from './components/footer';

import mainRoutes from './routes';
import NotFound from './views/404';

import {
  loadOrganisationsType,
  loadOrganisations,
  loadEventsType,
  loadPeopleType,
  loadResourcesType,
  loadGenericStats,
  loadPeopleSources,
} from './redux/actions';

const CookiesConsent = lazy(() => import('./components/cookies-consent'));

function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    loadProgressBar();
    dispatch(loadOrganisationsType());
    dispatch(loadOrganisations());
    dispatch(loadEventsType());
    dispatch(loadPeopleType());
    dispatch(loadResourcesType());
    dispatch(loadGenericStats());
    dispatch(loadPeopleSources());
  }, [dispatch]);

  const routes = [];
  for (let i = 0; i < mainRoutes.length; i += 1) {
    const route = mainRoutes[i];
    let newRoute = [];
    if (route.component !== null) {
      newRoute = (
        <Route path={route.path} key={i} component={route.component} />
      );
    }
    if (route.name === 'Home') {
      newRoute = (
        <Route exact path={route.path} key={i} component={route.component} />
      );
    }
    routes.push(newRoute);
  }
  const noMatch = <Route component={NotFound} key="not-found" />;
  routes.push(noMatch);

  const ScrollToTopStyle = {
    position: 'fixed',
    bottom: '50px',
    right: '30px',
    cursor: 'pointer',
    transition: 'opacity 0.2s linear 0s, visibility',
    opacity: '1',
    visibility: 'visible',
    zIndex: '999',
  };

  return (
    <Router basename="/">
      <div className="app-body">
        <Topbar />
        <Header />
        <div className="content-container" style={{ paddingBottom: '0' }}>
          <Switch>{routes}</Switch>
        </div>
        <Footer />
      </div>
      <ScrollUp showUnder={160} style={ScrollToTopStyle}>
        <div className="scroll-up">
          <i className="fa-chevron-up fa" />
        </div>
      </ScrollUp>
      <Suspense fallback={[]}>
        <CookiesConsent />
      </Suspense>
    </Router>
  );
}

export default App;
