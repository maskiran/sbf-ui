import React, { Component } from 'react';
import { Form, Input, Select, Icon, Row, Col, Button } from 'antd';
import axios from 'axios';

class ServiceEditForm extends Component {
    // props:
    // editorValues (dict)
    // onChange (function called with dict of new editor values)
    // createMode (true or false, makes the service name field editable or not)
    constructor(props) {
        super(props);
        this.state = {
            wafProfiles: [],
            tlsProfiles: [],
            editorValues: props.editorValues,
        }
    }

    getWAFProfiles = () => {
        var url = '/api/waf-profiles?page_size=-1';
        axios.get(url).then((rsp) => {
            this.setState({ wafProfiles: rsp.data.items })
        })
    }

    getTLSProfiles = () => {
        var url = '/api/tls-profiles?page_size=-1';
        axios.get(url).then((rsp) => {
            this.setState({ tlsProfiles: rsp.data.items })
        })
    }

    handleInputChange = (varName, value) => {
        var data = this.state.editorValues;
        if (varName === "listen_port") {
            data[varName] = parseInt(value);
        } else {
            data[varName] = value;
        }
        this.setState({ editorValues: data })
        this.props.onChange(data);
    }

    renderEditForm = () => {
        var wafProfiles = this.state.wafProfiles.map(item => {
            return <Select.Option value={item.name} key={item.name}>{item.name}</Select.Option>
        })
        var tlsProfiles = this.state.tlsProfiles.map(item => {
            return <Select.Option value={item.name} key={item.name}>{item.name}</Select.Option>
        })
        return (
            <Form colon={false} labelCol={{ span: 6 }} wrapperCol={{ span: 14 }}>
                <Form.Item label="Service Name">
                    <Row gutter={16}>
                        <Col span={22}>
                            {this.props.createMode ?
                                <Input placeholder="service1"
                                    value={this.state.editorValues.name}
                                    onChange={(e) => this.handleInputChange('name', e.target.value)} />
                                :
                                this.state.editorValues.name
                            }
                        </Col>
                    </Row>
                </Form.Item>
                <Form.Item label="Listen Port">
                    <Row gutter={16}>
                        <Col span={22}>
                            <Input placeholder="443"
                                value={this.state.editorValues.listen_port}
                                onChange={(e) => this.handleInputChange('listen_port', e.target.value)} />
                        </Col>
                    </Row>
                </Form.Item>
                <Form.Item label="Target">
                    <Row gutter={16}>
                        <Col span={22}>
                            <Input placeholder="http://loadbalancer-name.app.com or ip address"
                                value={this.state.editorValues.target}
                                onChange={(e) => this.handleInputChange('target', e.target.value)} />
                        </Col>
                    </Row>
                </Form.Item>
                <Form.Item label="WAF Profile">
                    <Row gutter={16}>
                        <Col span={22}>
                            <Select value={this.state.editorValues.waf_profile} showSearch
                                onChange={(val) => this.handleInputChange('waf_profile', val)}>
                                <Select.Option value="">None</Select.Option>
                                {wafProfiles}
                            </Select>
                        </Col>
                        <Col span={2}>
                            <Button type="link" onClick={this.getWAFProfiles}>
                                <Icon type='reload' />
                            </Button>
                        </Col>
                    </Row>
                </Form.Item>
                <Form.Item label="TLS Profile">
                    <Row gutter={16}>
                        <Col span={22}>
                            <Select value={this.state.editorValues.tls_profile} showSearch
                                onChange={(val) => this.handleInputChange('tls_profile', val)}>
                                <Select.Option value="">None</Select.Option>
                                {tlsProfiles}
                            </Select>
                        </Col>
                        <Col span={2}>
                            <Button type="link" onClick={this.getTLSProfiles}>
                                <Icon type='reload' />
                            </Button>
                        </Col>
                    </Row>
                </Form.Item>
            </Form>
        )
    }

    componentDidMount() {
        this.getWAFProfiles();
        this.getTLSProfiles();
    }

    render() {
        return this.renderEditForm()
    }
}

export default ServiceEditForm;