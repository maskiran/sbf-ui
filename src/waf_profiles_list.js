import React from 'react';
import axios from 'axios';
import qs from 'query-string';
import { Table, Input, Button, Modal, Form, Select, Icon } from 'antd';
import { Link } from 'react-router-dom';

class WAFProfileList extends React.Component {
    constructor(props) {
        super(props);
        // parse the search query params and assign to the state
        var queryParams = qs.parse(props.location.search);
        this.state = {
            wafProfiles: {},
            searchValue: queryParams.search || null,
            addWafProfileFormVisible: false,
            ruleSetVersions: [],
        }
        this.defaultPage = 1;
        this.defaultPageSize = 25;
        this.searchParams = {
            name: queryParams.search || null,
            page: queryParams.page || this.defaultPage,
            page_size: queryParams.page_size || this.defaultPageSize
        }
    }

    columns = [
        {
            title: 'Idx',
            key: 'idx',
            render: (text, record, index) => {
                return (this.state.wafProfiles.start_idx + index + 1)
            }
        },
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
        {
            title: 'Added On',
            dataIndex: 'date_added',
            render: (text) => {
                return new Date(text).toLocaleString()
            }
        },
        {
            title: 'Modified On',
            dataIndex: 'date_modified',
            render: (text) => {
                return new Date(text).toLocaleString()
            }
        },
        {
            title: '',
            key: 'actions',
            render: (text, record) => {
                return (
                    <div>
                        <Button onClick={() => this.deleteWafProfile(record)} type="link">
                            <Icon type="delete" />
                        </Button>
                    </div>
                )
            }
        }

    ]

    handlePagerClick = (page, pageSize) => {
        this.searchParams.page = page;
        this.searchParams.page_size = pageSize;
        this.changeBrowserUrl();
    }

    handleOnSearch = (val) => {
        if (val === "") val = null;
        this.searchParams.search = val;
        // reset the page number for a new search
        this.searchParams.page = 1;
        this.changeBrowserUrl();
    }

    handleInputChange = (e) => {
        this.setState({[e.target.name]: e.target.value})
    }

    createAddWafProfileForm = () => {
        var versions = this.state.ruleSetVersions.map(version => {
            return <Select.Option key={version}>{version}</Select.Option>
        })
        return (
            <Form colon={false} labelCol={{span: 6}} wrapperCol={{span: 18}}>
                <Form.Item label="WAF Profile Name">
                    <Input placeholder="waf1" name="newProfileName"
                        value={this.state.newProfileName}
                        onChange={this.handleInputChange}/>
                </Form.Item>
                <Form.Item label="Rule Set Version">
                    <Select value={this.state.newProfileRuleSetVersion}
                        showSearch
                        onChange={v => this.setState({newProfileRuleSetVersion: v})}>
                        {versions}
                    </Select>
                </Form.Item>
            </Form>
        )
    }

    showAddWafProfileForm = () => {
        this.setState({addWafProfileFormVisible: true})
    }

    addWafProfile = () => {
        var data = {
            name: this.state.newProfileName,
            rule_set_version: this.state.newProfileRuleSetVersion,
        }
        var url = "/api/waf-profiles";
        axios.post(url, data).then((rsp) => {
            this.props.history.push('/profiles/waf/' + this.state.newProfileName);
        }).catch(data => {
        })
    }

    deleteWafProfile = (record) => {
        var url = "/api/waf-profile/" + record.name;
        axios.delete(url).then((rsp) => {
            this.getWafProfiles();
        })
    }

    makeBrowserUrl = () => {
        var args = { ...this.searchParams };
        if (args.page === this.defaultPage) {
            delete args.page
        }
        if (args.page_size === this.defaultPageSize) {
            delete args.page_size
        }
        var params = qs.stringify(args, { skipNull: true });
        var url = this.props.location.pathname;
        if (params) {
            url += "?" + params;
        }
        return url
    }

    changeBrowserUrl = () => {
        var url = this.makeBrowserUrl()
        this.props.history.push(url);
    }

    getWafRuleSetVersions = () => {
        var url = '/api/waf-rule-sets/versions';
        axios.get(url).then(rsp => {
            this.setState({ruleSetVersions: rsp.data})
        })
    }

    getWafProfiles = () => {
        var url = "/api/waf-profiles?" + qs.stringify(this.searchParams, { skipNull: true });
        axios.get(url).then((rsp) => {
            this.setState({ wafProfiles: rsp.data });
        })
    }

    componentDidMount() {
        this.getWafProfiles();
        this.getWafRuleSetVersions();
    }

    componentDidUpdate(prevProps) {
        var oldUrl = prevProps.location.pathname + prevProps.location.search;
        var newUrl = this.makeBrowserUrl();
        if (newUrl !== oldUrl) {
            this.getWafProfiles();
        }
    }

    render() {
        return (
            <div>
                <Modal visible={this.state.addWafProfileFormVisible} title="Add WAF Profile"
                    width={"40%"}
                    onCancel={() => this.setState({addWafProfileFormVisible: false})}
                    onOk={this.addWafProfile}>
                    {this.createAddWafProfileForm()}
                </Modal>
                <div style={{ marginBottom: "10px" }}>
                    <Button style={{ float: "left" }} type="primary"
                        onClick={this.showAddWafProfileForm}>Add WAF Profile</Button>
                    <Input.Search style={{ float: "right", width: "25%" }}
                        name="searchValue"
                        placeholder="Search WAF Profiles"
                        value={this.state.searchValue}
                        onSearch={this.handleOnSearch}
                        onChange={this.handleInputChange} />
                    <div style={{ clear: "both" }} />
                </div>
                <Table dataSource={this.state.wafProfiles.items}
                    columns={this.columns} size="middle" bordered
                    rowKey="name"
                    pagination={{
                        pageSize: this.state.wafProfiles.page_size || 10,
                        total: this.state.wafProfiles.count,
                        current: this.state.wafProfiles.page,
                        onChange: this.handlePagerClick
                    }} />
            </div>
        )
    }
}

export default WAFProfileList;