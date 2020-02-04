import React from 'react';
import { Switch, Route } from 'react-router-dom';
import Dashboard from './dashboard';
import Service from './service';
import ServiceDetails from './service_details';

const Routes = (
    <Switch>
        <Route exact path="/" component={Dashboard} />
        <Route exact path="/services" component={Service} />
        <Route exact path="/service/:name" component={ServiceDetails} />
        <Route exact path="/service/:name/:action" component={ServiceDetails} />
    </Switch>
)

export default Routes;