import React from 'react';
import axios from 'axios';
import qs from 'query-string';
import { Table, Input, Button, Modal, Form, Select, Row, Col } from 'antd';

class ItemsList extends React.Component {
    constructor(props) {
        super(props);
        this.defaultPage = 1;
        this.defaultPageSize = 25;
        // sets search, page and page_size keys after reading from url args
        this.searchParams = {};
        this.parseAndSetSearchParams();
        this.state = {
            items: {},
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
        this.getItems();
    }

    componentDidUpdate(prevProps) {
        this.parseAndSetSearchParams();
        var oldUrl = prevProps.location.pathname + prevProps.location.search;
        var newUrl = this.makeBrowserUrl();
        if (newUrl !== oldUrl) {
            this.getItems();
        }
    }

    render() {
        return (
            <div style={this.props.style}>
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
                        {this.props.addButtonTitle}
                    </Button>
                    <Button type="danger" style={{ marginLeft: "10px" }}
                        onClick={this.deleteItem} icon="delete"
                        disabled={!this.state.selectedRows.length}>
                        Delete
                    </Button>
                </Col>
                <Col span={6}>
                    <Input.Search
                        value={this.state.searchValue}
                        onSearch={this.handleSearchOnSearch}
                        onChange={this.handleSearchOnChange} />
                </Col>
            </Row>
        )
    }

    renderItemsTable = () => {
        return (
            <Table dataSource={this.state.items.items}
                columns={this.getTableColumns()} size="middle" bordered
                rowSelection={{
                    onChange: this.handleRowSelection
                }}
                {...this.props.tableProps}
                rowKey={this.props.dataKey}
                pagination={{
                    pageSize: this.state.items.page_size || 10,
                    total: this.state.items.count,
                    current: this.state.items.page,
                    onChange: this.handlePagerClick
                }}
            />
        )
    }

    renderEditorModal = () => {
        return (
            <Modal visible={this.state.editorVisible} title={this.props.editorTitle}
                width={"40%"}
                onCancel={this.hideEditor}
                onOk={this.addItem}>
                {this.createEditor()}
            </Modal>
        )
    }

    getTableColumns = () => {
        // change this.props.columns by adding few base columns
        var idxCol = {
            title: 'Idx',
            key: 'idx',
            className: 'td-fit',
            render: (text, record, index) => {
                return (this.state.items.start_idx + index + 1)
            }
        };
        var dateCols = [
            {
                title: 'Added On',
                dataIndex: 'date_added',
                className: 'td-fit',
                render: (text) => {
                    return new Date(text).toLocaleString()
                }
            },
            {
                title: 'Modified On',
                dataIndex: 'date_modified',
                className: 'td-fit',
                render: (text) => {
                    return new Date(text).toLocaleString()
                }
            }
        ]
        var actionsCol = {};
        if (this.props.rowActions) {
            actionsCol = {
                title: '',
                key: 'actions',
                className: 'td-fit',
                render: (text, record) => {
                    var buttons = this.props.rowActions.map(action => {
                        switch (action) {
                            case "duplicateItem":
                                return <Button type="link" key={action} icon="copy"
                                    onClick={() => this.duplicateItem(record)} />
                            case "deleteItem":
                                return <Button type="link" key={action} icon="delete"
                                    onClick={() => this.deleteItem(record)} />
                            default:
                                return null
                        }
                    })
                    return buttons
                }
            }
        }
        var columns = [idxCol, ...this.props.columns, ...dateCols, actionsCol]
        // in all these columns if there is anything with 'editLink: true', then render that column as link
        for (var col of columns) {
            if (col.editLink) {
                col.render = (text, record) => {
                    return <Button onClick={() => this.editItem(record)} type="link">{text}</Button>
                }
                delete col.editLink
            }
        }
        return columns
    }

    createEditor = () => {
        var formItems = this.props.editorFields.map(field => {
            switch (field.type) {
                case "input":
                    return (
                        <Form.Item label={field.label} key={field.name}>
                            <Input placeholder={field.placeholder}
                                value={this.state.editorValues[field.name]}
                                onChange={(e) => this.handleEditorInputChange(field.name, e.target.value)} />
                        </Form.Item>
                    )
                case "select":
                    var options = field.options.map(option => {
                        return <Select.Option value={option} key={option}>{option}</Select.Option>
                    })
                    return (
                        <Form.Item label={field.label} key={field.name}>
                            <Select value={this.state.editorValues[field.name]}
                                showSearch
                                onChange={(val) => this.handleEditorInputChange(field.name, val)}>
                                {options}
                            </Select>
                        </Form.Item>
                    )
                default:
                    return null
            }
        })
        return (
            <Form colon={false} labelCol={{ span: 6 }} wrapperCol={{ span: 18 }}>
                {formItems}
            </Form>
        )
    }

    addItem = () => {
        var data = { ...this.state.editorValues };
        var promise;
        var url;
        if (data[this.props.dataKey]) {
            // its update to an existing record
            url = this.props.itemBaseUrl + data.id;
            promise = axios.put(url, data)
        } else {
            // add a new record
            url = this.props.itemsListUrl;
            promise = axios.post(url, data)
        }
        promise.then((rsp) => {
            this.setState({ editorValues: {} })
            this.getItems();
            this.hideEditor();
        })
    }

    editItem = (record) => {
        this.setState({ editorValues: record });
        this.showEditor()
    }

    deleteItem = (record) => {
        // if record is a single item (with dataKey attribute),
        // then delete the single record
        var promises = [];
        if (record[this.props.dataKey]) {
            var url = this.props.itemBaseUrl + record[this.props.dataKey];
            promises.push(axios.delete(url));
        }
        promises = this.state.selectedRows.map(key => {
            var url = this.props.itemBaseUrl + key;
            return axios.delete(url);
        })
        this.setState({ selectedRows: [] })
        axios.all(promises).then(rsp => {
            this.getItems();
        })
    }

    duplicateItem = (record) => {
        var keys = this.props.duplicateItemKeys;
        var data = {};
        for (var key of keys) {
            data[key] = record[key]
        }
        this.setState({ editorValues: data });
        this.showEditor();
    }

    getItems = () => {
        var url = this.props.itemsListUrl + "?" + qs.stringify(this.searchParams, { skipNull: true });
        axios.get(url).then((rsp) => {
            this.setState({ items: rsp.data });
        })
    }

    handlePagerClick = (page, pageSize) => {
        this.searchParams.page = page;
        this.searchParams.page_size = pageSize;
        this.changeBrowserUrl();
    }

    handleSearchOnSearch = (val) => {
        if (val === "") val = null;
        this.searchParams.search = val;
        // reset the page number for a new search
        this.searchParams.page = 1;
        this.changeBrowserUrl();
    }

    handleSearchOnChange = (e) => {
        this.setState({ "searchValue": e.target.value })
        if (e.target.value === "") {
            this.handleSearchOnSearch(e.target.value)
        }
    }

    handleEditorInputChange = (varName, value) => {
        var data = { ...this.state.editorValues };
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

export default ItemsList;