import Home from '../views/Home';
import Article from '../views/Article';
import Articles from '../views/Articles';
import Classpieces from '../views/Classpieces';
import Classpiece from '../views/Classpiece';
import ContactForm from '../views/Contact.form';
import GenericSearch from '../views/Generic.search';
import NotFound from '../views/404';
import People from '../views/People';
import Person from '../views/Person';
import ItemGraph from '../views/visualisations/Item.graph';
import Event from '../views/Event';
import Events from '../views/Events';
import Organisation from '../views/Organisation';
import Organisations from '../views/Organisations';
import Temporal from '../views/Temporal';
import Temporals from '../views/Temporals';
import Spatial from '../views/Spatial';
import Spatials from '../views/Spatials';
import Resource from '../views/Resource';
import Resources from '../views/Resources';

// visualisations
import Heatmap from '../views/visualisations/Heatmap';
import GraphNetwork from '../views/visualisations/Graph.network';
import Timeline from '../views/visualisations/Timeline';
import ItemTimeline from '../views/visualisations/Item.timeline';

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
    path: '/contact/',
    component: ContactForm,
    name: 'contact',
  },
  {
    path: '/search/',
    component: GenericSearch,
    name: 'generic search',
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
    path: '/item-graph/:type/:_id',
    component: ItemGraph,
    name: 'Item graph',
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
    path: '*',
    component: NotFound,
    name: 'Not Found',
  },
];
export default routes;
