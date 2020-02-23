import React from 'react';
import { Link } from 'react-router-dom';
import ItemsList from './items_list';

class PolicyProfilesList extends React.Component {
    itemsListUrl = "/api/policy-profiles";
    itemBaseUrl = "/api/policy-profile/";

    render() {
        return <ItemsList
            {...this.props}
            editorTitle="Add Policy Set"
            addButtonTitle="Add Policy Set"
            itemsListUrl={this.itemsListUrl}
            itemBaseUrl={this.itemBaseUrl}
            duplicateItemKeys={["name", "rule_set_version"]}
            columns={this.getTableColumns()}
            dataKey="name"
            editorFields={this.getEditorFields()}
            rowActions={["duplicateItem"]}
        />
    }

    getTableColumns = () => {
        var columns = [
            {
                title: 'Name',
                dataIndex: 'name',
                render: (text) => {
                    var url = "/profiles/policy-profiles/" + text;
                    return <Link to={url}>{text}</Link>
                }
            },
            {
                title: 'Rule Count',
                dataIndex: 'rule_count'
            },
        ]
        return columns;
    }

    getEditorFields = () => {
        return [
            {
                type: 'input',
                name: 'name',
                label: 'Policy Profile Name',
                placeholder: 'policy1',
            },
        ]
    }
}

export default PolicyProfilesList;