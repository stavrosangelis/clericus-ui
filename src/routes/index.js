import Home from '../views/home';
import Classpieces from '../views/classpieces';
import Classpiece from '../views/classpiece';
import People from '../views/people';
import Person from '../views/person';

var routes = [
  {
    path: "/",
    component: Home,
    name: "Home",
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
