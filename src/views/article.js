import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Spinner,
  Card, CardBody,
} from 'reactstrap';
import {Breadcrumbs} from '../components/breadcrumbs';

const APIPath = process.env.REACT_APP_APIPATH;

const Article = props => {
  const [loading, setLoading] = useState(true);
  const [article, setArticle] = useState(null);

  useEffect(()=> {
    const load = async() => {
      setLoading(false);
      let responseData = await axios({
        method: 'get',
        url: APIPath+'content-article',
        crossDomain: true,
        params: {permalink: props.match.params.permalink}
      })
      .then(function (response) {
        return response.data;
      })
      .catch(function (error) {
      });
      if (responseData.status) {
        setArticle(responseData.data);
      }
    }
    if (loading) {
      load();
    }
  },[loading,props.match.params.permalink]);


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
    let categories = article.categories.map(c=> {
      return {label: c.label, icon: "", active: false, path: `/article-category/${c.permalink}`}
    });
    breadcrumbsItems = [...categories, ...breadcrumbsItems];
    breadcrumbsItems.push({label: article.label, icon: "pe-7s-newspaper", active: true, path: ""});
    let featuredImage = article.featuredImageDetails;
    let thumbPath = [];
    if (featuredImage!==null) {
      thumbPath = featuredImage.paths.find(p=>p.pathType==="thumbnail").path;
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
                <div className="news-item-date"><i className="pe-7s-user" /> {article.author} <i className="pe-7s-clock" /> {date}</div>
                <img className="img-fluid article-thumbnail" alt={article.label} src={thumbPath} />
                <div dangerouslySetInnerHTML={{__html: article.content}}></div>
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
