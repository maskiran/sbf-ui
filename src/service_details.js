import React from 'react';
import axios from 'axios';
import qs from 'query-string';
import { Table, Input, Button } from 'antd';

class ServiceDetails extends React.Component {
    constructor(props) {
        super(props);
        console.log(props);
        this.state = {
            services: {},
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
            dataIndex: 'name'
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

    getServices = () => {
        var url = "/api/services?name=" + this.props.match.params.name;
        axios.get(url).then((rsp) => {
            this.setState({ services: rsp.data });
        })
    }

    componentDidMount() {
        this.getServices();
    }

    render() {
        return (
            <div style={{ padding: "25px" }}>
                <Table dataSource={this.state.services.items}
                    columns={this.columns} size="middle" bordered
                    rowKey="name"
                    pagination={false} />
            </div>
        )
    }
}

export default ServiceDetails;