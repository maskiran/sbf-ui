import React from 'react';
import axios from 'axios';
import { Layout } from 'antd';
import ServiceMenu from './service_menu';

class ServiceDetails extends React.Component {
    constructor(props) {
        super(props);
        console.log(this.props);
        this.state = {
            service: {},
        }
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
                console.log('get policy');
                break
            }
            case "audit": {
                console.log('audit');
                break
            }
            case "logs": {
                console.log('logs');
                break
            }
            default: {
                console.log('service home');
                this.getService()
            }
        }
    }

    componentDidMount() {
        this.loadActionComponent();
    }

    componentDidUpdate(prevProps) {
        if (prevProps.match.url !== this.props.match.url) {
            this.loadActionComponent();
        }
    }

    render() {
        return (
            <Layout style={{height: "calc(100vh - 64px)"}}>
                <Layout.Sider theme="light">
                    <ServiceMenu name={this.props.match.params.name}
                        action={this.props.match.params.action}/>
                </Layout.Sider>
                <Layout.Content>{this.state.service.name}</Layout.Content>
            </Layout>
        )
    }
}

export default ServiceDetails;