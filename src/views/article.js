import React, { useState, useEffect,useRef } from 'react';
import axios from 'axios';
import {
  Spinner,
  Card, CardBody,
} from 'reactstrap';
import {Breadcrumbs} from '../components/breadcrumbs';
import {updateDocumentTitle} from '../helpers';
import { useSelector } from "react-redux";

import '../scss/article.scss';

const APIPath = process.env.REACT_APP_APIPATH;

const Article = props => {
  const [loading, setLoading] = useState(true);
  const [article, setArticle] = useState(null);
  const prevPermalink = useRef(props.match.params.permalink);
  const genericStats = useSelector(state => state.genericStats);
  const [articleContent, setArticleContent] = useState(null);
  const prevGenericStats = useRef(null);

  useEffect(()=> {
    const cancelToken = axios.CancelToken;
    const source = cancelToken.source();

    let permalink = props.match.params.permalink;
    if (prevPermalink.current!==permalink) {
      prevPermalink.current = permalink;
      setLoading(true)
    }
    const load = async() => {
      setLoading(false);
      let responseData = await axios({
        method: 'get',
        url: APIPath+'content-article',
        crossDomain: true,
        params: {permalink: permalink},
        cancelToken: source.token
      })
      .then(function (response) {
        return response.data;
      })
      .catch(function (error) {
      });
      if (typeof responseData!=="undefined" && responseData.status) {
        let newArticle = responseData.data;
        setArticle(newArticle);
        setArticleContent(newArticle.content);
      }
    }
    if (loading) {
      load();
    }
    return () => {
      if(!loading) {
        source.cancel("api request cancelled");
      }
    };
  },[loading,props.match.params.permalink]);

  useEffect(()=>{
    const updateArticleContent = () => {
      let newArticleContent = articleContent;
      let regex = /%(.*?)%/gm;
      let replaceStats = newArticleContent.match(regex);
      if (replaceStats!==null && replaceStats.length>0) {
        for (let key in replaceStats) {
          let stat = replaceStats[key];
          let statElem = stat.replace(/%/g,"");
          let value = genericStats[statElem];
          let regex = new RegExp(`${stat}`);
          newArticleContent = newArticleContent.replace(regex, value);
        }
      }
      setArticleContent(newArticleContent);
    }
    if (articleContent!==null && prevGenericStats!==genericStats && genericStats.people>0) {
      updateArticleContent();
      prevGenericStats.current = genericStats;
    }
  },[articleContent,genericStats]);

  let breadcrumbsItems = [];

  let content = <div>
      <div className="row">
        <div className="col-12">
          <div style={{padding: '40pt',textAlign: 'center'}}>
            <Spinner type="grow" color="info" /> <i>loading...</i>
          </div>
        </div>
      </div>
    </div>

  if (!loading && article!==null) {
    updateDocumentTitle(article.label);
    let categories = article.categories.map(c=> {
      return {label: c.label, icon: "", active: false, path: `/article-category/${c.permalink}`}
    });
    breadcrumbsItems = [...categories, ...breadcrumbsItems];
    breadcrumbsItems.push({label: article.label, icon: "pe-7s-newspaper", active: true, path: ""});
    let featuredImage = article.featuredImageDetails;
    let thumbnail = [];
    if (featuredImage!==null) {
      let thumbPath = featuredImage.paths.find(p=>p.pathType==="thumbnail").path;
      thumbnail = <img className="img-fluid article-thumbnail" alt={article.label} src={thumbPath} />;
    }
    let newDate = new Date(article.updatedAt);
    let y = newDate.getFullYear();
    let m = newDate.getMonth();
    if (m<10) {
      m = `0${m}`;
    }
    let d = newDate.getDay();
    if (d<10) {
      d = `0${d}`;
    }
    let date = `${y}-${m}-${d}`;
    content = <div>
        <div className="row">
          <div className="col-12">
            <Card>
              <CardBody>
                <h3>{article.label}</h3>
                <div className="article-date"><i className="pe-7s-user" /> {article.author} <i className="pe-7s-clock" /> {date}</div>
                {thumbnail}
                <div className="article-content" dangerouslySetInnerHTML={{__html: articleContent}}></div>
              </CardBody>
            </Card>
          </div>
        </div>
      </div>
  }
  return (
    <div className="container">
      <Breadcrumbs items={breadcrumbsItems} />
      {content}
    </div>
  )
}

export default Article;
