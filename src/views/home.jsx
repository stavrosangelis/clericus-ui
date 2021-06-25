import React, { useEffect, lazy, Suspense } from 'react';
import { updateDocumentTitle, renderLoader } from '../helpers';

const HomeSlider = lazy(() => import('../components/home/carousel'));
const SectionNumbers = lazy(() => import('../components/home/section-numbers'));
const About = lazy(() => import('../components/home/about'));
const HighLights = lazy(() => import('../components/home/highlights'));
const News = lazy(() => import('../components/home/news'));
const Welcome = lazy(() => import('../components/home/welcome'));
const Visualisations = lazy(() => import('../components/home/visualisations'));

const Home = () => {
  useEffect(() => {
    updateDocumentTitle();
  }, []);

  return (
    <div className="container-fluid">
      <Suspense fallback={renderLoader()}>
        <HomeSlider />
      </Suspense>

      <Suspense fallback={renderLoader()}>
        <SectionNumbers />
      </Suspense>
      <section className="white-section">
        <div className="container">
          <div className="row">
            <div className="col-xs-12">
              <Suspense fallback={renderLoader()}>
                <About />
              </Suspense>
            </div>
            <div className="col-xs-12 col-md-5" />
          </div>
        </div>
      </section>
      <section>
        <div className="container">
          <div className="row">
            <div className="col-12">
              <Suspense fallback={renderLoader()}>
                <HighLights />
              </Suspense>
            </div>
          </div>
        </div>
      </section>
      <section className="white-section">
        <div className="container">
          <div className="row">
            <div className="col-12 col-md-7 col-lg-8">
              <Suspense fallback={renderLoader()}>
                <News />
              </Suspense>
            </div>
            <div className="col-12 col-md-5 col-lg-4">
              <Suspense fallback={renderLoader()}>
                <Welcome />
              </Suspense>
            </div>
          </div>
        </div>
      </section>
      <section>
        <div className="container">
          <div className="row">
            <div className="col-12">
              <Suspense fallback={renderLoader()}>
                <Visualisations />
              </Suspense>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
