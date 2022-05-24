import React, { useEffect, useState, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { loadProgressBar } from 'axios-progress-bar';
import { useDispatch } from 'react-redux';

// css
import 'axios-progress-bar/dist/nprogress.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import './assets/fonts/roboto/css/roboto.css';
import './assets/fonts/helvetica-neue/style.css';
import './assets/fonts/font-awesome/css/font-awesome.min.css';
import './assets/fonts/pe-icon-7/css/pe-icon-7-stroke.css';
import './assets/fonts/spartan/spartan.css';
import './scss/App.scss';

import Header from './components/Header';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';

import mainRoutes from './routes';

import {
  loadOrganisationsType,
  loadOrganisations,
  loadEventsType,
  loadPeopleType,
  loadResourcesType,
  loadGenericStats,
  loadPeopleSources,
} from './redux/actions';

const CookiesConsent = lazy(() => import('./components/Cookies.consent'));

function App() {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (loading) {
      setLoading(false);
      loadProgressBar();
      dispatch(loadOrganisationsType());
      dispatch(loadOrganisations());
      dispatch(loadEventsType());
      dispatch(loadPeopleType());
      dispatch(loadResourcesType());
      dispatch(loadGenericStats());
      dispatch(loadPeopleSources());
    }
  }, [dispatch, loading]);

  const routes = [];
  const { length } = mainRoutes;
  for (let i = 0; i < length; i += 1) {
    const route = mainRoutes[i];
    const { component = null, name = '', path = '' } = route;
    const CustomTag = component;
    let newRoute = null;
    if (component !== null) {
      newRoute = <Route path={path} key={i} element={<CustomTag />} />;
    }
    if (name === 'Home') {
      newRoute = <Route index path={path} key={i} element={<CustomTag />} />;
    }
    if (newRoute !== null) {
      routes.push(newRoute);
    }
  }

  return (
    <Router basename="/">
      <div className="app-body">
        <Header />
        <div className="content-container main-content-container">
          <Routes>{routes}</Routes>
        </div>
        <Footer />
      </div>
      <ScrollToTop />
      <Suspense fallback={[]}>
        <CookiesConsent />
      </Suspense>
    </Router>
  );
}

export default App;
