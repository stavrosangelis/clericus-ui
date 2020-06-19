import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import {
  Spinner,
  Card, CardBody,
} from 'reactstrap';
import {Breadcrumbs} from '../components/breadcrumbs';
import { Link } from 'react-router-dom';
import {updateDocumentTitle} from '../helpers/helpers';

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
    let term = props.match.params.term;
    if (prevTerm.current!==term) {
      prevTerm.current = term;
      setLoading(true)
    }
    const load = async() => {
      setLoading(false);
      let responseData = await axios({
        method: 'post',
        url: APIPath+'search',
        crossDomain: true,
        data: {term: term}
      })
      .then(function (response) {
        return response.data;
      })
      .catch(function (error) {
      });
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
    }
    if (loading) {
      load();
    }
  },[loading,props.match.params.term]);


  let breadcrumbsItems = [{label: "Search", icon: "fa fa-search", active: true, path: ""}];
  updateDocumentTitle("Search");
  let content = <div style={{padding: '40pt',textAlign: 'center'}}>
    <Spinner type="grow" color="info" /> <i>loading...</i>
  </div>
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
        return <li key={a._id}><Link href={`/article/${a.permalink}`} to={`/article/${a.permalink}`}>{a.label}</Link></li>;
      })
      articlesContent = <div className="col-12 col-sm-6">
        <h4>Articles <small>({articles.length})</small></h4>
        <ol className="search-results">
          {articlesList}
        </ol>
      </div>
    }
    if (classpieces.length>0) {
      let classpiecesList = classpieces.map(c=>{
        return <li key={c._id}><Link href={`/classpiece/${c._id}`} to={`/classpiece/${c._id}`}>{c.label}</Link></li>;
      })
      classpiecesContent = <div className="col-12 col-sm-6">
        <h4>Classpieces <small>({classpieces.length})</small></h4>
        <ol className="search-results">
          {classpiecesList}
        </ol>
      </div>
    }
    if (events.length>0) {
      let eventsList = events.map(e=>{
        return <li key={e._id}><Link href={`/event/${e._id}`} to={`/event/${e._id}`}>{e.label}</Link></li>;
      })
      eventsContent = <div className="col-12 col-sm-6">
        <h4>Events <small>({events.length})</small></h4>
        <ol className="search-results">
          {eventsList}
        </ol>
      </div>
    }
    if (organisations.length>0) {
      let organisationsList = organisations.map(o=>{
        return <li key={o._id}><Link href={`/organisation/${o._id}`} to={`/organisation/${o._id}`}>{o.label}</Link></li>;
      })
      organisationsContent = <div className="col-12 col-sm-6">
        <h4>Organisations <small>({organisations.length})</small></h4>
        <ol className="search-results">
          {organisationsList}
        </ol>
      </div>
    }
    if (people.length>0) {
      let peopleList = people.map(p=>{
        return <li key={p._id}><Link href={`/person/${p._id}`} to={`/person/${p._id}`}>{p.label}</Link></li>;
      })
      peopleContent = <div className="col-12 col-sm-6">
        <h4>People <small>({people.length})</small></h4>
        <ol className="search-results">
          {peopleList}
        </ol>
      </div>
    }
    if (resources.length>0) {
      let resourcesList = resources.map(r=>{
        return <li key={r._id}><Link href={`/resource/${r._id}`} to={`/resource/${r._id}`}>{r.label}</Link></li>;
      })
      resourcesContent = <div className="col-12 col-sm-6">
        <h4>Resources <small>({resources.length})</small></h4>
        <ol className="search-results">
          {resourcesList}
        </ol>
      </div>
    }
    if (spatial.length>0) {
      let spatialList = spatial.map(s=>{
        return <li key={s._id}><Link href={`/spatial/${s._id}`} to={`/spatial/${s._id}`}>{s.label}</Link></li>;
      })
      spatialContent = <div className="col-12 col-sm-6">
        <h4>Spatial <small>({spatial.length})</small></h4>
        <ol className="search-results">
          {spatialList}
        </ol>
      </div>
    }
    if (temporal.length>0) {
      let temporalList = temporal.map(t=>{
        return <li key={t._id}><Link href={`/temporal/${t._id}`} to={`/temporal/${t._id}`}>{t.label}</Link></li>;
      })
      temporalContent = <div className="col-12 col-sm-6">
        <h4>Temporal <small>({temporal.length})</small></h4>
        <ol className="search-results">
          {temporalList}
        </ol>
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
