import React from 'react';
import { Layout } from 'antd';
import ServiceMenu from './service_menu';
import ServiceDashboard from './service_dashboard';
import ServicePolicy from './service_policy';

class ServiceDetails extends React.Component {
    loadActionComponent = () => {
        var component;
        switch (this.props.match.params.action) {
            case "policy": {
                component = <ServicePolicy {...this.props}/>;
                break;
            }
            case "audit": {
                component = <div>Service Audit</div>
                break
            }
            case "logs": {
                component = <div>Service Logs</div>
                break
            }
            case "deployment": {
                component = <div>Service Deployment</div>
                break
            }
            default: {
                component = <ServiceDashboard {...this.props}/>;
                break
            }
        }
        return component
    }

    render() {
        return (
            <Layout style={{ height: "calc(100vh - 64px)" }}>
                <Layout.Sider theme="light" collapsible={true}>
                    <ServiceMenu name={this.props.match.params.name}
                        action={this.props.match.params.action} />
                </Layout.Sider>
                <Layout.Content style={{padding: "20px 20px"}}>
                    {this.loadActionComponent()}
                </Layout.Content>
            </Layout>
        )
    }
}

export default ServiceDetails;