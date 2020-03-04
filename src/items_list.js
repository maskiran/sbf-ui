import React from 'react';
import axios from 'axios';
import qs from 'query-string';
import { Table, Input, Button, Modal, Form, Select, Row, Col, Typography } from 'antd';

class ItemsList extends React.Component {
    // props
    // headerTitle={string show at the top}
    // tableTitle={string, displayed left of the buttons}
    // noAddButton={dont show add button}
    // addButtonTitle="Add Service"
    // noDeleteButton={dont show delete button}
    // deleteButtonTitle="Delete"
    // itemsListUrl={this.itemsListUrl}
    // itemBaseUrl={this.itemBaseUrl}
    // columns={this.getTableColumns()}
    // dataKey="name"
    // editorTitle="Add Service"
    // editorWidth="40%"
    // editorFields={this.getEditorFields()}
    // externalEditor=<Component that takes editorValues and calls updateEditorValues onChange
    // eg. <ServiceEditForm editorValues={this.state.editorValues}
    // onChange={this.updateEditorValues} createMode={false}/>
    // externalEditorProps={props to send to the external editor}
    // duplicateItemKeys={["name", "rule_set_version"]}
    // rowActions={["duplicateItem"]}
    // tableProps={{dictionary thats passed to Table}}


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
                {this.props.headerTitle ? <Typography.Title level={4} style={{ marginBottom: "30px" }}>{this.props.headerTitle}</Typography.Title> : null}
                {this.renderActionsRow()}
                {this.renderItemsTable()}
                {this.renderEditorModal()}
            </div>
        )
    }

    renderActionsRow = () => {
        return (
            <Row style={{ marginBottom: "15px" }}>
                <Col span={18}>
                    {this.props.tableTitle ?
                        <Typography.Title level={4} style={{display: "inline", marginRight: "15px"}}>
                            {this.props.tableTitle}
                        </Typography.Title>
                        :
                        null
                    }
                    {!this.props.noAddButton ?
                        <Button type="primary" style={{ marginRight: "10px" }}
                            onClick={this.showEditor} icon="plus">
                            {this.props.addButtonTitle}
                        </Button>
                        :
                        null
                    }
                    {!this.props.noDeleteButton ?
                        <Button type="danger" style={{ marginRight: "10px" }}
                            onClick={this.deleteItem} icon="delete"
                            disabled={!this.state.selectedRows.length}>
                            {this.props.deleteButtonTitle || "Delete"}
                        </Button>
                        :
                        null
                    }
                    <Button style={{ marginRight: "10px" }}
                        onClick={this.getItems} icon="reload">
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
        var rowSelection = {
            onChange: this.handleRowSelection,
            selectedRowKeys: this.state.selectedRows,
        }
        // if there is noDeleteButton, dont show rowSelection
        if (this.props.noDeleteButton) {
            rowSelection = null;
        }
        return (
            <Table dataSource={this.state.items.items}
                columns={this.getTableColumns()} size="middle" bordered
                rowSelection={rowSelection}
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
                width={this.props.editorWidth || "50%"}
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
        var columns = [idxCol, ...this.props.columns, ...dateCols]
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
                            case "editItem":
                                return <Button type="link" key={action} icon="edit"
                                    onClick={() => this.editItem(record)} />
                            default:
                                return null
                        }
                    })
                    return buttons
                }
            }
            columns.push(actionsCol);
        }
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
        if (this.props.externalEditor) {
            var ExternalEditor = this.props.externalEditor;
            return <ExternalEditor editorValues={this.state.editorValues}
                onChange={this.updateEditorValuesFromExternalEditor}
                {...this.props.externalEditorProps} />
        }
        // create a local edior
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
                case "textarea":
                    return (
                        <Form.Item label={field.label} key={field.name}>
                            <Input.TextArea placeholder={field.placeholder}
                                rows={field.rows || 10}
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
        if (data._edit) {
            // its update to an existing record
            url = this.props.itemBaseUrl + data[this.props.dataKey];
            delete data._edit;
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
        var data = { ...record };
        data._edit = true;
        this.setState({ editorValues: data });
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

    updateEditorValuesFromExternalEditor = (newValues) => {
        this.setState({ editorValues: newValues })
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