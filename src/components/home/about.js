import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {Link} from 'react-router-dom';

const APIPath = process.env.REACT_APP_APIPATH;

const About = props => {
  const [loading, setLoading] = useState(true);
  const [article, setArticle] = useState(null);

  useEffect(()=> {
    const load = async() => {
      setLoading(false);
      let responseData = await axios({
        method: 'get',
        url: APIPath+'content-article',
        crossDomain: true,
        params: {permalink: 'about'}
      })
      .then(function (response) {
        return response.data;
      })
      .catch(function (error) {
      });
      setArticle(responseData.data);
    }
    if (loading) {
      load();
    }
  },[loading]);

  let content = [];
  if (!loading && article!==null) {
    let title = article.label;
    let titleFirst = title.substring(0,1);
    let titleRest = title.substring(1);
    let logoImg = [];
    if (article.featuredImage!==null) {
      let imgSrc = article.featuredImageDetails.paths.find(p=>p.pathType==="source");
      if (typeof imgSrc!=="undefined") {
        logoImg = <img src={imgSrc.path} className="home-about-logo" alt="Clericus logo" />
      }
    }
    content = <div>
      <h3 className="section-title"><span><span>{titleFirst}</span>{titleRest}</span></h3>
      {logoImg}
      <div className="text-justify" dangerouslySetInnerHTML={{__html: article.teaser}}></div>
      <div className="text-center">
        <Link className="btn btn-default" href={`/article/about`} to={`/article/about`}>More</Link>
      </div>
    </div>
  }

  return(
    <div style={{padding: "0 15px"}}>{content}</div>
  );
}

export default About;
