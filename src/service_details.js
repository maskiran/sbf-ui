import React from 'react';
import { Layout } from 'antd';
import ServiceSidebar from './service_sidebar';
import ServiceDashboard from './service_dashboard';

class ServiceDetails extends React.Component {
    getActionComponent = () => {
        var component;
        switch (this.props.match.params.action) {
            case "audit": {
                component = <div>Service Audit</div>
                break
            }
            case "logs": {
                component = <div>Service Logs</div>
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
                    <ServiceSidebar name={this.props.match.params.name}
                        action={this.props.match.params.action} />
                </Layout.Sider>
                <Layout.Content style={{padding: "20px 20px"}}>
                    {this.getActionComponent()}
                </Layout.Content>
            </Layout>
        )
    }
}

export default ServiceDetails;