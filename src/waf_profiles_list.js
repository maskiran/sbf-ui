import React from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import ItemsList from './items_list';

class WAFProfilesList extends React.Component {
    state = {
        wafRuleSetVersions: []
    }

    componentDidMount() {
        this.getWafRuleSetVersions();
    }

    render() {
        return <ItemsList
            {...this.props}
            editorTitle="Add WAF Profile"
            addButtonTitle="Add WAF Profile"
            itemsListUrl="/api/waf-profiles"
            deleteItemBaseUrl="/api/waf-profile/"
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
                    var url = "/profiles/waf/" + text;
                    return <Link to={url}>{text}</Link>
                }
            },
            {
                title: 'Rule Set Version',
                dataIndex: 'rule_set_version'
            },
        ]
        return columns;
    }

    getEditorFields = () => {
        return [
            {
                type: 'input',
                name: 'name',
                label: 'WAF Profile Name',
                placeholder: 'waf1',
            },
            {
                type: 'select',
                name: 'rule_set_version',
                label: 'Rule Set Version',
                options: this.state.wafRuleSetVersions,
            }
        ]
    }

    getWafRuleSetVersions = () => {
        var url = '/api/waf-rule-sets/versions';
        axios.get(url).then(rsp => {
            this.setState({ wafRuleSetVersions: rsp.data })
        })
    }

}

export default WAFProfilesList;