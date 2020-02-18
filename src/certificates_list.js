import React from 'react';
import ItemsList from './items_list';

class CertificatesList extends React.Component {
    itemsListUrl = "/api/certificates";
    itemBaseUrl = "/api/certificate/";

    render() {
        return <ItemsList
            {...this.props}
            editorTitle="Add Certificate"
            addButtonTitle="Add Certificate"
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
                label: 'Certificate Name',
                placeholder: 'cert1-2020-01-01',
            },
        ]
    }

}

export default CertificatesList;