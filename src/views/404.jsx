import React, { Suspense, lazy } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardBody } from 'reactstrap';

import { updateDocumentTitle } from '../helpers';

const Breadcrumbs = lazy(() => import('../components/Breadcrumbs'));

function NotFound() {
  const heading = 'Error 404 page not found';
  updateDocumentTitle(heading);
  const breadcrumbsItems = [
    { label: heading, icon: 'pe-7s-close', active: true, path: '' },
  ];
  const content = (
    <div className="row">
      <div className="col-12">
        <Card>
          <CardBody>
            <h3>The requested page does not exist.</h3>
            <p> </p>
            <p>
              If you entered a web address directly to the address bar please
              check it was correct.
            </p>
            <p>
              You can go back to the homepage by following this{' '}
              <Link to="/" href="/">
                link
              </Link>
              .
            </p>
          </CardBody>
        </Card>
      </div>
    </div>
  );

  return (
    <div className="container">
      <Suspense fallback={[]}>
        <Breadcrumbs items={breadcrumbsItems} />
      </Suspense>
      {content}
    </div>
  );
}

export default NotFound;
