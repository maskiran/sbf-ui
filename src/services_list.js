import React from 'react';
import { Link } from 'react-router-dom';
import ItemsList from './items_list';
import ServiceEditForm from './service_edit';

class ServicesList extends React.Component {
    state = {
        wafProfiles: [],
        tlsProfiles: []
    }

    itemsListUrl = "/api/services";
    itemBaseUrl = "/api/service/";

    render() {
        return <ItemsList style={{ margin: "25px" }}
            {...this.props}
            tableTitle="Services"
            noAddButton
            noDeleteButton
            editorTitle="Update Service Proxy"
            itemsListUrl={this.itemsListUrl}
            itemBaseUrl={this.itemBaseUrl}
            columns={this.getTableColumns()}
            dataKey="name"
            externalEditor={ServiceEditForm}
            externalEditorProps={{ createMode: true }}
            rowActions={["editItem"]}
        />
    }

    getTableColumns = () => {
        var columns = [
            {
                title: 'Name',
                dataIndex: 'name',
                render: (text) => {
                    var url = "/service/" + text + "/home";
                    return <Link to={url}>{text}</Link>
                }
            },
            {
                title: 'Namespace',
                dataIndex: 'namespace',
            },
            {
                title: 'Labels',
                dataIndex: 'labels',
                render: (text) => {
                    return Object.keys(text).map((key, idx) => {
                        return <div key={key}>{key}={text[key]}</div>
                    })
                }
            },
            {
                title: 'Proxy',
                dataIndex: 'proxy_ip',
                render: (text, record) => {
                    return text + ":" + record.proxy_port
                }
            },
            {
                title: 'Policy',
                dataIndex: 'proxy_policy_profile'
            },
            {
                title: 'TLS',
                dataIndex: 'proxy_tls_profile'
            },
            {
                title: 'WAF',
                dataIndex: 'proxy_waf_profile'
            },
            {
                title: 'Deleted',
                dataIndex: 'deleted',
                render: (text) => {
                    if (text) {
                        return "true"
                    }
                    return ""
                }
            },
        ]
        return columns
    }
}

export default ServicesList;