import React from 'react';
import axios from 'axios';
import qs from 'query-string';
import { Table, Input, Button, Modal, Form, Select, Icon, Row, Col } from 'antd';
import { Link } from 'react-router-dom';

class WAFProfilesList extends React.Component {
    constructor(props) {
        super(props);
        this.defaultPage = 1;
        this.defaultPageSize = 25;
        // sets search, page and page_size keys after reading from url args
        this.searchParams = {};
        this.parseAndSetSearchParams();
        this.state = {
            wafProfiles: {},
            wafRuleSetVersions: [],
            searchValue: this.searchParams.search,
            editorVisible: false,
            editorValues: {},
            selectedRows: [],
        }
    }

    parseAndSetSearchParams = () => {
        // from the url args (received via props), set searchParams.
        // this is used by paginator to update the values and triggers
        // the component update
        var queryParams = qs.parse(this.props.location.search);
        this.searchParams = {
            search: queryParams.search || null,
            page: queryParams.page || this.defaultPage,
            page_size: queryParams.page_size || this.defaultPageSize
        }
    }

    componentDidMount() {
        this.getWafProfiles();
        this.getWafRuleSetVersions();
    }

    componentDidUpdate(prevProps) {
        this.parseAndSetSearchParams();
        var oldUrl = prevProps.location.pathname + prevProps.location.search;
        var newUrl = this.makeBrowserUrl();
        if (newUrl !== oldUrl) {
            this.getWafProfiles();
        }
    }

    render() {
        return (
            <div>
                {this.renderActionsRow()}
                {this.renderItemsTable()}
                {this.renderEditorModal()}
            </div>
        )
    }

    renderActionsRow = () => {
        return (
            <Row style={{ marginBottom: "10px" }}>
                <Col span={18}>
                    <Button type="primary"
                        onClick={this.showEditor} icon="plus">
                        Add WAF Profile
                    </Button>
                    <Button type="danger" style={{ marginLeft: "10px" }}
                        onClick={this.deleteItem} icon="delete"
                        disabled={!this.state.selectedRows.length}>
                        Delete
                    </Button>
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

    renderItemsTable = () => {
        return (
            <Table dataSource={this.state.wafProfiles.items}
                columns={this.getTableColumns()} size="middle" bordered
                rowSelection={{
                    onChange: this.handleRowSelection
                }}
                rowKey="name"
                pagination={{
                    pageSize: this.state.wafProfiles.page_size || 10,
                    total: this.state.wafProfiles.count,
                    current: this.state.wafProfiles.page,
                    onChange: this.handlePagerClick
                }}
            />
        )
    }

    renderEditorModal = () => {
        return (
            <Modal visible={this.state.editorVisible} title="Add WAF Profile"
                width={"40%"}
                onCancel={this.hideEditor}
                onOk={this.addItem}>
                {this.createEditor()}
            </Modal>
        )
    }

    getTableColumns = () => {
        var columns = [
            {
                title: 'Idx',
                key: 'idx',
                render: (text, record, index) => {
                    return (this.state.wafProfiles.start_idx + index + 1)
                }
            },
            {
                title: 'Name',
                dataIndex: 'name',
                render: (text) => {
                    var url = "/profiles/waf/" + text;
                    return <Link to={url}>{text}</Link>
                }
            },
            {
                title: 'Rule Set Version',
                dataIndex: 'rule_set_version'
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
                            <Button onClick={() => this.duplicateItem(record)} type="link">
                                <Icon type="copy" />
                            </Button>
                            <Button onClick={() => this.deleteItem(record)} type="link">
                                <Icon type="delete" />
                            </Button>
                        </div>
                    )
                }
            }

        ]
        return columns;
    }

    createEditor = () => {
        var versions = this.state.wafRuleSetVersions.map(version => {
            return <Select.Option key={version}>{version}</Select.Option>
        })
        return (
            <Form colon={false} labelCol={{ span: 6 }} wrapperCol={{ span: 18 }}>
                <Form.Item label="WAF Profile Name">
                    <Input placeholder="waf1"
                        value={this.state.editorValues.name}
                        onChange={(e) => this.handleEditorInputChange('name', e.target.value)} />
                </Form.Item>
                <Form.Item label="Rule Set Version">
                    <Select value={this.state.editorValues.rule_set_version}
                        showSearch
                        onChange={(val) => this.handleEditorInputChange('rule_set_version', val)}>
                        {versions}
                    </Select>
                </Form.Item>
            </Form>
        )
    }

    addItem = () => {
        var data = { ...this.state.editorValues };
        var url = "/api/waf-profiles";
        axios.post(url, data).then((rsp) => {
            this.getWafProfiles();
            this.hideEditor();
        })
    }

    deleteItem = (record) => {
        var url;
        var promises = [];
        var promise;
        if (record.name) {
            // single record deletion
            url = "/api/waf-profile/" + record.name;;
            promise = axios.delete(url);
            promises.push(promise);
        } else {
            // multiple records deletion at this.state.selectedRows
            promises = this.state.selectedRows.map(name => {
                url = "/api/waf-profile/" + name;
                promise = axios.delete(url);
                return promise
            })
            this.setState({ selectedRows: [] })
        }
        axios.all(promises).then(rsp => {
            this.getWafProfiles();
        })
    }

    duplicateItem = (record) => {
        var keys = ['name', 'rule_set_version'];
        var data = {};
        for (var key of keys) {
            data[key] = record[key]
        }
        this.setState({ editorValues: data });
        this.showEditor();
    }

    getWafRuleSetVersions = () => {
        var url = '/api/waf-rule-sets/versions';
        axios.get(url).then(rsp => {
            this.setState({ wafRuleSetVersions: rsp.data })
        })
    }

    getWafProfiles = () => {
        var url = "/api/waf-profiles?" + qs.stringify(this.searchParams, { skipNull: true });
        axios.get(url).then((rsp) => {
            this.setState({ wafProfiles: rsp.data });
        })
    }

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

    handleInputChange = (e) => {
        this.setState({ [e.target.name]: e.target.value })
    }

    handleEditorInputChange = (varName, value) => {
        var data = {...this.state.editorValues};
        data[varName] = value;
        this.setState({ editorValues: data });
    }

    handleRowSelection = (selectedKeys, records) => {
        this.setState({ selectedRows: selectedKeys })
    }

    showEditor = () => {
        this.setState({ editorVisible: true })
    }

    hideEditor = () => {
        this.setState({ editorVisible: false })
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

}

export default WAFProfilesList;