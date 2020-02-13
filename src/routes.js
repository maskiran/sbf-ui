import React from 'react';
import { Switch, Route } from 'react-router-dom';
import Dashboard from './dashboard';
import ServiceList from './service_list';
import ServiceDetails from './service_details';
import Profile from './profiles';

const Routes = (
    <Switch>
        <Route exact path="/" component={Dashboard} />
        <Route exact path="/services" component={ServiceList} />
        <Route exact path="/service/:name/:action" component={ServiceDetails} />
        <Route exact path="/profiles/:type" component={Profile} />
        <Route exact path="/profiles/:type/:name" component={Profile} />
    </Switch>
)

export default Routes;