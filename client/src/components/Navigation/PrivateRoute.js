import React from "react";
import { Router, Switch, Route } from "react-router-dom";
import Home from '../Home';
import SignIn from '../SignIn';
import Landing from '../Landing';
import Reviews from '../Reviews';
import history from './history';
import Search from "../Search";
import MyPage from "../MyPage";

export default function PrivateRoute({

}) {
  return (

    <Router history={history}>
      <Switch>
      <Route path="/Home" exact component={Home} />
      <Route path="/SignIn" exact component={SignIn} />
      <Route path="/" exact component={Landing} />
      <Route path="/Reviews" exact component={Reviews} />
      <Route path="/Search" exact component={Search} />
      <Route path="/actors" exact component={MyPage} />
      </Switch>
    </Router>
  );
}