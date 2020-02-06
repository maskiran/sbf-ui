import React from 'react';
import axios from 'axios';
import { Layout, Typography } from 'antd';
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
        var component;
        var title;
        switch (this.props.match.params.action) {
            case "policy": {
                component = <ServicePolicy service={this.state.service} {...this.props}/>;
                title = "Policy";
                break;
            }
            case "audit": {
                component = <div>Service Audit {this.state.service.name}</div>
                title = "Audit Logs";
                break
            }
            case "logs": {
                component = <div>Service Logs {this.state.service.name}</div>
                title = "Traffic Logs";
                break
            }
            default: {
                component = <div>Service Home {this.state.service.name}</div>
                title = "Home"
                break
            }
        }
        return (
        <div>
            <Typography.Title level={4}>Service {this.state.service.name} - {title}</Typography.Title>
            {component}
        </div>
        )
    }

    componentDidMount() {
        this.getService();
    }

    render() {
        return (
            <Layout style={{ height: "calc(100vh - 64px)" }}>
                <Layout.Sider theme="light" collapsible={true}>
                    <ServiceMenu name={this.props.match.params.name}
                        action={this.props.match.params.action} />
                </Layout.Sider>
                <Layout.Content style={{padding: "10px 20px"}}>
                    {this.loadActionComponent()}
                </Layout.Content>
            </Layout>
        )
    }
}

export default ServiceDetails;