import React, { useState, useEffect, useRef, Suspense, lazy } from 'react';
import axios from 'axios';
import { Spinner, Card, CardBody } from 'reactstrap';
import { Link, useParams } from 'react-router-dom';
import { updateDocumentTitle } from '../helpers';

import '../scss/articles.scss';

const Breadcrumbs = lazy(() => import('../components/Breadcrumbs'));

const { REACT_APP_APIPATH: APIPath } = process.env;

function Articles() {
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState(null);
  const [articles, setArticles] = useState([]);

  const { permalink } = useParams();
  const prevPermalink = useRef(permalink);

  useEffect(() => {
    let unmounted = false;
    const controller = new AbortController();
    const load = async () => {
      prevPermalink.current = permalink;
      const params = { permalink };
      if (permalink === 'news' || permalink === 'archive') {
        params.orderField = 'createdAt';
        params.orderDesc = 'true';
      }
      const responseData = await axios({
        method: 'get',
        url: `${APIPath}content-category`,
        crossDomain: true,
        params,
        signal: controller.signal,
      })
        .then((response) => response.data)
        .catch((error) => console.log(error));
      if (!unmounted) {
        setLoading(false);
        const { data: respData = null } = responseData;
        const { data = null } = respData;
        if (data !== null) {
          setCategory(data.category);
          setArticles(data.articles);
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
  }, [loading, permalink, articles, category, prevPermalink]);

  useEffect(() => {
    if (!loading && prevPermalink.current !== permalink) {
      prevPermalink.current = permalink;
      setLoading(true);
      setArticles([]);
      setCategory(null);
    }
  }, [permalink, loading]);

  let breadcrumbsItems = [];

  function categoryChildrenHTML(categoryParam) {
    let output = [];
    if (
      typeof categoryParam.children_categories !== 'undefined' &&
      categoryParam.children_categories.length > 0
    ) {
      output = categoryParam.children_categories.map((i) => {
        let childOutput = categoryChildrenHTML(i);
        if (childOutput.length > 0) {
          childOutput = (
            <div className="category-children-categories-children">
              {childOutput}
            </div>
          );
        }
        return (
          <div key={i._id} className="category-children-categories-item">
            <Link
              href={`/article-category/${i.permalink}`}
              to={`/article-category/${i.permalink}`}
            >
              {i.label}
            </Link>
            {childOutput}
          </div>
        );
      });
    }
    return output;
  }

  let content = (
    <div>
      <div className="row">
        <div className="col-12">
          <div style={{ padding: '40pt', textAlign: 'center' }}>
            <Spinner type="grow" color="info" /> <i>loading...</i>
          </div>
        </div>
      </div>
    </div>
  );

  if (!loading && category !== null) {
    const categories = category.categories
      .filter((c) => c._id !== category._id)
      .map((c) => ({
        label: c.label,
        icon: '',
        active: false,
        path: `/article-category/${c.permalink}`,
      }));
    breadcrumbsItems = [...categories, ...breadcrumbsItems];
    breadcrumbsItems.push({
      label: category.label,
      icon: '',
      active: true,
      path: '',
    });
    const documentTitle = breadcrumbsItems.map((i) => i.label).join(' / ');
    updateDocumentTitle(documentTitle);
    const articlesHTML = articles.map((article) => {
      const featuredImage = article.featuredImageDetails;
      let thumbPath = null;
      if (featuredImage !== null) {
        thumbPath = featuredImage.paths.find(
          (p) => p.pathType === 'thumbnail'
        ).path;
      }
      const newDate = new Date(article.updatedAt);
      const y = newDate.getFullYear();
      let m = newDate.getMonth();
      if (m < 10) {
        m = `0${m}`;
      }
      let d = newDate.getDay();
      if (d < 10) {
        d = `0${d}`;
      }
      const date = `${y}-${m}-${d}`;
      let short = article.teaser;
      short = short.replace(/(<([^>]+)>)/gi, '');
      if (short.length > 200) {
        short = short.substring(0, 200);
        short = `${short}...`;
      }
      let thumbnail = [];
      if (thumbPath !== null) {
        thumbnail = (
          <div className="content-article-item-thumbnail">
            <Link
              href={`/article/${article.permalink}`}
              to={`/article/${article.permalink}`}
            >
              <img
                className="img-fluid article-list-thumbnail"
                alt={article.label}
                src={thumbPath}
              />
            </Link>
          </div>
        );
      }
      return (
        <div className="content-article-item" key={article._id}>
          {thumbnail}
          <div className="content-article-item-content">
            <h4>
              <Link
                href={`/article/${article.permalink}`}
                to={`/article/${article.permalink}`}
              >
                {article.label}
              </Link>
            </h4>
            <div className="article-date">
              <i className="pe-7s-user" /> {article.author}{' '}
              <i className="pe-7s-clock" /> {date}
            </div>
            {short}
          </div>
        </div>
      );
    });
    let col1Class = '';
    let col2 = [];
    if (category.children_categories.length > 0) {
      col1Class = 'col-sm-8';
      const categoryChildrenCategoriesHTML = categoryChildrenHTML(category);
      col2 = (
        <div className="col-12 col-sm-4">
          <div className="category-children-categories-container">
            {categoryChildrenCategoriesHTML}
          </div>
        </div>
      );
    }
    content = (
      <div>
        <div className="row">
          <div className="col-12">
            <Card>
              <CardBody>
                <h3>{category.label}</h3>
                <div className="row">
                  <div className={`col-12 ${col1Class}`}>{articlesHTML}</div>
                  {col2}
                </div>
              </CardBody>
            </Card>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="container">
      <Suspense fallback={[]}>
        <Breadcrumbs items={breadcrumbsItems} />
      </Suspense>
      {content}
    </div>
  );
}

export default Articles;
