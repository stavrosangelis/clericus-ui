import React, { useState, useEffect } from 'react';
import axios from 'axios';

const APIPath = process.env.REACT_APP_APIPATH;

const About = props => {
  const [loading, setLoading] = useState(true);
  const [article, setArticle] = useState(null);

  useEffect(()=> {
    const load = async() => {
      setLoading(false);
      let responseData = await axios({
        method: 'get',
        url: APIPath+'article',
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
  let img = [];
  if (!loading && article!==null) {
    content = <div>
      <h4 className="section-title"><span className="article-title" style={{color: "#c10230"}}>{article.label}</span></h4>
      <div dangerouslySetInnerHTML={{__html: article.teaser}}></div>
    </div>
    let thumbPath = [];
    let featuredImage = article.featuredImageDetails;
    if (featuredImage!==null) {
      thumbPath = featuredImage.paths.find(p=>p.pathType==="thumbnail").path;
    }
    img = <img className="img-fluid" alt={article.label} src={thumbPath} style={{marginTop: "15%"}}/>
  }
  return(
    <div className="row">
      <div className="col-xs-12 col-md-7 content-separator">
        {content}
      </div>
      <div className="col-xs-12 col-md-5">
        {img}
      </div>
    </div>
  );
}

export default About;
