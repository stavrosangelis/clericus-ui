import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import dompurify from 'dompurify';

const APIPath = process.env.REACT_APP_APIPATH;

const About = () => {
  const [loading, setLoading] = useState(true);
  const [article, setArticle] = useState(null);

  useEffect(() => {
    const cancelToken = axios.CancelToken;
    const source = cancelToken.source();

    const load = async () => {
      const responseData = await axios({
        method: 'get',
        url: `${APIPath}content-article`,
        crossDomain: true,
        params: { permalink: 'about' },
        cancelToken: source.token,
      })
        .then((response) => response.data)
        .catch((error) => console.log(error));
      if (typeof responseData !== 'undefined') {
        setArticle(responseData.data);
        setLoading(false);
      }
    };
    if (loading) {
      load();
    }
    return () => {
      source.cancel('api request cancelled');
    };
  }, [loading]);

  let content = [];
  if (!loading && article !== null) {
    const sanitizer = dompurify.sanitize;
    const title = article.label;
    const titleFirst = title.substring(0, 1);
    const titleRest = title.substring(1);
    let logoImg = [];
    if (article.featuredImage !== null) {
      const imgSrc = article.featuredImageDetails.paths.find(
        (p) => p.pathType === 'source'
      );
      if (typeof imgSrc !== 'undefined') {
        logoImg = (
          <img
            src={imgSrc.path}
            className="home-about-logo"
            alt="Clericus logo"
          />
        );
      }
    }
    content = (
      <div>
        <h3 className="section-title">
          <span>
            <span>{titleFirst}</span>
            {titleRest}
          </span>
        </h3>
        {logoImg}
        <div
          className="text-justify"
          dangerouslySetInnerHTML={{ __html: sanitizer(article.teaser) }}
        />
        <div className="text-center">
          <Link
            className="btn btn-default"
            href="/article/about"
            to="/article/about"
            title={title}
          >
            <span className="hidden">{title}</span>
            <span aria-hidden="true" focusable="false">
              More
            </span>
          </Link>
        </div>
      </div>
    );
  }

  return <div style={{ padding: '0 15px' }}>{content}</div>;
};

export default About;
