import React, { Component, lazy, Suspense } from 'react';
import axios from 'axios';
import { Spinner, Card, CardBody } from 'reactstrap';
import PropTypes from 'prop-types';

import Breadcrumbs from '../components/breadcrumbs';
import { updateDocumentTitle, outputDate, renderLoader } from '../helpers';

const EventsBlock = lazy(() => import('../components/item-blocks/events'));

class Temporal extends Component {
  constructor(props) {
    super(props);

    this.state = {
      loading: true,
      item: null,
      eventsVisible: true,
      error: {
        visible: false,
        text: '',
      },
    };

    this.load = this.load.bind(this);
    this.toggleTable = this.toggleTable.bind(this);
    this.renderItem = this.renderItem.bind(this);
    this.renderTemporalDetails = this.renderTemporalDetails.bind(this);

    const cancelToken = axios.CancelToken;
    this.cancelSource = cancelToken.source();
  }

  componentDidMount() {
    this.load();
  }

  componentDidUpdate(prevProps) {
    const { match: prevMatch } = prevProps;
    const { _id: prevId } = prevMatch.params;
    const { match } = this.props;
    const { _id } = match.params;
    if (prevId !== _id) {
      this.load();
    }
  }

  componentWillUnmount() {
    this.cancelSource.cancel('api request cancelled');
  }

  async load() {
    const { match } = this.props;
    const { _id } = match.params;
    if (typeof _id === 'undefined' || _id === null || _id === '') {
      return false;
    }
    this.setState({
      loading: true,
    });
    const params = {
      _id,
    };
    const url = `${process.env.REACT_APP_APIPATH}ui-temporal`;
    const responseData = await axios({
      method: 'get',
      url,
      crossDomain: true,
      params,
      cancelToken: this.cancelSource.token,
    })
      .then((response) => response.data)
      .catch((error) => console.log(error));
    if (typeof responseData !== 'undefined') {
      if (responseData.status) {
        this.setState({
          loading: false,
          item: responseData.data,
        });
      } else {
        this.setState({
          loading: false,
          error: {
            visible: true,
            text: responseData.msg,
          },
        });
      }
    }
    return false;
  }

  toggleTable(e, dataType = null) {
    const { [`${dataType}Visible`]: value } = this.state;
    const payload = {
      [`${dataType}Visible`]: !value,
    };
    this.setState(payload);
  }

  renderTemporalDetails(stateData = null) {
    const { item } = stateData;
    const { eventsVisible } = this.state;
    // 1. TemporalDetails
    const meta = [];
    let eventsRow = [];
    let eventsHidden = '';
    let eventsVisibleClass = '';
    if (!eventsVisible) {
      eventsHidden = ' closed';
      eventsVisibleClass = 'hidden';
    }
    if (
      typeof item.events !== 'undefined' &&
      item.events !== null &&
      item.events !== ''
    ) {
      eventsRow = (
        <Suspense fallback={renderLoader()} key="events">
          <EventsBlock
            toggleTable={this.toggleTable}
            hidden={eventsHidden}
            visible={eventsVisibleClass}
            events={item.events}
          />
        </Suspense>
      );
    }

    // dates
    let datesRow = [];
    if (typeof item.startDate !== 'undefined' && item.startDate !== '') {
      let endDate = '';
      if (
        typeof item.endDate !== 'undefined' &&
        item.endDate !== '' &&
        item.endDate !== item.startDate
      ) {
        endDate = ` - ${outputDate(item.endDate, false)}`;
      }
      datesRow = (
        <div key="datesRow">
          <h5>Dates</h5>
          <div style={{ paddingBottom: '10px' }}>
            <span className="tag-bg tag-item">
              {outputDate(item.startDate, false)}
              {endDate}
            </span>
          </div>
        </div>
      );
    }

    meta.push(datesRow);
    meta.push(eventsRow);

    return meta;
  }

  renderItem(stateData = null) {
    const { item } = stateData;

    const { label } = item;

    const metaTable = this.renderTemporalDetails(stateData);

    const output = (
      <div className="item-container">
        <h3>{label}</h3>
        <div className="row">
          <div className="col-12">
            <div className="item-details-container">{metaTable}</div>
          </div>
        </div>
      </div>
    );
    return output;
  }

  render() {
    const { loading, item, error } = this.state;
    let content = (
      <div>
        <div className="row">
          <div className="col-12">
            <div style={{ padding: '40pt', textAlign: 'center' }}>
              <Spinner type="grow" color="info" /> <i>loading...</i>
            </div>
          </div>
        </div>
      </div>
    );

    let label = '';
    const breadcrumbsItems = [
      { label: 'Dates', icon: 'pe-7s-date', active: false, path: '/temporals' },
    ];
    if (!loading) {
      if (item !== null) {
        const temporalCard = this.renderItem(this.state);
        content = (
          <div>
            <Card>
              <CardBody>
                <div className="row">
                  <div className="col-12">{temporalCard}</div>
                </div>
              </CardBody>
            </Card>
          </div>
        );
        label = item.label;
        breadcrumbsItems.push({
          label,
          icon: 'pe-7s-date',
          active: true,
          path: '',
        });
        const documentTitle = breadcrumbsItems.map((i) => i.label).join(' / ');
        updateDocumentTitle(documentTitle);
      } else if (error.visible) {
        breadcrumbsItems.push({
          label: error.text,
          icon: 'fa fa-times',
          active: true,
          path: '',
        });
        const documentTitle = breadcrumbsItems.map((i) => i.label).join(' / ');
        updateDocumentTitle(documentTitle);
        content = (
          <div>
            <Card>
              <CardBody>
                <div className="row">
                  <div className="col-12">
                    <h3>Error</h3>
                    <p>{error.text}</p>
                  </div>
                </div>
              </CardBody>
            </Card>
          </div>
        );
      }
    }

    return (
      <div className="container">
        <Breadcrumbs items={breadcrumbsItems} />
        {content}
      </div>
    );
  }
}

Temporal.defaultProps = {
  match: null,
};
Temporal.propTypes = {
  match: PropTypes.object,
};

export default Temporal;
