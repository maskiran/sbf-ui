import React from 'react';
import { Table, Button, Modal } from 'antd';
import ServiceEditForm from './service_edit';
import axios from 'axios';

class ServiceDashboard extends React.Component {
    // props:
    // location, match etc passed over from the parent 'ServiceDetails'
    constructor(props) {
        super(props);
        this.state = {
            wafProfiles: [],
            tlsProfiles: [],
            editorVisible: false,
            editorValues: {},
            service: {},
        }
    }

    getService = () => {
        var url = "/api/service/" + this.props.match.params.name;
        axios.get(url).then((rsp) => {
            this.setState({
                service: rsp.data,
                editorValues: {...rsp.data},
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
        this.setState({editorValues: newValuesObj});
    }

    updateService = () => {
        var url = '/api/service/' + this.state.service.name;
        axios.put(url, this.state.editorValues).then(rsp => {
            this.getService();
            this.hideEditor();
        })
    }

    componentDidMount = () => {
        this.getService();
    }

    renderService() {
        // convert service object to list so it can be displayed as Table
        var columns = [
            {
                dataIndex: 'title',
                className: 'td-fit',
            },
            {
                dataIndex: 'value',
            }
        ]
        var data = [
            {
                title: 'Name',
                value: this.state.service.name
            },
            {
                title: 'Listen Port',
                value: this.state.service.listen_port
            },
            {
                title: 'Target',
                value: this.state.service.target
            },
            {
                title: 'WAF Profile',
                value: this.state.service.waf_profile
            },
            {
                title: 'TLS Profile',
                value: this.state.service.tls_profile
            },

        ];
        return (
            <div>
                <div>
                    <h3>Service {this.props.match.params.name}
                    <Button type="link" onClick={this.showEditor}>
                        Edit
                    </Button>
                    </h3>
                </div>
                <Modal visible={this.state.editorVisible} title="Add/Edit Service"
                    width={"40%"}
                    onCancel={this.hideEditor}
                    onOk={this.updateService}>
                    <ServiceEditForm editorValues={this.state.editorValues}
                        onChange={this.updateEditorValues} createMode={false}/>
                </Modal>
                <Table showHeader={false} columns={columns} dataSource={data}
                    pagination={false} bordered rowKey="title" />
            </div>
        )
    }

    render() {
        return this.renderService();
    }
}

export default ServiceDashboard;