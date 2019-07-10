import Home from '../views/home';
import People from '../views/people';
import Person from '../views/person';

var routes = [
  {
    path: "/",
    component: Home,
    name: "Home",
  },
  {
    path: "/browse",
    component: People,
    name: "Browse",
  },
  {
    path: "/person/:_id",
    component: Person,
    name: "Person",
  },
];
export default routes;
