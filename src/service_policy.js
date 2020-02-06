import React from 'react';
import axios from 'axios';
import qs from 'query-string';
import { Table, Input, Button, Select, Modal, Form } from 'antd';

class ServicePolicy extends React.Component {
    constructor(props) {
        super(props);
        // parse the search query params and assign to the state
        var queryParams = qs.parse(props.location.search);
        // name is update when the user presses 'enter' on the search
        // box. searchValue maintains the current value (as being typed)
        // in the search box
        this.state = {
            rules: {},
            searchValue: queryParams.name || null,
            addRuleFormVisible: false,
        }
        this.defaultPage = 1;
        this.defaultPageSize = 25;
        this.searchParams = {
            name: queryParams.name || null,
            page: queryParams.page || this.defaultPage,
            page_size: queryParams.page_size || this.defaultPageSize
        }
    }

    columns = [
        {
            title: 'Idx',
            key: 'idx',
            render: (text, record, index) => {
                return (this.state.rules.start_idx + index + 1)
            }
        },
        {
            title: 'Name',
            dataIndex: 'name',
        },
        {
            title: 'Source',
            dataIndex: 'source',
        },
        {
            title: 'Action',
            dataIndex: 'action'
        },
        {
            title: 'Log',
            dataIndex: 'log'
        }
    ]

    handlePagerClick = (page, pageSize) => {
        this.searchParams.page = page;
        this.searchParams.page_size = pageSize;
        this.changeBrowserUrl();
    }

    handleSearchOnSearch = (val) => {
        if (val === "") val = null;
        this.searchParams.name = val;
        // reset the page number for a new search
        this.searchParams.page = 1;
        this.changeBrowserUrl();
    }

    handleInputChange = (varName, value) => {
        this.setState({ [varName]: value });
    }

    createAddRuleForm = () => {
        const Option = Select.Option;
        return (
            <Form colon={false} labelCol={{ span: 6 }} wrapperCol={{ span: 18 }}>
                <Form.Item label="Rule Name">
                    <Input placeholder="Rule1" name="newRuleName"
                        value={this.state.newRuleName}
                        onChange={(e) => this.handleInputChange(e.target.name, e.target.value)} />
                </Form.Item>
                <Form.Item label="Source Address">
                    <Input placeholder="addr1" name="newRuleSource"
                        value={this.state.newRuleSource}
                        onChange={(e) => this.handleInputChange(e.target.name, e.target.value)} />
                </Form.Item>
                <Form.Item label="Action">
                    <Select value={this.state.newRuleAction}
                        onChange={(val) => this.handleInputChange('newRuleAction', val)}>
                        <Option value="ALLOW">Allow</Option>
                        <Option value="DROP">Drop</Option>
                    </Select>
                </Form.Item>
                <Form.Item label="Log">
                    <Select value={this.state.newRuleLog}
                        onChange={(val) => this.handleInputChange('newRuleLog', val)}>
                        <Option value="LOG">Log</Option>
                        <Option value="NOLOG">No Log</Option>
                    </Select>
                </Form.Item>
            </Form>
        )
    }

    showAddRuleForm = () => {
        this.setState({ addRuleFormVisible: true })
    }

    addRule = () => {
        var data = {
            name: this.state.newRuleName,
            action: this.state.newRuleAction,
            log: this.state.newRuleLog,
            source: this.state.newRuleSource
        }
        var url = "/api/rules";
        axios.post(url, data).then((rsp) => {
            this.getRules();
            this.setState({addRuleFormVisible: false});
        })
    }

    makeBrowserUrl = () => {
        var args = { ...this.searchParams };
        if (args.page === this.defaultPage) {
            delete args.page
        }
        if (args.page_size === this.defaultPageSize) {
            delete args.page_size
        }
        var params = qs.stringify(args, { skipNull: true });
        var url = this.props.location.pathname;
        if (params) {
            url += "?" + params;
        }
        return url
    }

    changeBrowserUrl = () => {
        var url = this.makeBrowserUrl()
        this.props.history.push(url);
    }

    getRules = () => {
        var url = "/api/rules?" + qs.stringify(this.searchParams, { skipNull: true });
        axios.get(url).then((rsp) => {
            this.setState({ rules: rsp.data });
        })
    }

    componentDidMount() {
        this.getRules();
    }

    componentDidUpdate(prevProps, prevState) {
        var oldUrl = prevProps.location.pathname + prevProps.location.search;
        var newUrl = this.makeBrowserUrl();
        if (newUrl !== oldUrl) {
            this.getRules();
        }
    }

    render() {
        return (
            <div>
                <Modal visible={this.state.addRuleFormVisible} title="Add Rule"
                    width={"40%"}
                    onCancel={() => this.setState({ addRuleFormVisible: false })}
                    onOk={this.addRule}>
                    {this.createAddRuleForm()}
                </Modal>
                <div style={{ marginBottom: "10px" }}>
                    <Button style={{ float: "left" }} type="primary"
                        onClick={this.showAddRuleForm}>Add Rule</Button>
                    <Input.Search style={{ float: "right", width: "25%" }}
                        name="searchValue"
                        value={this.state.searchValue}
                        onSearch={this.handleSearchOnSearch}
                        onChange={(e) => this.handleInputChange(e.target.name, e.target.value)} />
                    <div style={{ clear: "both" }} />
                </div>
                <Table dataSource={this.state.rules.items}
                    columns={this.columns} size="middle" bordered
                    rowKey="name"
                    pagination={{
                        pageSize: this.state.rules.page_size || 10,
                        total: this.state.rules.count,
                        current: this.state.rules.page,
                        onChange: this.handlePagerClick
                    }} />
            </div>
        )
    }
}

export default ServicePolicy;