import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Spinner } from 'reactstrap';
import axios from 'axios';
import { Link } from 'react-router-dom';

import { outputDate } from '../../../helpers';

const { REACT_APP_APIPATH: APIPath } = process.env;

const descriptionBlock = (description = '') => {
  if (description.trim() !== '') {
    return (
      <div>
        <i className="pe-7s-news-paper" /> {description}
      </div>
    );
  }
  return null;
};

const dateBlock = (dates = []) => {
  const { length } = dates;
  if (length > 0) {
    const temporalLabels = dates.map((t) => {
      const { _id = '', ref = null } = t;
      if (ref !== null) {
        const {
          label = '',
          startDate = '',
          endDate = '',
          _id: temporalId,
        } = ref;
        const tLabel = label !== '' ? ` ${label}` : null;
        let details = '';
        if (startDate !== '') {
          details += outputDate(startDate);
        }
        if (endDate !== '' && endDate !== startDate) {
          details += ` - ${outputDate(endDate)}`;
        }
        const tDetails = details !== '' ? ` [${details}]` : null;
        const icon =
          label !== '' && details !== '' ? <i className="pe-7s-date" /> : null;
        return (
          <div key={_id}>
            {icon}
            <Link to={`/temporal/${temporalId}`} target="_blank">
              {tLabel}
              {tDetails}
            </Link>
          </div>
        );
      }
      return null;
    });
    return <div>{temporalLabels}</div>;
  }
  return null;
};

const spatialBlock = (spatials = []) => {
  const { length } = spatials;
  if (length > 0) {
    const spatialLabels = spatials.map((s) => {
      const { ref = null } = s;
      if (ref !== null) {
        const { _id: spatialId, label } = ref;
        return (
          <Link key={spatialId} to={`/spatial/${spatialId}`} target="_blank">
            {label}
          </Link>
        );
      }
      return null;
    });
    if (spatialLabels.length > 0) {
      return (
        <div>
          <i className="pe-7s-map" /> {spatialLabels}
        </div>
      );
    }
  }
  return null;
};

export default function PopupContent(props) {
  const { _id } = props;
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  let content = (
    <div className="text-center popup-loader">
      <Spinner color="info" size="sm" /> <i>loading...</i>
    </div>
  );

  useEffect(() => {
    if (loading) {
      const load = async () => {
        const eventData = await axios({
          method: 'get',
          url: `${APIPath}ui-event`,
          crossDomain: true,
          params: { _id },
        })
          .then((response) => response.data)
          .catch((error) => console.log(error));
        const { data: newData = null } = eventData;
        setData(newData);
        setLoading(false);
      };
      load();
    }
  }, [_id, loading]);

  if (data !== null) {
    const {
      label = '',
      description = '',
      eventType = null,
      organisations = [],
      people = [],
      temporal = [],
      spatial = [],
    } = data;
    const itemType =
      eventType !== null && typeof eventType.label !== 'undefined' ? (
        <small>[{eventType.label}]</small>
      ) : null;
    const { length: tLength } = temporal;
    const { length: sLength } = spatial;
    const itemDescription = descriptionBlock(description);
    const itemTemporal = tLength > 0 ? dateBlock(temporal) : null;
    const itemSpatial = sLength > 0 ? spatialBlock(spatial) : null;

    const peopleOutput = people.map((p) => {
      const { _id: refId, ref, term } = p;

      const { label: termLabel = '' } = term;
      const refType = termLabel !== '' ? <i>{termLabel}</i> : null;
      const { label: personLabel = '', _id: personId, honorificPrefix } = ref;
      const refLabel =
        termLabel !== ''
          ? ` ${personLabel.replace('()', '')}`
          : personLabel.replace('()', '');
      let prefix = '';
      if (typeof honorificPrefix === 'string' && honorificPrefix !== '') {
        prefix = ` (${honorificPrefix})`;
      } else if (Array.isArray(honorificPrefix) && honorificPrefix.length > 0) {
        prefix = ` (${honorificPrefix.join(', ')})`;
      }
      return (
        <div key={refId}>
          <i className="pe-7s-users" />{' '}
          <Link to={`/person/${personId}`} target="_blank">
            {refType}
            {prefix}
            {refLabel}
          </Link>
        </div>
      );
    });
    const organisationsOutput = organisations.map((o) => {
      const { _id: refId, ref, term } = o;
      const { label: termLabel = '' } = term;
      const refType = termLabel !== '' ? <i>{termLabel}</i> : null;
      const {
        label: organisationLabel = '',
        organisationType,
        _id: organisationId,
      } = ref;
      const type = organisationType !== '' ? ` [${organisationType}]` : null;
      const refLabel =
        termLabel !== ''
          ? ` ${organisationLabel}${type}`
          : `${organisationLabel}${type}`;
      return (
        <div key={refId}>
          <i className="pe-7s-culture" />{' '}
          <Link to={`/organisation/${organisationId}`} target="_blank">
            {refType}
            {refLabel}
          </Link>
        </div>
      );
    });
    content = (
      <>
        <h5>
          {label} {itemType}
        </h5>
        <div className="popup-description">
          {itemDescription}
          {peopleOutput}
          {itemTemporal}
          {itemSpatial}
          {organisationsOutput}
        </div>
      </>
    );
  }
  return content;
}

PopupContent.propTypes = {
  _id: PropTypes.string.isRequired,
};
