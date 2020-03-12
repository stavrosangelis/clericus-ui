import Home from '../views/home';
import Article from '../views/article';
import Articles from '../views/articles';
import Classpieces from '../views/classpieces';
import Classpiece from '../views/classpiece';
import GenericSearch from '../views/generic-search';
import People from '../views/people';
import Person from '../views/person';

var routes = [
  {
    path: "/",
    component: Home,
    name: "Home",
  },
  {
    path: "/article/:permalink",
    component: Article,
    name: "article",
  },
  {
    path: "/article-category/:permalink",
    component: Articles,
    name: "article-category",
  },
  {
    path: "/classpieces",
    component: Classpieces,
    name: "classpieces",
  },
  {
    path: "/classpiece/:_id",
    component: Classpiece,
    name: "classpiece",
  },
  {
    path: "/search/:term",
    component: GenericSearch,
    name: "generic search",
  },
  {
    path: "/people",
    component: People,
    name: "people",
  },
  {
    path: "/person/:_id",
    component: Person,
    name: "Person",
  },
];
export default routes;
