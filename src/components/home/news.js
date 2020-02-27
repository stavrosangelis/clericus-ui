import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link} from 'react-router-dom';

const APIPath = process.env.REACT_APP_APIPATH;

const About = props => {
  const [loading, setLoading] = useState(true);
  const [articles, setArticles] = useState([]);

  useEffect(()=> {
    const load = async() => {
      setLoading(false);
      let params = {
        categoryName: 'News',
        page: 1,
        limit: 6
      }
      let responseData = await axios({
        method: 'get',
        url: APIPath+'articles',
        crossDomain: true,
        params: params
      })
      .then(function (response) {
        return response.data.data;
      })
      .catch(function (error) {
      });
      setArticles(responseData.data);
    }
    if (loading) {
      load();
    }
  },[loading]);

  let content = [];
  let length = articles.length;
  if (!loading && length>0) {
    let item1 = null;
    let items = [];
    for (let i=0;i<length; i++) {
      let article = articles[i];
      let thumbPath = [];
      let featuredImage = article.featuredImageDetails;
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
      if (i===0) {
        item1 = <div className="news-item">
          <div className="news-item-image">
            <Link href={`article/${article.permalink}`} to={`article/${article.permalink}`}><img className="img-fluid" alt={article.label} src={thumbPath} /></Link>
          </div>
          <div className="news-item-details">
            <h4><Link href={`article/${article.permalink}`} to={`article/${article.permalink}`}>{article.label}</Link></h4>
            <div className="news-item-date"><i className="pe-7s-clock" /> {date}</div>
            <div className="news-item-teaser" dangerouslySetInnerHTML={{__html: article.teaser}}></div>
          </div>
        </div>
      }
      else {
        let item = <div className="news-item-small" key={i}>
          <Link href={`article/${article.permalink}`} to={`article/${article.permalink}`}><span className="news-item-image" style={{backgroundImage: `url("${thumbPath}")`}}></span></Link>
          <div className="news-item-details">
            <h4><Link href={`article/${article.permalink}`} to={`article/${article.permalink}`}>{article.label}</Link></h4>
            <div className="news-item-date"><i className="pe-7s-clock" /> {date}</div>
          </div>
        </div>;
        items.push(item);
      }
    }
    content = <div>
      <h4 className="section-title"><span><span>N</span>ews</span></h4>
      <div className="row">
        <div className="col-12 col-sm-6">{item1}</div>
        <div className="col-12 col-sm-6">{items}</div>
      </div>
    </div>
  }
  return(
    <div className="row">
      <div className="col-12">
        {content}
      </div>
    </div>
  );
}

export default About;
