import React from 'react';
import { Input, Tag, Menu, Dropdown, Button, DatePicker } from 'antd';
import { CloseOutlined } from '@ant-design/icons';

const searchBarStyle = {
    border: "1px solid #d9d9d9",
    padding: "4px",
    borderRadus: "2px",
    display: "flex"
}

export default class Searchbar extends React.Component {
    /*
    props:
    options: list of object with label and value [{label: x, value: x1}, ..]
    onChange: function called when filters change, with the 
              current list of filters, list of datevalues
              ([k1:v1, k2:v2], [start, end])
    defaultValue: [list of filters (k:v) to prefill the data]
    datepicker: true/false
    dateValues: [start, end time]
    */
    searchInputRef = React.createRef(); // to enable focus on the input
    state = {
        searchInput: "",
        searchFilters: this.props.defaultValue || [],
        optionsVisible: false,
        filteredOptions: this.props.options || [],
        activeMenuItemIdx: -1,
        dateValues: this.props.dateValues || [],
    }

    componentDidUpdate(prevProps) {
        if (JSON.stringify(prevProps.defaultValue) !== JSON.stringify(this.props.defaultValue)) {
            this.setState({ searchFilters: this.props.defaultValue });
        }
        if (JSON.stringify(prevProps.dateValues) !== JSON.stringify(this.props.dateValues)) {
            this.setState({ dateValues: this.props.dateValues });
        }
    }

    render() {
        return <div>
            {this.props.datepicker &&
                <DatePicker.RangePicker style={{ float: "left", marginRight: "8px" }}
                    className="logs-datepicker"
                    showTime={{ format: 'HH:mm:ss' }}
                    value={this.state.dateValues}
                    onChange={this.onDateChange}
                />
            }
            <div style={searchBarStyle}>
                {this.state.searchFilters.map((item, idx) =>
                    <Tag key={idx} style={{ fontSize: "100%" }}>
                        {item}
                        <CloseOutlined style={{ fontSize: "80%", marginLeft: "10px" }}
                            onClick={() => this.deleteSearchFilter(item)} />
                    </Tag>)
                }
                {this.renderInputAndOptions()}
                <Button icon={<CloseOutlined style={{ fontSize: "80%" }} />} onClick={this.clearSearch} type="link" size="small"
                    style={{ position: "absolute", right: "5px", padding: "0px", margin: "0px" }} />
            </div>
        </div>
    }

    renderInputAndOptions = () => {
        var menuItems = this.state.filteredOptions.map(item => {
            return <Menu.Item key={item.value}> {item.label} </Menu.Item>
        });
        var activeKey = "";
        if (this.state.filteredOptions[this.state.activeMenuItemIdx]) {
            activeKey = this.state.filteredOptions[this.state.activeMenuItemIdx].value;
        }
        const menu = <Menu onClick={this.onOptionSelect}
            selectedKeys={activeKey}> {menuItems} </Menu>
        return <Dropdown overlay={menu} visible={this.state.optionsVisible}
            trigger="click" onVisibleChange={this.onOptionsVisibleChange}>
            <Input ref={this.searchInputRef}
                size="small"
                style={{ padding: "0px 0px 0px 8px", }}
                value={this.state.searchInput}
                onKeyDown={this.onSearchKeyDown}
                onChange={this.onSearchChange}
                onPressEnter={this.onSearchPressEnter}
                bordered={false}
            />
        </Dropdown>
    }

    onSearchKeyDown = (e) => {
        // handle arrow up/down when the options are visible
        if (!this.state.optionsVisible) {
            return
        }
        // 40 downarrow, 38 up arrow
        const ARROW_DOWN = 40;
        const ARROW_UP = 38;
        var idx;
        if (e.keyCode === ARROW_DOWN) {
            idx = this.state.activeMenuItemIdx + 1;
            if (idx >= this.state.filteredOptions.length) {
                idx = this.state.filteredOptions.length - 1;
            }
        } else if (e.keyCode === ARROW_UP) {
            idx = this.state.activeMenuItemIdx - 1;
            if (idx < 0) {
                idx = 0;
            }
        }
        if (e.keyCode === ARROW_DOWN || e.keyCode === ARROW_UP) {
            // dont move the cursor to the start/end in input box
            e.preventDefault();
            // if the filtered options is empty (not matching any user typed)
            // dont set/modify searchinput
            this.setState({
                activeMenuItemIdx: idx,
            })
            if (this.state.filteredOptions.length) {
                this.setState({
                    searchInput: this.state.filteredOptions[idx].value + ':',
                })
            }
        } else {
            // reset activemenuidx to -1 when any other key is pressed
            this.setState({ activeMenuItemIdx: -1 })
        }
    }

    onSearchChange = (e) => {
        var textSoFar = e.target.value.toLowerCase();
        // if text has colon, then hide the options
        var optionsVisible = true;
        if (textSoFar.indexOf(':') >= 0) {
            optionsVisible = false;
        }
        // filter options if the dropdown is visible
        var filteredOptions = [];
        if (optionsVisible) {
            // search label and value for the match
            filteredOptions = (this.props.options || []).filter(item => {
                return (item.label.toLowerCase().search(textSoFar) >= 0 ||
                    item.value.toLowerCase().search(textSoFar) >= 0)
            })
        }
        this.setState({
            searchInput: e.target.value,
            filteredOptions: filteredOptions,
            optionsVisible: optionsVisible,
        })
    }

    onSearchPressEnter = () => {
        // search input must have k:v format
        var textSoFar = this.state.searchInput;
        // if text ends with : hide the options
        if (textSoFar.endsWith(':')) {
            this.setState({ optionsVisible: false })
            return
        }
        var [key, ...val] = textSoFar.split(':');
        // val could have colon (e.g timestamp)
        val = val.join(':');
        if (!key || !val) {
            // both dont exist, nothing to do, enter is not valid
            return
        }
        // additionally you can check if the key is a valid option
        // append the search filter to the existing ones
        var searchFilters = [...this.state.searchFilters, this.state.searchInput];
        this.prepareForNewSearch(searchFilters);
    }

    deleteSearchFilter = (key) => {
        var searchFilters = [...this.state.searchFilters];
        const idx = searchFilters.indexOf(key);
        if (idx >= 0) {
            searchFilters.splice(idx, 1)
        }
        this.setState({ searchFilters: searchFilters })
        // call the parent caller's onChange
        if (this.props.onChange) {
            this.props.onChange(searchFilters)
        }
    }

    clearSearch = () => {
        this.prepareForNewSearch([]);
    }

    prepareForNewSearch = (searchFilters) => {
        this.setState({
            searchFilters: searchFilters,
            searchInput: "",
            optionsVisible: true,
            filteredOptions: this.props.options || [],
            activeMenuItemIdx: -1,
        })
        this.searchInputRef.current.focus();
        // call the parent caller's onChange
        if (this.props.onChange) {
            this.props.onChange(searchFilters, this.state.dateValues);
        }
    }
    
    onDateChange = (v) => {
        this.setState({dateValues: v});
        if (this.props.onChange) {
            this.props.onChange(this.state.searchFilters, v);
        }
    }

    onOptionSelect = (e) => {
        this.setState({
            searchInput: e.key + ':',
            optionsVisible: false,
        })
        this.searchInputRef.current.focus();
    }

    onOptionsVisibleChange = (visible) => {
        // the dropdown visibility is controlled by a state variable. When the dropdown
        // is visible and user clicks somewhere else, it needs to be hidden. this method
        // is called on dropdown even handler and sets the state variable
        this.setState({ optionsVisible: visible });
    }
}
