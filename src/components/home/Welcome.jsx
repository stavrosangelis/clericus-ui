import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import dompurify from 'dompurify';

const { REACT_APP_APIPATH: APIPath } = process.env;

const Welcome = () => {
  const [loading, setLoading] = useState(true);
  const [articles, setArticles] = useState([]);
  const [visibleIndex, setVisibleIndex] = useState(0);
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    let unmounted = false;
    const controller = new AbortController();
    const load = async () => {
      const responseData = await axios({
        method: 'get',
        url: `${APIPath}content-category`,
        crossDomain: true,
        params: { permalink: 'welcome-filte-vale' },
        signal: controller.signal,
      })
        .then((response) => response.data)
        .catch((error) => console.log(error));
      if (!unmounted) {
        setLoading(false);
        const { data = null } = responseData;
        if (data !== null) {
          const { data: respData = null } = data;
          const { articles: newArticles = [] } = respData;
          setArticles(newArticles);
        }
      }
    };
    if (loading) {
      load();
    }
    return () => {
      unmounted = true;
      controller.abort();
    };
  }, [loading]);

  useEffect(() => {
    let interval = null;
    if (isActive && articles.length > 1) {
      interval = setInterval(() => {
        const { length } = articles;
        let index = visibleIndex + 1;
        if (index >= length) {
          index = 0;
        }
        setVisibleIndex(index);
      }, 5000);
    } else if (!isActive) {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isActive, articles, visibleIndex]);

  const toggleActive = (value) => {
    setIsActive(value);
  };

  const updateVisibleIndex = (type) => {
    const { length } = articles;
    let prevIndex = visibleIndex - 1;
    let nextIndex = visibleIndex + 1;
    if (prevIndex < 0) {
      prevIndex = length - 1;
    }
    if (nextIndex >= length) {
      nextIndex = 0;
    }
    let index = 0;
    if (type === 'prev') {
      index = prevIndex;
    } else {
      index = nextIndex;
    }
    setVisibleIndex(index);
  };

  let content = [];
  const firstCapital = (str) => {
    const words = str.split(' ');
    const output = words.map((w, i) => {
      const first = w.substring(0, 1);
      const rest = w.substring(1);
      const key = `a${i}`;
      const title = (
        <span key={key}>
          <span>{first}</span>
          {rest}
        </span>
      );
      return title;
    });
    return output;
  };
  if (!loading && articles.length > 0) {
    const sanitizer = dompurify.sanitize;
    const articlePages = articles.map((article, i) => {
      let visibleClass = '';
      if (i === visibleIndex) {
        visibleClass = 'visible';
      }
      const title = firstCapital(article.label);
      const articleBody = article.teaser;
      let logoImg = [];
      if (article.featuredImage !== null) {
        const imgSrc = article.featuredImageDetails.paths.find(
          (p) => p.pathType === 'source'
        );
        if (typeof imgSrc !== 'undefined') {
          logoImg = (
            <div className="home-welcome-img">
              <img
                src={imgSrc.path}
                className="img-fluid img-thumbnail"
                alt={article.label}
              />
            </div>
          );
        }
      }

      const key = `a${i}`;
      const articlePage = (
        <div key={key} className={`home-welcome-block ${visibleClass}`}>
          <h3 className="section-title">{title}</h3>
          {logoImg}
          <div
            className="home-welcome-body text-justify"
            dangerouslySetInnerHTML={{ __html: sanitizer(articleBody) }}
          />
          <div className="text-center">
            <Link
              className="btn btn-default"
              href={`/article/${article.permalink}`}
              to={`/article/${article.permalink}`}
              title={article.label}
            >
              <span className="hidden">{article.label}</span>
              <span aria-hidden="true" focusable="false">
                More
              </span>
            </Link>
          </div>
        </div>
      );
      return articlePage;
    });
    let articlePagination = [];
    if (articles.length > 1) {
      articlePagination = (
        <div className="home-welcome-pagination">
          <div
            className="pagination-action"
            onClick={() => updateVisibleIndex('prev')}
            onKeyDown={() => false}
            role="button"
            tabIndex={0}
            aria-label="show previous"
          >
            <i className="fa fa-chevron-left" />
          </div>
          <div
            className="pagination-action"
            onClick={() => updateVisibleIndex('next')}
            onKeyDown={() => false}
            role="button"
            tabIndex={0}
            aria-label="show next"
          >
            <i className="fa fa-chevron-right" />
          </div>
        </div>
      );
    }
    content = (
      <div
        className="home-welcome"
        onMouseEnter={() => toggleActive(false)}
        onMouseLeave={() => toggleActive(true)}
      >
        {articlePages}
        {articlePagination}
      </div>
    );
  }

  return content;
};

export default Welcome;
