import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardBody } from 'reactstrap';
import Breadcrumbs from '../components/breadcrumbs';

import { updateDocumentTitle } from '../helpers';

const NotFound = () => {
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
      <Breadcrumbs items={breadcrumbsItems} />
      {content}
    </div>
  );
};

export default NotFound;
