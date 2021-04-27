import Home from '../views/home';
import Article from '../views/article';
import Articles from '../views/articles';
import Classpieces from '../views/classpieces';
import Classpiece from '../views/classpiece';
import ClasspieceGraph from '../views/visualisations/classpiece-graph';
import ContactForm from '../views/contact-form';
import GenericSearch from '../views/generic-search';
import NotFound from '../views/404';
import People from '../views/people';
import Person from '../views/person';
import PersonGraph from '../views/visualisations/person-graph';
import Event from '../views/event';
import Events from '../views/events';
import EventGraph from '../views/visualisations/event-graph';
import Organisation from '../views/organisation';
import Organisations from '../views/organisations';
import OrganisationGraph from '../views/visualisations/organisation-graph';
import Temporal from '../views/temporal';
import Temporals from '../views/temporals';
import TemporalGraph from '../views/visualisations/temporal-graph';
import Spatial from '../views/spatial';
import Spatials from '../views/spatials';
import SpatialGraph from '../views/visualisations/spatial-graph';
import Resource from '../views/resource';
import Resources from '../views/resources';
import ResourceGraph from '../views/visualisations/resource-graph';

// visualisations
import Heatmap from '../views/visualisations/heatmap';
import GraphNetwork from '../views/visualisations/graph-network';
import Timeline from '../views/visualisations/timeline';
import ItemTimeline from '../views/visualisations/item-timeline';

const routes = [
  {
    path: '/',
    component: Home,
    name: 'Home',
  },
  {
    path: '/article/:permalink',
    component: Article,
    name: 'article',
  },
  {
    path: '/article-category/:permalink',
    component: Articles,
    name: 'article-category',
  },
  {
    path: '/classpieces',
    component: Classpieces,
    name: 'classpieces',
  },
  {
    path: '/classpiece/:_id',
    component: Classpiece,
    name: 'classpiece',
  },
  {
    path: '/classpiece-graph/:_id',
    component: ClasspieceGraph,
    name: 'classpiece graph',
  },
  {
    path: '/contact/',
    component: ContactForm,
    name: 'contact',
  },
  {
    path: '/search/:term',
    component: GenericSearch,
    name: 'generic search',
  },
  {
    path: '/people',
    component: People,
    name: 'people',
  },
  {
    path: '/person/:_id',
    component: Person,
    name: 'Person',
  },
  {
    path: '/person-graph/:_id',
    component: PersonGraph,
    name: 'Person graph',
  },
  {
    path: '/events',
    component: Events,
    name: 'Events',
  },
  {
    path: '/event/:_id',
    component: Event,
    name: 'Event',
  },
  {
    path: '/event-graph/:_id',
    component: EventGraph,
    name: 'Event Graph',
  },
  {
    path: '/organisations',
    component: Organisations,
    name: 'Organisations',
  },
  {
    path: '/organisation/:_id',
    component: Organisation,
    name: 'Organisation',
  },
  {
    path: '/organisation-graph/:_id',
    component: OrganisationGraph,
    name: 'Organisation Graph',
  },
  {
    path: '/temporals',
    component: Temporals,
    name: 'Temporals',
  },
  {
    path: '/temporal/:_id',
    component: Temporal,
    name: 'Temporal',
  },
  {
    path: '/temporal-graph/:_id',
    component: TemporalGraph,
    name: 'Temporal Graph',
  },
  {
    path: '/spatials',
    component: Spatials,
    name: 'Spatials',
  },
  {
    path: '/spatial/:_id',
    component: Spatial,
    name: 'Spatial',
  },
  {
    path: '/spatial-graph/:_id',
    component: SpatialGraph,
    name: 'Spatial Graph',
  },
  {
    path: '/resources',
    component: Resources,
    name: 'Resources',
  },
  {
    path: '/resource/:_id',
    component: Resource,
    name: 'Resource',
  },
  {
    path: '/resource-graph/:_id',
    component: ResourceGraph,
    name: 'Resource Graph',
  },
  {
    path: '/heatmap/',
    component: Heatmap,
    name: 'Heatmap',
  },
  {
    path: '/network-graph/',
    component: GraphNetwork,
    name: 'Graph network',
  },
  {
    path: '/timeline/',
    component: Timeline,
    name: 'Events timeline',
  },
  {
    path: '/item-timeline/:type/:_id',
    component: ItemTimeline,
    name: 'Item timeline',
  },
  {
    path: '/404',
    component: NotFound,
    name: 'Not Found',
  },
];
export default routes;
