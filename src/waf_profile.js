import React from 'react';
import axios from 'axios';
import { Table, Button, Modal } from 'antd';
import WAFRuleSets from './waf_rule_sets';

class WAFProfile extends React.Component {
    state = {
        wafProfile: {},
        wafProfileRuleSets: [],
        wafProfileUpdatedRuleSets: [],
        wafRuleSetsVisible: false,
    }

    getWafProfile = () => {
        var url = '/api/waf-profile/' + this.props.name;
        axios.get(url).then(rsp => {
            this.setState({ wafProfile: rsp.data })
        })
    }

    getWafProfileRuleSets = () => {
        var url = '/api/waf-profile-rule-sets/' + this.props.name + '?page_size=-1';
        axios.get(url).then(rsp => {
            this.setState({
                wafProfileRuleSets: rsp.data['items'],
                wafProfileUpdatedRuleSets: rsp.data['items']
            })
        })
    }

    updateWafProfileRuleSets = () => {
        var url = '/api/waf-profile-rule-sets/' + this.props.name;
        var data = {
            replace: true,
            rule_set_list: this.state.wafProfileUpdatedRuleSets.map(item=>item.rule_set_name)
        };
        axios.post(url, data).then(rsp => {
            this.getWafProfileRuleSets();
            this.setState({wafRuleSetsVisible: false})
        });
    }

    showWafRuleSets = () => {
        this.setState({wafRuleSetsVisible: true})
    }

    handleCancel = () => {
        // restore the original rule sets that were available with the component
        this.setState({
            wafRuleSetsVisible: false,
            wafProfileUpdatedRuleSets: this.state.wafProfileRuleSets
        });
    }

    componentDidMount() {
        this.getWafProfile();
        this.getWafProfileRuleSets();
    }

    renderWafProfile = () => {
        // rearrange data to be displayable in table
        var data = [
            { key: 'Profile Name', value: this.state.wafProfile.name },
            { key: 'Rule Set Version', value: this.state.wafProfile.rule_set_version },
        ];
        var columns = [
            {
                title: '',
                dataIndex: 'key',
                className: 'td-fit',
            },
            {
                title: '',
                dataIndex: 'value',
            }
        ];
        return <Table columns={columns} dataSource={data} showHeader={false}
            bordered2 pagination={false} style={{ marginBottom: "25px" }} />
    }

    renderWafProfileRuleSets = () => {
        var columns = [
            {
                title: '',
                key: 'idx',
                render: (text, record, index) => {
                    return index + 1
                },
                className: 'td-fit',
            },
            {
                title: (
                    <div>
                        Rule Set Name
                        <Button type="link" onClick={this.showWafRuleSets}>Update Rules</Button>
                    </div>
                ),
                dataIndex: 'rule_set_name',
            },
        ];
        return (
            <div>
                <Table columns={columns} dataSource={this.state.wafProfileRuleSets}
                    rowKey="rule_set_name" rowClassName="tr-very-small"
                    pagination={false} bordered />
            </div>
        )
    }

    getUpdatedWafRuleSets = (newRuleSets) => {
        newRuleSets = newRuleSets.map(item => {
            return {rule_set_name: item}
        })
        this.setState({wafProfileUpdatedRuleSets: newRuleSets});
    }

    renderWafRuleSets = () => {
        return (
            <Modal visible={this.state.wafRuleSetsVisible} title="WAF Rule Sets"
                width={"80vw"}
                onCancel={this.handleCancel}
                onOk={this.updateWafProfileRuleSets}>
                <WAFRuleSets version={this.state.wafProfile.rule_set_version}
                    selectedRuleSets={this.state.wafProfileUpdatedRuleSets.map(item=>item.rule_set_name)}
                    onChange={this.getUpdatedWafRuleSets} />
            </Modal>
        )
    }

    render() {
        return (
            <div>
                {this.renderWafProfile()}
                {this.renderWafProfileRuleSets()}
                {this.renderWafRuleSets()}
            </div>
        )
    }
}

export default WAFProfile;