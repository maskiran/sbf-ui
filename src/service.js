import React from 'react';
import axios from 'axios';
import qs from 'query-string';
import { Table, Input, Button, Modal, Form } from 'antd';
import { Link } from 'react-router-dom';

class Service extends React.Component {
    constructor(props) {
        super(props);
        // parse the search query params and assign to the state
        var queryParams = qs.parse(props.location.search);
        // name is update when the user presses 'enter' on the search
        // box. searchValue maintains the current value (as being typed)
        // in the search box
        this.state = {
            services: {},
            searchValue: queryParams.name || null,
            addServiceFormVisible: false,
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
                return (this.state.services.start_idx + index + 1)
            }
        },
        {
            title: 'Name',
            dataIndex: 'name',
            render: (text) => {
                var url = "/service/" + text
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

    handleInputChange = (e) => {
        this.setState({[e.target.name]: e.target.value})
    }

    createAddServiceForm = () => {
        return (
            <Form colon={false} labelCol={{span: 4}} wrapperCol={{span: 20}}>
                <Form.Item label="Service Name">
                    <Input placeholder="service1" name="newServiceName"
                        value={this.state.newServiceName}
                        onChange={this.handleInputChange}/>
                </Form.Item>
                <Form.Item label="Listen Port">
                    <Input placeholder="443" name="newServicePort"
                        value={this.state.newServicePort}
                        onChange={this.handleInputChange}/>
                </Form.Item>
                <Form.Item label="Target">
                    <Input placeholder="http://loadbalancer-name.app.com or ip address"
                        name="newServiceTarget"
                        value={this.state.newServiceTarget}
                        onChange={this.handleInputChange}/>
                </Form.Item>
            </Form>
        )
    }

    showAddServiceForm = () => {
        this.setState({addServiceFormVisible: true})
    }

    addService = () => {
        var data = {
            name: this.state.newServiceName,
            target: this.state.newServiceTarget,
            listen_port: this.state.newServicePort
        }
        var url = "/api/services";
        axios.post(url, data).then((rsp) => {
            this.props.history.push('/service/' + this.state.newServiceName);
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

    getServices = () => {
        var url = "/api/services?" + qs.stringify(this.searchParams, { skipNull: true });
        axios.get(url).then((rsp) => {
            this.setState({ services: rsp.data });
        })
    }

    componentDidMount() {
        this.getServices();
    }

    componentDidUpdate(prevProps, prevState) {
        var oldUrl = prevProps.location.pathname + prevProps.location.search;
        var newUrl = this.makeBrowserUrl();
        if (newUrl !== oldUrl) {
            this.getServices();
        }
    }

    render() {
        return (
            <div style={{ padding: "25px" }}>
                <Modal visible={this.state.addServiceFormVisible} title="Add Service"
                    width={"40%"}
                    onCancel={() => this.setState({addServiceFormVisible: false})}
                    onOk={this.addService}>
                    {this.createAddServiceForm()}
                </Modal>
                <div style={{ marginBottom: "10px" }}>
                    <Button style={{ float: "left" }} type="primary"
                        onClick={this.showAddServiceForm}>Add Service</Button>
                    <Input.Search style={{ float: "right", width: "25%" }}
                        name="searchValue"
                        value={this.state.searchValue}
                        onSearch={this.handleSearchOnSearch}
                        onChange={this.handleInputChange} />
                    <div style={{ clear: "both" }} />
                </div>
                <Table dataSource={this.state.services.items}
                    columns={this.columns} size="middle" bordered
                    rowKey="name"
                    pagination={{
                        pageSize: this.state.services.page_size || 10,
                        total: this.state.services.count,
                        current: this.state.services.page,
                        onChange: this.handlePagerClick
                    }} />
            </div>
        )
    }
}

export default Service;