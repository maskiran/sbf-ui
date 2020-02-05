import React from 'react';
import axios from 'axios';
import { Layout } from 'antd';
import ServiceMenu from './service_menu';
import ServicePolicy from './service_policy';

class ServiceDetails extends React.Component {
    state = {
        service: {},
    }

    getService = () => {
        var url = "/api/service/" + this.props.match.params.name;
        axios.get(url).then((rsp) => {
            this.setState({ service: rsp.data });
        })
    }

    loadActionComponent = () => {
        switch (this.props.match.params.action) {
            case "policy": {
                return <ServicePolicy service={this.state.service}/>
            }
            case "audit": {
                return <div>Service Audit {this.state.service.name}</div>
            }
            case "logs": {
                return <div>Service Logs {this.state.service.name}</div>
            }
            default: {
                return <div>Service Home {this.state.service.name}</div>
            }
        }
    }

    componentDidMount() {
        this.getService();
    }

    render() {
        return (
            <Layout style={{ height: "calc(100vh - 64px)" }}>
                <Layout.Sider theme="light">
                    <ServiceMenu name={this.props.match.params.name}
                        action={this.props.match.params.action} />
                </Layout.Sider>
                <Layout.Content>{this.loadActionComponent()}</Layout.Content>
            </Layout>
        )
    }
}

export default ServiceDetails;