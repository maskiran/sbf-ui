import React from 'react';
import axios from 'axios';
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

    componentDidMount = () => {
        this.getWAFProfiles();
        this.getTLSProfiles()
    }

    getWAFProfiles = () => {
        var url = '/api/waf-profiles?page_size=-1';
        axios.get(url).then((rsp) => {
            this.setState({ wafProfiles: rsp.data.items.map(item => item.name) })
        })
    }

    getTLSProfiles = () => {
        var url = '/api/tls-profiles?page_size=-1';
        axios.get(url).then((rsp) => {
            this.setState({ tlsProfiles: rsp.data.items.map(item => item.name) })
        })
    }

    render() {
        return <ItemsList style={{ margin: "25px" }}
            {...this.props}
            editorTitle="Add Service"
            addButtonTitle="Add Service"
            itemsListUrl={this.itemsListUrl}
            itemBaseUrl={this.itemBaseUrl}
            columns={this.getTableColumns()}
            dataKey="name"
            externalEditor={ServiceEditForm}
            externalEditorProps={{createMode: true}}
        />
    }

    getEditorFields = () => {
        return [
            {
                type: 'input',
                name: 'name',
                label: 'Name',
                placeholder: 'svc1',
            },
            {
                type: 'input',
                name: 'listen_port',
                label: 'Listen Port',
                placeholder: '443',
            },
            {
                type: 'input',
                name: 'target',
                label: 'Target',
                placeholder: 'http://loadbalancer-name.app.com or ip address',
            },
            {
                type: 'select',
                name: 'waf_profile',
                label: 'WAF Profile',
                options: this.state.wafProfiles,
            },
            {
                type: 'select',
                name: 'tls_profile',
                label: 'TLS Profile',
                options: this.state.tlsProfiles,
            },
        ]
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
        ]
        return columns
    }
}

export default ServicesList;