import React from 'react';
import axios from 'axios';
import qs from 'query-string';
import { Table, Input, Button, Select, Modal, Form, Icon, Row, Col } from 'antd';

class ServicePolicy extends React.Component {
    constructor(props) {
        // props
        // other props from the parent (location, match etc)
        super(props);
        var queryParams = qs.parse(props.location.search);
        this.state = {
            service: {},
            rules: {},
            ruleEditor: {},
            searchValue: queryParams.search || null,
            addRuleFormVisible: false,
            selectedRows: [],
        }
        this.defaultPage = 1;
        this.defaultPageSize = 25;
        this.searchParams = {
            search: queryParams.search || null,
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
            render: (text, record) => {
                return <Button onClick={() => this.editRule(record)} type="link">{text}</Button>
            }
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
        },
        {
            title: 'Added On',
            dataIndex: 'date_added',
            render: (text) => {
                return new Date(text).toLocaleString()
            }
        },
        {
            title: 'Modified On',
            dataIndex: 'date_modified',
            render: (text) => {
                return new Date(text).toLocaleString()
            }
        },
        {
            title: '',
            key: 'actions',
            render: (text, record) => {
                return (
                    <div>
                        <Button onClick={() => this.duplicateRule(record)} type="link">
                            <Icon type="copy" />
                        </Button>
                        <Button onClick={() => this.deleteRule(record)} type="link">
                            <Icon type="delete" />
                        </Button>
                    </div>
                )
            }
        }
    ]

    handlePagerClick = (page, pageSize) => {
        this.searchParams.page = page;
        this.searchParams.page_size = pageSize;
        this.changeBrowserUrl();
    }

    handleOnSearch = (val) => {
        if (val === "") val = null;
        this.searchParams.search = val;
        // reset the page number for a new search
        this.searchParams.page = 1;
        this.changeBrowserUrl();
    }

    handleInputChange = (varName, value) => {
        this.setState({ [varName]: value });
    }

    handleRuleEditorInputChange = (varName, value) => {
        var data = this.state.ruleEditor;
        data[varName] = value;
        this.setState({ ruleEditor: data })
    }

    handleRowSelection = (selectedKeys, records) => {
        this.setState({ selectedRows: selectedKeys })
    }

    createAddRuleForm = () => {
        const Option = Select.Option;
        return (
            <Form colon={false} labelCol={{ span: 6 }} wrapperCol={{ span: 18 }}>
                <Form.Item label="Rule Name">
                    <Input placeholder="Rule1" name="name"
                        value={this.state.ruleEditor.name}
                        onChange={(e) => this.handleRuleEditorInputChange(e.target.name, e.target.value)} />
                </Form.Item>
                <Form.Item label="Source Address">
                    <Input placeholder="addr1" name="source"
                        value={this.state.ruleEditor.source}
                        onChange={(e) => this.handleRuleEditorInputChange(e.target.name, e.target.value)} />
                </Form.Item>
                <Form.Item label="Action">
                    <Select value={this.state.ruleEditor.action} showSearch
                        onChange={(val) => this.handleRuleEditorInputChange('action', val)}>
                        <Option value="allow">Allow</Option>
                        <Option value="drop">Drop</Option>
                    </Select>
                </Form.Item>
                <Form.Item label="Log">
                    <Select value={this.state.ruleEditor.log} showSearch
                        onChange={(val) => this.handleRuleEditorInputChange('log', val)}>
                        <Option value="log">Log</Option>
                        <Option value="nolog">No Log</Option>
                    </Select>
                </Form.Item>
            </Form>
        )
    }

    showAddRuleForm = () => {
        this.setState({ addRuleFormVisible: true })
    }

    getRules = () => {
        if (!this.props.match.params.name) {
            return;
        }
        var url = "/api/service/" + this.props.match.params.name + "/rules?" + qs.stringify(this.searchParams, { skipNull: true });
        axios.get(url).then((rsp) => {
            this.setState({ rules: rsp.data });
        })
    }

    addRule = () => {
        var data = { ...this.state.ruleEditor };
        var url;
        if (this.state.ruleEditor.id) {
            // in existing rule remove all the implicit fields
            url = "/api/service/" + this.props.match.params.name + "/rule/" + this.state.ruleEditor.id;
            axios.put(url, data).then((rsp) => {
                this.getRules();
                this.setState({ addRuleFormVisible: false, ruleEditor: {} });
            })
        } else {
            url = "/api/service/" + this.props.match.params.name + "/rules";
            axios.post(url, data).then((rsp) => {
                this.getRules();
                this.setState({ addRuleFormVisible: false });
            })
        }
    }

    editRule = (record) => {
        var data = { ...record };
        this.setState({ ruleEditor: data });
        this.showAddRuleForm();
    }

    duplicateRule = (record) => {
        var keys = ['name', 'source', 'log', 'action'];
        var data = {};
        for (var key of keys) {
            data[key] = record[key]
        }
        this.setState({ ruleEditor: data });
        this.showAddRuleForm();
    }

    deleteRule = (record) => {
        var url;
        var promises = [];
        var promise;
        if (record.id) {
            // single record deletion
            url = "/api/service/" + this.props.match.params.name + "/rule/" + record.id;
            promise = axios.delete(url);
            promises.push(promise);
        } else {
            // multiple records deletion at this.state.selectedRows
            promises = this.state.selectedRows.map(id => {
                url = "/api/service/" + this.props.match.params.name + "/rule/" + id;
                promise = axios.delete(url);
                return promise
            })
            this.setState({selectedRows: []})
        }
        axios.all(promises).then(rsp => {
            this.getRules();
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

    componentDidMount() {
        this.getRules();
    }

    componentDidUpdate(prevProps, prevState) {
        var oldUrl = prevProps.location.pathname + prevProps.location.search;
        var newUrl = this.makeBrowserUrl();
        // either the url changed (pagination/search) or 
        // parent updated the component with new props
        if ((newUrl !== oldUrl) || (this.props.match.params.name !== prevProps.match.params.name)) {
            this.getRules();
        }
    }

    renderActionsRow = () => {
        return (
            <Row style={{ marginBottom: "10px" }}>
                <Col span={18}>
                    <Button style={{ float: "left" }} type="primary"
                        onClick={this.showAddRuleForm}>Add Rule</Button>
                    <Button type="danger" style={{ marginLeft: "10px" }}
                        onClick={this.deleteRule}
                        disabled={!this.state.selectedRows.length}>Delete</Button>
                </Col>
                <Col span={6}>
                    <Input.Search
                        name="searchValue"
                        value={this.state.searchValue}
                        onSearch={this.handleOnSearch}
                        onChange={(e) => this.handleInputChange(e.target.name, e.target.value)} />
                </Col>
            </Row>
        )
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
                {this.renderActionsRow()}
                <Table dataSource={this.state.rules.items}
                    columns={this.columns} size="middle" bordered
                    rowSelection={{
                        onChange: this.handleRowSelection
                    }}
                    rowKey="id"
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