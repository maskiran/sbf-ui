import React from 'react';
import { Button, Modal, Descriptions } from 'antd';
import ServiceEditForm from './service_edit';
import axios from 'axios';

class ServiceDashboard extends React.Component {
    // props:
    // location, match etc passed over from the parent 'ServiceDetails'
    constructor(props) {
        super(props);
        this.state = {
            editorVisible: false,
            editorValues: {},
            service: null,
        }
    }

    componentDidMount = () => {
        this.getService();
    }

    getService = () => {
        var url = "/api/service/" + this.props.match.params.name;
        axios.get(url).then((rsp) => {
            this.setState({
                service: rsp.data,
                editorValues: { ...rsp.data },
            });
        })
    }

    showEditor = () => {
        this.setState({ editorVisible: true })
    }

    hideEditor = () => {
        this.setState({ editorVisible: false })
    }

    updateEditorValues = (newValuesObj) => {
        this.setState({ editorValues: newValuesObj });
    }

    updateService = () => {
        var url = '/api/service/' + this.state.service.name;
        axios.put(url, this.state.editorValues).then(rsp => {
            this.getService();
            this.hideEditor();
        })
    }

    renderService = () => {
        if (!this.state.service) {
            return null;
        }
        var title = (
            <div>
                Service Details
                <Button type="link" onClick={this.showEditor}>
                    Edit Security Details
                </Button>
            </div>
        )
        return (
            <Descriptions title={title} bordered column={2} size="small">
                <Descriptions.Item label="Name">{this.state.service.name}</Descriptions.Item>
                <Descriptions.Item label="Proxy Port">{this.state.service.proxy_port}</Descriptions.Item>
                <Descriptions.Item label="Namespace">{this.state.service.namespace}</Descriptions.Item>
                <Descriptions.Item label="Policy Profile">{this.state.service.proxy_policy_profile}</Descriptions.Item>
                <Descriptions.Item label="Cluster IP">{this.state.service.cluster_ip}</Descriptions.Item>
                <Descriptions.Item label="TLS Profile">{this.state.service.proxy_tls_profile}</Descriptions.Item>
                <Descriptions.Item label="Ports">
                    {
                        this.state.service.ports.map((item, idx) => {
                            return <div key={idx}>{item.name}:{item.port}</div>
                        })
                    }
                </Descriptions.Item>
                <Descriptions.Item label="WAF Profile">{this.state.service.proxy_waf_profile}</Descriptions.Item>
                <Descriptions.Item label="Labels">
                    {
                        Object.keys(this.state.service.labels).map((key, idx) => {
                            return <div key={key}>{key}={this.state.service.labels[key]}</div>
                        })
                    }
                </Descriptions.Item>
                <Descriptions.Item></Descriptions.Item>
            </Descriptions>
        )
    }

    render() {
        return (
            <div>
                {this.renderService()}
                < Modal visible={this.state.editorVisible} title="Edit Service"
                    width={"40%"}
                    onCancel={this.hideEditor}
                    onOk={this.updateService} >
                    <ServiceEditForm editorValues={this.state.editorValues}
                        onChange={this.updateEditorValues} createMode={false} />
                </Modal >
            </div>
        )
    }
}

export default ServiceDashboard;