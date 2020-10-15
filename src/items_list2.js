import React from 'react';
import axios from 'axios';
import apiPost from './apicall';
import deepequal from 'deep-equal';

import { Table, Input, Button, Modal, Form, Select, Row, Col, Typography, Popconfirm, Drawer, Alert } from 'antd';
import { ReloadOutlined, PlusOutlined, CopyOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';

export default class ItemsList extends React.Component {
    // headerTitle={string shown at the top of the table}
    // tableActions="default or a reactnode":
    //    default has add, delete, reload and search which can be independently controlled
    // noAddButton={dont show add button}
    // addButtonTitle="Add Service"
    // noDeleteButton={dont show delete button}
    // deleteButtonTitle="Delete"
    // noReloadButton
    // noSearch
    // objectUrl={base url of the valtix object}
    // listUrl={base url of the valtix object} use this for list otherwise objectUrl/list is used
    // listData={additional data to send in the list request}
    // deleteUrl={base url of the valtix object} use this for list otherwise objectUrl/delete is used
    // reformatContent = method to call with response data that reformats the content in a way suitable to be displayed in table
    // columns={list of columns, same format as cols in antd table}
    // noRowSelection={dont show row selection column}
    // onRowSelection={parent function with keys and records}
    // noIndex={dont show index column}
    // dataKey="some-id-field"
    // dataKeyFriendlyName="name" // show in clone, delete etc
    // noPager={dont show pager}
    // editorTitle="Add Service"
    // editorWidth="40%"
    // editorView = "modal" or "drawer"
    // editorFields={this.getEditorFields()}
    //    a list of maps
    //    {type: 'input', name: 'fldname', label: 'label name', placeholder: 'placeholder', helper: 'help text below text box'}
    //    {type: 'select', name: 'fldname', label: 'label name', options: optionslist}
    //    {type: 'textarea', name: 'fldname', label: 'label name', placeholder: 'placeholder'}
    // externalEditor=<Component that takes editorValues and calls 'updateEditorValues' onChange
    //     eg. <ServiceEditForm editorValues={this.state.editorValues}
    //             onChange={this.updateEditorValues} createMode={false}/>
    // externalEditorProps={props to send to the external editor}
    // duplicateItemKeys={["name", "rule_set_version"]} {keys to use to clone an item}
    // rowActions={["duplicateItem", "deleteItem", "editItem"]} // links to show in each row
    // tableProps={{dictionary thats passed to Table}}
    // actionButtonsSpan = 12 {number of span columns used by the table actions}
    // searchSpan = 12 {number of span columns used by the table actions}
    // onReload = {call a method (typically from parent)}
    // tableActions = {list of extra table actions to show}

    constructor(props) {
        super(props);
        this.state = {
            items: {},
            editorVisible: false,
            editorValues: {},
            selectedRows: [],
            loading: true,
            deleteItemError: {},
            getItemsError: {},
        }
    }

    componentDidMount() {
        this.getItems();
    }

    componentDidUpdate(prevProps) {
        // if listData is provided as props, check if any of that content changed
        if (this.props.listData && !deepequal(this.props.listData, prevProps.listData, { strict: true })) {
            // console.log('loading due to data');
            // console.log('old ', JSON.stringify(prevProps.listData));
            // console.log('new ', JSON.stringify(this.props.listData));
            this.getItems();
        }
    }

    render() {
        return (
            <div style={this.props.style}>
                {this.renderAlerts()}
                {this.props.headerTitle ?
                    <Typography.Title level={4} style={{ marginBottom: "24px" }}>
                        {this.props.headerTitle}
                    </Typography.Title>
                    : null}
                {this.renderTableActions()}
                {this.renderItemsTable()}
                {this.renderEditorModal()}
            </div>
        )
    }

    renderAlerts = () => {
        return <div>
            {this.state.deleteItemError.message ?
                <Alert banner closable message={this.state.deleteItemError.message}
                    description={this.state.deleteItemError.description}
                    type="error"
                    style={{ marginBottom: "20px" }}
                />
                :
                null
            }
            {this.state.getItemsError.message &&
                <Alert banner closable message={this.state.getItemsError.message}
                    description={this.state.getItemsError.description}
                    type="error"
                    style={{ marginBottom: "20px" }}
                />
            }
        </div>
    }

    renderTableActions = () => {
        if (this.props.tableActions === 'default') {
            return this.renderDefaultTableActions()
        } else {
            return this.props.tableActions
        }
    }

    renderDefaultTableActions = () => {
        return (
            <Row style={{ marginBottom: "16px" }}>
                <Col span={this.props.actionButtonsSpan}>
                    {!this.props.noAddButton ?
                        <Button type="primary" style={{ marginRight: "10px" }}
                            onClick={this.showEditor} icon={<PlusOutlined />}>
                            {this.props.addButtonTitle || "Add"}
                        </Button>
                        :
                        null
                    }
                    {!this.props.noDeleteButton ?
                        <Popconfirm placement="bottomLeft"
                            title={"Delete selected items?"}
                            onConfirm={this.deleteItem}
                            okText="Yes"
                            cancelText="No">
                            <Button type="danger" style={{ marginRight: "10px" }}
                                icon={<DeleteOutlined />}
                                disabled={!this.state.selectedRows.length}>
                                {this.props.deleteButtonTitle || "Delete"}
                            </Button>
                        </Popconfirm>
                        :
                        null
                    }
                    {!this.props.noReloadButton ?
                        <Button style={{ marginRight: "10px" }}
                            onClick={this.reloadItems} icon={<ReloadOutlined />}>
                            Reload
                    </Button>
                        :
                        null
                    }
                </Col>
                <Col span={this.props.searchSpan}>
                    {!this.props.noSearch ?
                        <Input.Search
                            value={this.state.searchValue}
                            onSearch={this.handleSearchOnSearch}
                            onChange={this.handleSearchOnChange} />
                        :
                        null
                    }
                </Col>
            </Row>
        )
    }

    renderItemsTable = () => {
        var rowSelection = {
            onChange: this.handleRowSelection,
            selectedRowKeys: this.state.selectedRows,
            getCheckboxProps: record => ({
                disabled: record._disabled
            })
        }
        // if there is noDeleteButton, dont show rowSelection
        if (this.props.noRowSelection) {
            rowSelection = null;
        }
        return (
            <Table dataSource={this.state.items.items}
                columns={this.getTableColumns()}
                size="small" bordered
                rowSelection={rowSelection}
                rowKey={this.props.dataKey}
                loading={this.state.loading}
                pagination={false}
                {...this.props.tableProps}
            />
        )
    }

    renderEditorModal = () => {
        if (this.props.editorView === 'drawer') {
            return (
                <Drawer visible={this.state.editorVisible}
                    title={this.props.editorTitle || "Add/Edit"}
                    width={this.props.editorWidth || "50%"}
                    onClose={this.hideEditor}
                    mask={false}
                    placement="right"
                    className="drawer"
                    keyboard={false}
                    footer={
                        <div style={{ textAlign: 'right' }}>
                            <Button onClick={this.hideEditor} style={{ marginRight: 10 }}>
                                Cancel
                          </Button>
                            <Button onClick={this.addItem} type="primary">
                                Submit
                          </Button>
                        </div>
                    }
                >
                    { this.createEditor()}
                </Drawer>
            )
        } else {
            return (
                <Modal visible={this.state.editorVisible}
                    title={this.props.editorTitle || "Add/Edit"}
                    width={this.props.editorWidth || "50%"}
                    onCancel={this.hideEditor}
                    onOk={this.addItem}
                >
                    {this.createEditor()}
                </Modal>
            )
        }
    }

    getTableColumns = () => {
        // change this.props.columns by adding few base columns
        var idxCol = {
            title: 'S.No',
            key: 'idx',
            className: 'td-fit',
            render: (text, record, index) => {
                return (this.state.items.start_idx + index + 1)
            }
        };
        var columns;
        if (!this.props.noIndex) {
            columns = [idxCol, ...this.props.columns];
        } else {
            columns = [...this.props.columns];
        }
        var actionsCol = {};
        if (this.props.rowActions) {
            actionsCol = {
                title: '',
                key: 'actions',
                render: (text, record) => {
                    var buttons = this.props.rowActions.map(action => {
                        switch (action) {
                            case "duplicateItem":
                                return <Button type="link" size="small" key={action}
                                    icon={<CopyOutlined />}
                                    onClick={() => this.duplicateItem(record)} />
                            case "deleteItem":
                                return (
                                    <Popconfirm key={action}
                                        title={"Delete '" + record[this.props.dataKeyFriendlyName || this.props.dataKey] + "' ?"}
                                        onConfirm={() => this.deleteItem(record)}
                                        okText="Yes"
                                        cancelText="No">
                                        <Button type="link" size="small" icon={<DeleteOutlined />} />
                                    </Popconfirm>
                                )
                            case "editItem":
                                return <Button type="link" size="small" key={action}
                                    icon={<EditOutlined />}
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
        if (!this.props.editorFields) {
            return null
        }
        // create a local editor
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
            console.log(data);
            url = this.props.objectUrl + '/create';
            promise = apiPost(url, data)
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
        this.setState({ loading: true, deleteItemError: {} });
        var promises = [];
        var url = this.props.objectUrl + '/delete';
        if (this.props.deleteUrl) {
            url = this.props.deleteUrl;
        }
        if (record[this.props.dataKey]) {
            // delete a single record by clicking delete icon on a table row
            if (this.props.deleteItem) {
                // custom method to delete requested by the caller
                promises.push(this.props.deleteItem(record));
            } else {
                var data = { [this.props.dataKey]: record[this.props.dataKey] };
                promises.push(apiPost(url, data));
            }
        } else {
            promises = this.state.selectedRows.map(key => {
                // delete multiple records selected from the table checkbox
                if (this.props.deleteItem) {
                    return this.props.deleteItem(key)
                } else {
                    var data = { [this.props.dataKey]: key };
                    return apiPost(url, data);
                }
            })
            this.setState({ selectedRows: [] })
        }
        axios.all(promises).then(rsp => {
            this.getItems();
        }).catch(error => {
            var err = {
                message: error.response.data.message,
                description: 'Error while deleting ' + new Date().toLocaleString()
            };
            this.setState({ deleteItemError: err });
        }).then(this.getItems)
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

    reloadItems = () => {
        if (this.props.onReload) {
            this.props.onReload();
        } else {
            this.getItems();
        }
    }

    getItems = () => {
        // console.log('get items ', JSON.stringify(this.props.listData));
        this.setState({
            items: [],
            loading: true,
            getItemsError: {},
        });
        var url = this.props.objectUrl + '/list';
        if (this.props.listUrl) {
            url = this.props.listUrl;
        }
        var data = this.props.listData || {};
        apiPost(url, data).then(rsp => {
            var data = this.props.reformatContent(rsp.data);
            this.setState({
                items: data,
                loading: false
            });
        }).catch(error => {
            console.log(error, Object.keys(error));
            var msg;
            if (error.response && error.response.data) {
                if (error.response.data.message) {
                    msg = error.response.data.message
                } else if (error.response.data.error) {
                    msg = error.response.data.error
                }
            } else {
                msg = error;
            }
            var err = {
                message: msg,
                description: 'Error while getting items ' + new Date().toLocaleString()
            }
            this.setState({ getItemsError: err })
        })
    }

    handleEditorInputChange = (varName, value) => {
        var data = { ...this.state.editorValues };
        data[varName] = value;
        this.setState({ editorValues: data });
    }

    handleRowSelection = (selectedKeys, records) => {
        this.setState({ selectedRows: selectedKeys })
        if (this.props.onRowSelection) {
            this.props.onRowSelection(selectedKeys, records);
        }
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
}

// default properties
ItemsList.defaultProps = {
    tableActions: 'default',
    actionButtonsSpan: 8,
    searchSpan: 16
}
