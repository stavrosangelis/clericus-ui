import React, {
  useCallback,
  useState,
  useEffect,
  useRef,
  Suspense,
  lazy,
} from 'react';
import axios from 'axios';
import { Spinner, Card, CardBody } from 'reactstrap';
import { Link, useParams } from 'react-router-dom';
import { updateDocumentTitle } from '../helpers';
import LazyList from '../components/Lazylist';

const { REACT_APP_APIPATH: APIPath } = process.env;
const Breadcrumbs = lazy(() => import('../components/Breadcrumbs'));

function Search() {
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
  const { term } = useParams();

  const prevTerm = useRef(null);

  const loadData = useCallback(async () => {
    try {
      const responseData = await axios({
        method: 'post',
        url: `${APIPath}search`,
        crossDomain: true,
        data: { term },
      })
        .then((response) => response)
        .catch((error) => console.log(error));
      const { data = null } = responseData;
      return data;
    } catch (err) {
      return null;
    }
  }, [term]);

  useEffect(() => {
    let unmounted = false;
    const controller = new AbortController();
    const load = async () => {
      prevTerm.current = term;
      const responseData = await axios({
        method: 'post',
        url: `${APIPath}search`,
        crossDomain: true,
        data: { term },
        signal: controller.signal,
      })
        .then((response) => response.data)
        .catch((error) => console.log(error));
      if (!unmounted) {
        setLoading(false);
        setArticles([]);
        setClasspieces([]);
        setEvents([]);
        setOrganisations([]);
        setPeople([]);
        setResources([]);
        setSpatial([]);
        setTemporal([]);
        const { data = null } = responseData;
        if (data !== null) {
          setArticles(data.articles || []);
          setClasspieces(data.classpieces || []);
          setEvents(data.events || []);
          setOrganisations(data.organisations || []);
          setPeople(data.people || []);
          setResources(data.resources || []);
          setSpatial(data.spatial || []);
          setTemporal(data.temporal || []);
        }
      }
    };
    if (loading) {
      load();
    }
    return () => {
      unmounted = true;
      controller.abort();
    };
  }, [loading, loadData, term]);

  useEffect(() => {
    if (prevTerm.current === null) {
      prevTerm.current = term;
    }
    if (prevTerm.current !== term) {
      prevTerm.current = term;
      setLoading(true);
    }
  }, [term]);

  const breadcrumbsItems = [
    { label: 'Search', icon: 'fa fa-search', active: true, path: '' },
  ];
  updateDocumentTitle('Search');
  let content = (
    <div style={{ padding: '40pt', textAlign: 'center' }}>
      <i>searching ...</i> <Spinner color="info" />
    </div>
  );

  const renderRow = (item) => {
    const { _id = '', label = '', linkType = '', permalink = '' } = item;
    const link = linkType === 'article' ? permalink : _id;
    return (
      <Link href={`/${linkType}/${link}`} to={`/${linkType}/${link}`}>
        {label}
      </Link>
    );
  };

  if (!loading) {
    let articlesContent = null;
    let classpiecesContent = null;
    let eventsContent = null;
    let organisationsContent = null;
    let peopleContent = null;
    let resourcesContent = null;
    let spatialContent = null;
    let temporalContent = null;
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
                Search <small>&quot;{term}&quot;</small>
              </h2>
              {content}
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default Search;
