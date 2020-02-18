import React from 'react';
import axios from 'axios';
import ItemsList from './items_list';

class TLSProfilesList extends React.Component {
    state = {
        certificatesList: []
    }

    itemsListUrl = "/api/tls-profiles";
    itemBaseUrl = "/api/tls-profile/";

    componentDidMount = () => {
        this.getCertificates();
    }

    render() {
        return <ItemsList
            {...this.props}
            editorTitle="Add TLS Profile"
            addButtonTitle="Add TLS Profile"
            itemsListUrl={this.itemsListUrl}
            itemBaseUrl={this.itemBaseUrl}
            columns={this.getTableColumns()}
            dataKey="name"
            editorFields={this.getEditorFields()}
        />
    }

    getTableColumns = () => {
        var columns = [
            {
                title: 'Name',
                dataIndex: 'name',
                editLink: true,
            },
            {
                title: 'Certificate',
                dataIndex: 'certificate'
            },
            {
                title: 'Certificate Expiry',
                dataIndex: 'cert_expiry'
            },
            {
                title: 'Certificate DNS / Subjects',
                dataIndex: 'cert_subjects'
            },
        ]
        return columns;
    }

    getEditorFields = () => {
        return [
            {
                type: 'input',
                name: 'name',
                label: 'TLS Profile Name',
                placeholder: 'tls1',
            },
            {
                type: 'select',
                name: 'certificate',
                label: 'Certificate',
                options: this.state.certificatesList,
            }
        ]
    }

    getCertificates = () => {
        var url = '/api/certificates?page_size=-1';
        axios.get(url).then(rsp => {
            var names = rsp.data.items.map(item=>item.name);
            this.setState({ certificatesList: names })
        })
    }

}

export default TLSProfilesList;