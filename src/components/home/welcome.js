import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {Link} from 'react-router-dom';

const APIPath = process.env.REACT_APP_APIPATH;

const About = props => {
  const [loading, setLoading] = useState(true);
  const [articles, setArticles] = useState([]);
  const [visibleIndex, setVisibleIndex] = useState(0);
  const [isActive, setIsActive] = useState(true);

  useEffect(()=> {
    const load = async() => {
      setLoading(false);
      let responseData = await axios({
        method: 'get',
        url: APIPath+'content-category',
        crossDomain: true,
        params: {permalink: 'welcome-filte-vale'}
      })
      .then(function (response) {
        return response.data.data;
      })
      .catch(function (error) {
      });
      setArticles(responseData.data.articles);
    }
    if (loading) {
      load();
    }
  },[loading]);

  useEffect(() => {
    let interval = null;
    if (isActive && articles.length>1) {
      interval = setInterval(() => {
        let length = articles.length;
        let index = visibleIndex+1;
        if (index>=length) {
          index = 0;
        }
        setVisibleIndex(index);
      }, 5000);
    } else if (!isActive) {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isActive, articles.length, visibleIndex]);

  const toggleActive = (value) => {
    setIsActive(value);
  }

  const updateVisibleIndex = (type) => {
    let length = articles.length;
    let prevIndex = visibleIndex-1;
    let nextIndex = visibleIndex+1;
    if (prevIndex<0) {
      prevIndex = length-1;
    }
    if (nextIndex>=length) {
      nextIndex = 0;
    }
    let index = 0;
    if (type==="prev") {
      index = prevIndex;
    }
    else {
      index = nextIndex;
    }
    setVisibleIndex(index);
  }

  let content = [];
  if (!loading && articles.length>0) {
    let articlePages = articles.map((article,i)=>{
      let visibleClass = "";
      if (i===visibleIndex) {
        visibleClass = "visible";
      }
      let title = article.label;
      let titleFirst = title.substring(0,1);
      let titleRest = title.substring(1);
      let articleBody = article.teaser;
      let logoImg = [];
      if (article.featuredImage!==null) {
        let imgSrc = article.featuredImageDetails.paths.find(p=>p.pathType==="source");
        if (typeof imgSrc!=="undefined") {
          logoImg = <div className="home-welcome-img">
            <img src={imgSrc.path} className="img-fluid img-thumbnail" alt={article.label} />
          </div>
        }
      }
      let articlePage = <div key={i} className={`home-welcome-block ${visibleClass}`}>
        <h3 className="section-title"><span><span>{titleFirst}</span>{titleRest}</span></h3>
        {logoImg}
        <div className="home-welcome-body text-justify" dangerouslySetInnerHTML={{__html: articleBody}}></div>
        <div className="text-center">
          <Link className="btn btn-default" href={`/article/${article.permalink}`} to={`/article/${article.permalink}`}>More</Link>
        </div>
      </div>
      return articlePage;
    });
    let articlePagination = [];
    if (articles.length>1) {
      articlePagination = <div className="home-welcome-pagination">
        <div className="pagination-action" onClick={()=>updateVisibleIndex("prev")}>
          <i className="fa fa-chevron-left" />
        </div>
        <div className="pagination-action" onClick={()=>updateVisibleIndex("next")}>
          <i className="fa fa-chevron-right" />
        </div>
      </div>
    };
    content = <div className="home-welcome" onMouseEnter={()=>toggleActive(false)} onMouseLeave={()=>toggleActive(true)}>
      {articlePages}
      {articlePagination}
    </div>
  }

  return (
    content
  );
}

export default About;
