import React, { Component } from 'react';
import { Form, Input, Select } from 'antd';
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
            policyProfiles: [],
            editorValues: props.editorValues,
        }
    }

    componentDidMount() {
        this.getWAFProfiles();
        this.getTLSProfiles();
        this.getPolicyProfiles();
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

    getPolicyProfiles = () => {
        var url = '/api/policy-profiles?page_size=-1';
        axios.get(url).then((rsp) => {
            this.setState({ policyProfiles: rsp.data.items })
        })
    }

    handleInputChange = (varName, value) => {
        var data = this.state.editorValues;
        if (varName === "proxy_port") {
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
        var policyProfiles = this.state.policyProfiles.map(item => {
            return <Select.Option value={item.name} key={item.name}>{item.name}</Select.Option>
        })
        return (
            <Form colon={false} labelCol={{ span: 6 }} wrapperCol={{ span: 18 }}>
                <Form.Item label="Proxy Port">
                    <Input placeholder="443"
                        value={this.state.editorValues.proxy_port}
                        onChange={(e) => this.handleInputChange('proxy_port', e.target.value)} />
                </Form.Item>
                <Form.Item label="Policy Profile">
                    <Select value={this.state.editorValues.proxy_policy_profile} showSearch
                        onChange={(val) => this.handleInputChange('proxy_policy_profile', val)}>
                        <Select.Option value="">None</Select.Option>
                        {policyProfiles}
                    </Select>
                </Form.Item>
                <Form.Item label="TLS Profile">
                    <Select value={this.state.editorValues.proxy_tls_profile} showSearch
                        onChange={(val) => this.handleInputChange('proxy_tls_profile', val)}>
                        <Select.Option value="">None</Select.Option>
                        {tlsProfiles}
                    </Select>
                </Form.Item>
                <Form.Item label="WAF Profile">
                    <Select value={this.state.editorValues.proxy_waf_profile} showSearch
                        onChange={(val) => this.handleInputChange('proxy_waf_profile', val)}>
                        <Select.Option value="">None</Select.Option>
                        {wafProfiles}
                    </Select>
                </Form.Item>
            </Form>
        )
    }

    render() {
        return this.renderEditForm()
    }
}

export default ServiceEditForm;