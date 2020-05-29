import Home from '../views/home';
import Article from '../views/article';
import Articles from '../views/articles';
import Classpieces from '../views/classpieces';
import Classpiece from '../views/classpiece';
import ClasspieceGraph from '../views/visualisations/classpiece-graph';
import GenericSearch from '../views/generic-search';
import People from '../views/people';
import Person from '../views/person';
import PersonGraph from '../views/visualisations/person-graph';
import Event from '../views/event';
import Events from '../views/events';
import Organisation from '../views/organisation';
import Organisations from '../views/organisations';
import Spatial from '../views/spatial';

// visualisations
import Heatmap from '../views/visualisations/heatmap';
import GraphNetwork from '../views/visualisations/graph-network';

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
    path: "/classpiece-graph/:_id",
    component: ClasspieceGraph,
    name: "classpiece graph",
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
  {
    path: "/person-graph/:_id",
    component: PersonGraph,
    name: "Person graph",
  },
  {
    path: "/events",
    component: Events,
    name: "Events",
  },
  {
    path: "/event/:_id",
    component: Event,
    name: "Event",
  },
  {
    path: "/organisations",
    component: Organisations,
    name: "Organisations",
  },
  {
    path: "/organisation/:_id",
    component: Organisation,
    name: "Organisation",
  },
  {
    path: "/spatial/:_id",
    component: Spatial,
    name: "Spatial",
  },
  {
    path: "/heatmap/",
    component: Heatmap,
    name: "Heatmap",
  },
  {
    path: "/network-graph/",
    component: GraphNetwork,
    name: "Graph network",
  },
];
export default routes;
