import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import {
  Spinner,
  Card, CardBody,
} from 'reactstrap';
import {Breadcrumbs} from '../components/breadcrumbs';
import {updateDocumentTitle} from '../helpers';
import {Link} from 'react-router-dom';

import '../scss/articles.scss';

const APIPath = process.env.REACT_APP_APIPATH;

const Articles = props => {
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState(null);
  const [articles, setArticles] = useState([]);
  const prevPermalink = useRef(props.match.params.permalink);

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
        url: APIPath+'content-category',
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
        setCategory(responseData.data.data.category);
        setArticles(responseData.data.data.articles);
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
  },[loading,props.match.params.permalink, articles, category, prevPermalink]);


  let breadcrumbsItems = [];

  function categoryChildrenHTML(category) {
    let output = [];
    if (typeof category.children_categories!=="undefined" && category.children_categories.length>0) {
      output = category.children_categories.map(i=>{
        let childOutput = categoryChildrenHTML(i);
        if (childOutput.length>0) {
          childOutput = <div className="category-children-categories-children">{childOutput}</div>
        }
        return <div key={i._id} className="category-children-categories-item">
          <Link href={`/article-category/${i.permalink}`} to={`/article-category/${i.permalink}`}>{i.label}</Link>
          {childOutput}
        </div>
      });
    }
    return output;
  }

  let content = <div>
      <div className="row">
        <div className="col-12">
          <div style={{padding: '40pt',textAlign: 'center'}}>
            <Spinner type="grow" color="info" /> <i>loading...</i>
          </div>
        </div>
      </div>
    </div>

  if (!loading && category!==null) {
    let categories = category.categories.filter(c=>c._id!==category._id).map(c=> {
      return {label: c.label, icon: "", active: false, path: `/article-category/${c.permalink}`}
    });
    breadcrumbsItems = [...categories, ...breadcrumbsItems];
    breadcrumbsItems.push({label: category.label, icon: "", active: true, path: ""});
    let documentTitle = breadcrumbsItems.map(i=>i.label).join(" / ");
    updateDocumentTitle(documentTitle);
    let articlesHTML = articles.map(article=>{
      let featuredImage = article.featuredImageDetails;
      let thumbPath = null;
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
      let short = article.teaser;
      short = short.replace(/(<([^>]+)>)/ig,"");
      if (short.length>200) {
        short = short.substring(0,200);
        short = `${short}...`;
      }
      let thumbnail = [];
      if (thumbPath!==null) {
        thumbnail = <div className="content-article-item-thumbnail">
          <Link href={`/article/${article.permalink}`} to={`/article/${article.permalink}`}><img className="img-fluid article-list-thumbnail" alt={article.label} src={thumbPath} /></Link>
        </div>
      }
      return <div className="content-article-item" key={article._id}>
        {thumbnail}
        <div className="content-article-item-content">
          <h4><Link href={`/article/${article.permalink}`} to={`/article/${article.permalink}`}>{article.label}</Link></h4>
          <div className="news-item-date"><i className="pe-7s-user" /> {article.author} <i className="pe-7s-clock" /> {date}</div>
          {short}
        </div>
      </div>
    });
    let col1Class = "";
    let col2 = [];
    if (category.children_categories.length>0) {
      col1Class = "col-sm-8";
      let categoryChildrenCategoriesHTML = categoryChildrenHTML(category);
      col2 = <div className="col-12 col-sm-4">
        <div className="category-children-categories-container">{categoryChildrenCategoriesHTML}</div>
      </div>
    }
    content = <div>
        <div className="row">
          <div className="col-12">
            <Card>
              <CardBody>
                <h3>{category.label}</h3>
                <div className="row">
                  <div className={`col-12 ${col1Class}`}>
                    {articlesHTML}
                  </div>
                  {col2}
                </div>
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

export default Articles;
