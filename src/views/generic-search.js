import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import {
  Spinner,
  Card, CardBody,
} from 'reactstrap';
import {Breadcrumbs} from '../components/breadcrumbs';
import { Link } from 'react-router-dom';
import {updateDocumentTitle} from '../helpers';
import LazyList from '../components/lazylist';

const APIPath = process.env.REACT_APP_APIPATH;

const Search = props => {
  const [loading, setLoading] = useState(true);
  const [articles, setArticles] = useState([]);
  const [classpieces, setClasspieces] = useState([]);
  const [events, setEvents] = useState([]);
  const [organisations, setOrganisations] = useState([]);
  const [people, setPeople] = useState([]);
  const [resources, setResources] = useState([]);
  const [spatial, setSpatial] = useState([]);
  const [temporal, setTemporal] = useState([]);
  const prevTerm = useRef(props.match.params.term)

  useEffect(()=> {
    const cancelToken = axios.CancelToken;
    const source = cancelToken.source();

    let term = props.match.params.term;
    if (prevTerm.current!==term) {
      prevTerm.current = term;
      setLoading(true)
    }
    const load = async() => {
      let responseData = await axios({
        method: 'post',
        url: APIPath+'search',
        crossDomain: true,
        data: {term: term},
        cancelToken: source.token
      })
      .then(function (response) {
        return response.data;
      })
      .catch(function (error) {
      });
      if (typeof responseData!=="undefined") {
       if (responseData.status) {
          let data = responseData.data
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
    }
    if (loading) {
      load();
    }
    return () => {
      source.cancel("api request cancelled");
    };
  },[loading,props.match.params.term]);


  let breadcrumbsItems = [{label: "Search", icon: "fa fa-search", active: true, path: ""}];
  updateDocumentTitle("Search");
  let content = <div style={{padding: '40pt',textAlign: 'center'}}>
    <Spinner type="grow" color="info" /> <i>loading...</i>
  </div>
  const renderRow = (item) => {
    let link = item._id;
    if (item.linkType==="article") {
      link = item.permalink
    }
    return <Link href={`/${item.linkType}/${link}`} to={`/${item.linkType}/${link}`}>{item.label}</Link>;
  }

  if (!loading) {
    let articlesContent = [];
    let classpiecesContent = [];
    let eventsContent = [];
    let organisationsContent = [];
    let peopleContent = [];
    let resourcesContent = [];
    let spatialContent = [];
    let temporalContent = [];
    if (articles.length>0) {
      let articlesList = articles.map(a=>{
        a.linkType="article";
        return a;
      });
      articlesContent = <div className="col-12 col-sm-6">
        <h4>Articles <small>({articles.length})</small></h4>
        <LazyList
          limit={30}
          range={15}
          items={articlesList}
          renderItem={renderRow}
          containerClass="search-results"
          ordered={true}
          />
      </div>
    }
    if (classpieces.length>0) {
      let classpiecesList = classpieces.map(c=>{
        c.linkType="classpiece";
        return c;
      })
      classpiecesContent = <div className="col-12 col-sm-6">
        <h4>Classpieces <small>({classpieces.length})</small></h4>
        <LazyList
          limit={30}
          range={15}
          items={classpiecesList}
          renderItem={renderRow}
          containerClass="search-results"
          ordered={true}
          />
      </div>
    }
    if (events.length>0) {
      let eventsList = events.map(e=>{
        e.linkType="event";
        return e;
      })
      eventsContent = <div className="col-12 col-sm-6">
        <h4>Events <small>({events.length})</small></h4>
        <LazyList
          limit={30}
          range={15}
          items={eventsList}
          renderItem={renderRow}
          containerClass="search-results"
          ordered={true}
          />
      </div>
    }
    if (organisations.length>0) {
      let organisationsList = organisations.map(o=>{
        o.linkType="organisation";
        return o;
      })
      organisationsContent = <div className="col-12 col-sm-6">
        <h4>Organisations <small>({organisations.length})</small></h4>
        <LazyList
          limit={30}
          range={15}
          items={organisationsList}
          renderItem={renderRow}
          containerClass="search-results"
          ordered={true}
          />
      </div>
    }
    if (people.length>0) {
      let peopleList = people.map(p=>{
        p.linkType="person";
        return p;
      })
      peopleContent = <div className="col-12 col-sm-6">
        <h4>People <small>({people.length})</small></h4>
        <LazyList
          limit={30}
          range={15}
          items={peopleList}
          renderItem={renderRow}
          containerClass="search-results"
          ordered={true}
          />
      </div>
    }
    if (resources.length>0) {
      let resourcesList = resources.map(r=>{
        r.linkType="resource";
        return r;
      })
      resourcesContent = <div className="col-12 col-sm-6">
        <h4>Resources <small>({resources.length})</small></h4>
        <LazyList
          limit={30}
          range={15}
          items={resourcesList}
          renderItem={renderRow}
          containerClass="search-results"
          ordered={true}
          />
      </div>
    }
    if (spatial.length>0) {
      let spatialList = spatial.map(s=>{
        s.linkType="spatial";
        return s;
      })
      spatialContent = <div className="col-12 col-sm-6">
        <h4>Spatial <small>({spatial.length})</small></h4>
        <LazyList
          limit={30}
          range={15}
          items={spatialList}
          renderItem={renderRow}
          containerClass="search-results"
          ordered={true}
          />
      </div>
    }
    if (temporal.length>0) {
      let temporalList = temporal.map(t=>{
        t.linkType="temporal";
        return t;
      })
      temporalContent = <div className="col-12 col-sm-6">
        <h4>Temporal <small>({temporal.length})</small></h4>
        <LazyList
          limit={30}
          range={15}
          items={temporalList}
          renderItem={renderRow}
          containerClass="search-results"
          ordered={true}
          />
      </div>
    }
    content = <div className="row">
      {articlesContent}
      {classpiecesContent}
      {eventsContent}
      {organisationsContent}
      {peopleContent}
      {resourcesContent}
      {spatialContent}
      {temporalContent}
    </div>;
  }

  return (
    <div className="container">
      <Breadcrumbs items={breadcrumbsItems} />
      <div className="row">
        <div className="col-12">
          <Card>
            <CardBody>
              <h2>Search <small>"{props.match.params.term}"</small></h2>
              {content}
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default Search;
