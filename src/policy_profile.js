import React from 'react';
import ItemsList from './items_list';

class PolicyProfile extends React.Component {
    itemsListUrl = "/api/policy-rules/" + this.props.match.params.name;
    itemBaseUrl = "/api/policy-rule/" + this.props.match.params.name + "/";

    render() {
        return <ItemsList
            {...this.props}
            headerTitle={"Policy Rules - " + this.props.match.params.name}
            editorTitle="Add Rule"
            addButtonTitle="Add Rule"
            itemsListUrl={this.itemsListUrl}
            itemBaseUrl={this.itemBaseUrl}
            duplicateItemKeys={["name", "source", "action", "log"]}
            columns={this.getTableColumns()}
            dataKey="id"
            editorFields={this.getEditorFields()}
            rowActions={["duplicateItem"]}
            tableProps={{
                rowClassName: "tr-very-small"
            }}
        />
    }

    getEditorFields = () => {
        return [
            {
                type: 'input',
                name: 'name',
                label: 'Rule Name',
                placeholder: 'rule1',
            },
            {
                type: 'input',
                name: 'source',
                label: 'Source Address',
                placeholder: '1.0.0.0/16',
            },
            {
                type: 'select',
                name: 'action',
                label: 'Action',
                options: ["allow", "drop"],
            },
            {
                type: 'select',
                name: 'log',
                label: 'Log',
                options: ["log", "nolog"],
            },
        ]
    }

    getTableColumns = () => {
        var columns = [
            {
                title: 'Name',
                dataIndex: 'name',
                editLink: true,
            },
            {
                title: 'Source',
                dataIndex: 'source',
            },
            {
                title: 'Action',
                dataIndex: 'action'
            },
            {
                title: 'Log',
                dataIndex: 'log'
            },
        ]
        return columns
    }
}

export default PolicyProfile;