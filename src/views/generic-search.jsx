import React, { useState, useEffect, useRef, Suspense, lazy } from 'react';
import axios from 'axios';
import { Spinner, Card, CardBody } from 'reactstrap';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { updateDocumentTitle } from '../helpers';
import LazyList from '../components/lazylist';

const APIPath = process.env.REACT_APP_APIPATH;
const Breadcrumbs = lazy(() => import('../components/breadcrumbs'));

const Search = (props) => {
  // state
  const [loading, setLoading] = useState(true);
  const [articles, setArticles] = useState([]);
  const [classpieces, setClasspieces] = useState([]);
  const [events, setEvents] = useState([]);
  const [organisations, setOrganisations] = useState([]);
  const [people, setPeople] = useState([]);
  const [resources, setResources] = useState([]);
  const [spatial, setSpatial] = useState([]);
  const [temporal, setTemporal] = useState([]);

  // props
  const { match } = props;
  const prevTerm = useRef(match.params.term);

  useEffect(() => {
    const cancelToken = axios.CancelToken;
    const source = cancelToken.source();

    const { term } = match.params;
    if (prevTerm.current !== term) {
      prevTerm.current = term;
      setLoading(true);
    }
    const load = async () => {
      const responseData = await axios({
        method: 'post',
        url: `${APIPath}search`,
        crossDomain: true,
        data: { term },
        cancelToken: source.token,
      })
        .then((response) => response.data)
        .catch((error) => console.log(error));
      if (typeof responseData !== 'undefined') {
        if (responseData.status) {
          const { data } = responseData;
          setArticles(data.articles);
          setClasspieces(data.classpieces);
          setEvents(data.events);
          setOrganisations(data.organisations);
          setPeople(data.people);
          setResources(data.resources);
          setSpatial(data.spatial);
          setTemporal(data.temporal);
        }
        setLoading(false);
      }
    };
    if (loading) {
      load();
    }
    return () => {
      source.cancel('api request cancelled');
    };
  }, [loading, match]);

  const breadcrumbsItems = [
    { label: 'Search', icon: 'fa fa-search', active: true, path: '' },
  ];
  updateDocumentTitle('Search');
  let content = (
    <div style={{ padding: '40pt', textAlign: 'center' }}>
      <Spinner type="grow" color="info" /> <i>loading...</i>
    </div>
  );
  const renderRow = (item) => {
    let link = item._id;
    if (item.linkType === 'article') {
      link = item.permalink;
    }
    return (
      <Link href={`/${item.linkType}/${link}`} to={`/${item.linkType}/${link}`}>
        {item.label}
      </Link>
    );
  };

  if (!loading) {
    let articlesContent = [];
    let classpiecesContent = [];
    let eventsContent = [];
    let organisationsContent = [];
    let peopleContent = [];
    let resourcesContent = [];
    let spatialContent = [];
    let temporalContent = [];
    if (articles.length > 0) {
      const articlesList = articles.map((aParam) => {
        const a = aParam;
        a.linkType = 'article';
        return a;
      });
      articlesContent = (
        <div className="col-12 col-sm-6">
          <h4>
            Articles <small>({articles.length})</small>
          </h4>
          <LazyList
            limit={30}
            range={15}
            items={articlesList}
            renderItem={renderRow}
            containerClass="search-results"
            ordered
          />
        </div>
      );
    }
    if (classpieces.length > 0) {
      const classpiecesList = classpieces.map((cParam) => {
        const c = cParam;
        c.linkType = 'classpiece';
        return c;
      });
      classpiecesContent = (
        <div className="col-12 col-sm-6">
          <h4>
            Classpieces <small>({classpieces.length})</small>
          </h4>
          <LazyList
            limit={30}
            range={15}
            items={classpiecesList}
            renderItem={renderRow}
            containerClass="search-results"
            ordered
          />
        </div>
      );
    }
    if (events.length > 0) {
      const eventsList = events.map((e) => {
        e.linkType = 'event';
        return e;
      });
      eventsContent = (
        <div className="col-12 col-sm-6">
          <h4>
            Events <small>({events.length})</small>
          </h4>
          <LazyList
            limit={30}
            range={15}
            items={eventsList}
            renderItem={renderRow}
            containerClass="search-results"
            ordered
          />
        </div>
      );
    }
    if (organisations.length > 0) {
      const organisationsList = organisations.map((oParam) => {
        const o = oParam;
        o.linkType = 'organisation';
        return o;
      });
      organisationsContent = (
        <div className="col-12 col-sm-6">
          <h4>
            Organisations <small>({organisations.length})</small>
          </h4>
          <LazyList
            limit={30}
            range={15}
            items={organisationsList}
            renderItem={renderRow}
            containerClass="search-results"
            ordered
          />
        </div>
      );
    }
    if (people.length > 0) {
      const peopleList = people.map((pParam) => {
        const p = pParam;
        p.linkType = 'person';
        return p;
      });
      peopleContent = (
        <div className="col-12 col-sm-6">
          <h4>
            People <small>({people.length})</small>
          </h4>
          <LazyList
            limit={30}
            range={15}
            items={peopleList}
            renderItem={renderRow}
            containerClass="search-results"
            ordered
          />
        </div>
      );
    }
    if (resources.length > 0) {
      const resourcesList = resources.map((rParam) => {
        const r = rParam;
        r.linkType = 'resource';
        return r;
      });
      resourcesContent = (
        <div className="col-12 col-sm-6">
          <h4>
            Resources <small>({resources.length})</small>
          </h4>
          <LazyList
            limit={30}
            range={15}
            items={resourcesList}
            renderItem={renderRow}
            containerClass="search-results"
            ordered
          />
        </div>
      );
    }
    if (spatial.length > 0) {
      const spatialList = spatial.map((sParam) => {
        const s = sParam;
        s.linkType = 'spatial';
        return s;
      });
      spatialContent = (
        <div className="col-12 col-sm-6">
          <h4>
            Spatial <small>({spatial.length})</small>
          </h4>
          <LazyList
            limit={30}
            range={15}
            items={spatialList}
            renderItem={renderRow}
            containerClass="search-results"
            ordered
          />
        </div>
      );
    }
    if (temporal.length > 0) {
      const temporalList = temporal.map((tParam) => {
        const t = tParam;
        t.linkType = 'temporal';
        return t;
      });
      temporalContent = (
        <div className="col-12 col-sm-6">
          <h4>
            Temporal <small>({temporal.length})</small>
          </h4>
          <LazyList
            limit={30}
            range={15}
            items={temporalList}
            renderItem={renderRow}
            containerClass="search-results"
            ordered
          />
        </div>
      );
    }
    content = (
      <div className="row">
        {articlesContent}
        {classpiecesContent}
        {eventsContent}
        {organisationsContent}
        {peopleContent}
        {resourcesContent}
        {spatialContent}
        {temporalContent}
      </div>
    );
  }

  return (
    <div className="container">
      <Suspense fallback={[]}>
        <Breadcrumbs items={breadcrumbsItems} />
      </Suspense>
      <div className="row">
        <div className="col-12">
          <Card>
            <CardBody>
              <h2>
                Search <small>&quot;{match.params.term}&quot;</small>
              </h2>
              {content}
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
};

Search.defaultProps = {
  match: null,
};
Search.propTypes = {
  match: PropTypes.object,
};

export default Search;
