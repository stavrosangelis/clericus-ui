import React, { useEffect, lazy, Suspense } from 'react';
import { updateDocumentTitle, renderLoader } from '../helpers';

const HomeSlider = lazy(() => import('../components/home/Carousel'));
const SectionNumbers = lazy(() => import('../components/home/Section.numbers'));
const About = lazy(() => import('../components/home/About'));
const HighLights = lazy(() => import('../components/home/Highlights'));
const News = lazy(() => import('../components/home/News'));
const Welcome = lazy(() => import('../components/home/Welcome'));
const Visualisations = lazy(() => import('../components/home/Visualisations'));

function Home() {
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
}

export default Home;
