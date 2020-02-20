import React from 'react';
import ItemsList from './items_list';
import { Popover, Icon } from 'antd';

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
            },
            {
                title: 'Certificate Expiry',
                dataIndex: 'expiry_date',
                render: (text, record) => {
                    return new Date(text).toISOString()
                }
            },
            {
                title: 'Certificate DNS / Subjects',
                dataIndex: 'subjects',
                render: (items) => {
                    var data = items.map((item, idx) => {
                        return <div key={idx}>{item}</div>
                    });
                    return <Popover content={data} title="Subjects / DNS Names"
                        trigger="click">
                        <span>{items[0]} {items.length ? <Icon type="info-circle"/> : ""}</span>
                    </Popover>
                }
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
            {
                type: 'textarea',
                name: 'body',
                label: 'Certificate Body',
                placeholder: '---BEGIN CERTIFICATE---\n---END CERTIFICATE---',
                row: 10,
            },
            {
                type: 'textarea',
                name: 'private_key',
                label: 'Certificate Key',
                placeholder: '---BEGIN PRIVATE KEY---\n---END PRIVATE KEY---',
                row: 10,
            },
        ]
    }

}

export default CertificatesList;