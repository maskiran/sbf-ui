import React from 'react';
import ItemsList from './items_list';

class KubeProfilesList extends React.Component {
    itemsListUrl = "/api/kube-profiles";
    itemBaseUrl = "/api/kube-profile/";

    render() {
        return <ItemsList
            {...this.props}
            editorTitle="Add Kube Config"
            editorWidth="60%"
            addButtonTitle="Add Kube Config"
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
                title: 'Cluster',
                dataIndex: 'cluster'
            },
        ]
        return columns;
    }

    getEditorFields = () => {
        return [
            {
                type: 'input',
                name: 'name',
                label: 'Kube Profile Name',
                placeholder: 'kube1',
            },
            {
                type: 'textarea',
                name: 'kube_config',
                label: 'Kube Config',
                rows: 20,
            }
        ]
    }
}

export default KubeProfilesList;