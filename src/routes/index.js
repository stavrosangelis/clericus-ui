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
import Resource from '../views/resource';
import Resources from '../views/resources';

// visualisations
import Heatmap from '../views/visualisations/heatmap';
import GraphNetwork from '../views/visualisations/graph-network';
import Timeline from '../views/visualisations/timeline';
import ItemTimeline from '../views/visualisations/item-timeline';

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
    path: "/resources",
    component: Resources,
    name: "Resources",
  },
  {
    path: "/resource/:_id",
    component: Resource,
    name: "Resource",
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
  {
    path: "/timeline/",
    component: Timeline,
    name: "Events timeline",
  },
  {
    path: "/item-timeline/:type/:_id",
    component: ItemTimeline,
    name: "Item timeline",
  },
];
export default routes;
