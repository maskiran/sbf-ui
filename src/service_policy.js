import React from 'react';
import axios from 'axios';

class ServicePolicy extends React.Component {
    // props.service is a dict of the service details
    // with keys: name, id, listen_port, target
    // This component is mounted with empty props by the parent
    // and when the parent loads the service, it rerenders this component
    // so most of the logic here happens at componentDidUpdate
    state = {
        rules: []
    }

    getRules = () => {
        if (this.props.service.name) {
            var url = `/api/rules?service_id=${this.props.service.id}`;
            axios.get(url).then(rsp => {
                this.setState({rules: rsp.data})
            })
        }
    }

    componentDidMount() {
        this.getRules();
    }
    
    componentDidUpdate(prevProps) {
        if (this.props.service.name !== prevProps.service.name) {
            this.getRules()
        }
    }

    render() {
        return 'Rules for ' + this.props.service.name;
    }
}

export default ServicePolicy;