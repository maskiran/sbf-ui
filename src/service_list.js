import React from 'react';
import axios from 'axios';
import qs from 'query-string';
import { Table, Input, Button, Modal, Row, Col, Icon } from 'antd';
import { Link } from 'react-router-dom';
import ServiceEditForm from './service_edit';

class ServiceList extends React.Component {
    constructor(props) {
        super(props);
        // parse the search query params and assign to the state
        // name is update when the user presses 'enter' on the search
        // box. searchValue maintains the current value (as being typed)
        // in the search box
        this.state = {
            services: {},
            searchValue: "",
            addServiceFormVisible: false,
            selectedRows: [],
            editorValues: {},
        }
        this.defaultPage = 1;
        this.defaultPageSize = 25;
        this.searchParams = {};
        this.parseAndSetSearchParams();
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
        this.getServices();
    }

    componentDidUpdate(prevProps, prevState) {
        this.parseAndSetSearchParams();
        var oldUrl = prevProps.location.pathname + prevProps.location.search;
        var newUrl = this.makeBrowserUrl();
        if (newUrl !== oldUrl) {
            this.getServices();
        }
    }

    render() {
        return (
            <div style={{ padding: "25px" }}>
                {this.renderActionsRow()}
                {this.renderServicesListTable()}
                {this.renderAddNewServiceModal()}
            </div>
        )
    }

    renderAddNewServiceModal = () => {
        return (
            <Modal visible={this.state.addServiceFormVisible} title="Add Service"
                width={"40%"}
                onCancel={this.hideAddServiceForm}
                onOk={this.addService}>
                <ServiceEditForm onChange={this.updateEditorValues} createMode={true}
                    editorValues={this.state.editorValues} />
            </Modal>
        )
    }

    renderActionsRow = () => {
        return (
            <Row style={{ marginBottom: "15px" }}>
                <Col span={18}>
                    <Button type="primary" onClick={this.showAddServiceForm}>
                        <Icon type="plus" /> Add Service
                    </Button>
                    <Button type="danger" style={{ marginLeft: "10px" }}
                        onClick={this.deleteService}
                        disabled={!this.state.selectedRows.length}>
                        <Icon type="delete" /> Delete
                    </Button>
                </Col>
                <Col span={6}>
                    <Input.Search
                        name="searchValue"
                        value={this.state.searchValue}
                        onSearch={this.handleOnSearch}
                        onChange={this.handleInputChange} />
                </Col>
            </Row>
        )
    }

    renderServicesListTable = () => {
        return (
            <Table dataSource={this.state.services.items}
                columns={this.getTableColumns()} size="middle" bordered
                rowKey="name"
                rowSelection={{
                    onChange: this.handleRowSelection
                }}
                pagination={{
                    pageSize: this.state.services.page_size || 10,
                    total: this.state.services.count,
                    current: this.state.services.page,
                    onChange: this.handlePagerClick
                }}
            />
        )
    }

    getTableColumns = () => {
        var columns = [
            {
                title: 'Idx',
                key: 'idx',
                className: 'td-fit',
                render: (text, record, index) => {
                    return (this.state.services.start_idx + index + 1)
                }
            },
            {
                title: 'Name',
                dataIndex: 'name',
                render: (text) => {
                    var url = "/service/" + text + "/home";
                    return <Link to={url}>{text}</Link>
                }
            },
            {
                title: 'Listen Port',
                dataIndex: 'listen_port'
            },
            {
                title: 'Target',
                dataIndex: 'target'
            },
            {
                title: 'WAF',
                dataIndex: 'waf_profile'
            },
            {
                title: 'TLS',
                dataIndex: 'tls_profile'
            },
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
            },
        ]

        return columns
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

    handleRowSelection = (selectedKeys) => {
        this.setState({ selectedRows: selectedKeys })
    }

    showAddServiceForm = () => {
        this.setState({ addServiceFormVisible: true })
    }

    hideAddServiceForm = () => {
        this.setState({ addServiceFormVisible: false })
    }

    updateEditorValues = (newValuesObj) => {
        this.setState({ editorValues: newValuesObj });
    }

    addService = () => {
        var url = "/api/services";
        axios.post(url, this.state.editorValues).then((rsp) => {
            this.props.history.push('/service/' + this.state.editorValues.name + '/home');
        })
    }

    deleteService = () => {
        var promises = [];
        for (var svc of this.state.selectedRows) {
            var url = '/api/service/' + svc;
            var promise = axios.delete(url);
            promises.push(promise);
        }
        if (promises.length) {
            this.setState({ selectedRows: [] });
            axios.all(promises).then(rspList => {
                this.getServices();
            })
        }
    }

    getServices = () => {
        var url = "/api/services?" + qs.stringify(this.searchParams, { skipNull: true });
        axios.get(url).then((rsp) => {
            this.setState({ services: rsp.data });
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

}

export default ServiceList;