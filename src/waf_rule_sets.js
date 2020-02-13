import React from 'react';
import axios from 'axios';
import { Transfer } from 'antd';

class WAFRuleSets extends React.Component {
    // props: version, selectedRuleSets, onChange
    constructor(props) {
        super(props);
        this.state = {
            wafRuleSets: [],
            selectedRuleSets: props.selectedRuleSets
        }
    }

    getWafRuleSets = () => {
        var url = '/api/waf-rule-sets?page=-1&version=' + this.props.version;
        axios.get(url).then(rsp => {
            // add a lower case name for easier search
            rsp.data.items.map(item => {
                item.lname = item.name.toLowerCase();
                return null
            })
            this.setState({ wafRuleSets: rsp.data.items });
        })
    }

    componentDidMount() {
        this.getWafRuleSets()
    }

    componentDidUpdate(prevProps, prevState) {
        if (this.props.version !== prevProps.version) {
            this.getWafRuleSets();
        }
        // if props.selectedRuleSets changed, then update the current state
        if (this.props.selectedRuleSets.join("") !== prevProps.selectedRuleSets.join("")) {
            this.setState({selectedRuleSets: this.props.selectedRuleSets});
        }
    }

    handleSelectChange = (sourceKeys, targetKeys) => {
        var selections = this.state.selectedRuleSets;
        if (sourceKeys) {
            selections = selections.concat(sourceKeys);
        }
        // if targetKeys are selected, they must be removed from the selections
        selections = selections.filter(item => {
            if (targetKeys.indexOf(item) >= 0) {
                return false
            }
            return true
        })
        this.setState({selectedRuleSets: selections});
        this.props.onChange(selections);
    }

    handleFilter = (searchValue, option) => {
        searchValue = searchValue.toLowerCase()
        // for case insensitive search
        return option.lname.indexOf(searchValue.toLowerCase()) > -1
    }

    renderWafRuleSets = () => {
        // each list item covers 50% minus 20px for the operation
        return (
            <Transfer dataSource={this.state.wafRuleSets}
                onSelectChange={this.handleSelectChange}
                filterOption={this.handleFilter}
                selectedKeys={[]}
                targetKeys={this.state.selectedRuleSets}
                showSearch
                rowKey={item=>item.name} listStyle={{width: "calc(50% - 20px)", height:"60vh"}}
                lazy={false}
                render={item => item.name} />
        )
    }

    render() {
        return this.renderWafRuleSets();
    }
}

export default WAFRuleSets;