import React,{Component} from 'react';
import { BrowserRouter as Router, Route, Switch} from 'react-router-dom';
import {loadProgressBar} from 'axios-progress-bar';
// css
import 'axios-progress-bar/dist/nprogress.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import './assets/fonts/roboto/css/roboto.css';
import './assets/fonts/helvetica-neue/style.css';
import './assets/fonts/font-awesome/css/font-awesome.min.css';
import "./assets/fonts/pe-icon-7/css/pe-icon-7-stroke.css";
import './App.scss';

import Topbar from './components/topbar';
import Header from './components/header';

import mainRoutes from "./routes/";

import {connect} from "react-redux";
import {
  loadOrganisations,
  loadEvents,
} from "./redux/actions";

function mapDispatchToProps(dispatch) {
  return {
    loadOrganisations: () => dispatch(loadOrganisations()),
    loadEvents: () => dispatch(loadEvents()),
  }
}

class App extends Component{

  componentDidMount() {
    loadProgressBar();
    this.props.loadOrganisations();
    this.props.loadEvents();
  }

  render() {
    let routes = [];
    for (let i=0; i<mainRoutes.length; i++) {
      let route = mainRoutes[i];
      let newRoute=[];
      if (route.component!==null) {
        newRoute = <Route path={route.path} key={i} component={route.component} />;
      }
      if (route.name==="Home") {
        newRoute = <Route exact path={route.path} key={i} component={route.component} />;
      }
      routes.push(newRoute);
    }
    return (
      <Router basename='/'>
        <div className="app-body">
          <Topbar />
          <Header />
          <div className="content-container" style={{paddingBottom: '0'}}>
            <Switch>
              {routes}
            </Switch>
          </div>
        </div>
      </Router>
    );
  }
}

export default App = connect(null, mapDispatchToProps)(App);
