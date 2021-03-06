import React from 'react';
import { Menu, Icon } from 'antd';
import { Link } from 'react-router-dom';


class ServiceSidebar extends React.Component {
    render() {
        var serviceHome = "/service/" + this.props.name + "/home";
        var serviceLogs = "/service/" + this.props.name + "/logs";
        var serviceAudit = "/service/" + this.props.name + "/audit";
        // menu items to show in the sidebar
        // action is the word in the url that makes the menu item highlighted
        var menuItems = [
            {
                icon: 'home',
                text: this.props.name,
                url: serviceHome,
                action: 'home'
            },
            {
                icon: 'eye',
                text: 'Traffic Logs',
                url: serviceLogs,
                action: 'logs'
            },
            {
                icon: 'audit',
                text: 'Audit Logs',
                url: serviceAudit,
                action: 'audit'
            },
        ]
        var nodes = [];
        menuItems.map((item, idx) => {
            nodes.push(
                <Menu.Item key={item.action}>
                    <Link to={item.url}>
                        <Icon type={item.icon} />
                        <span>{item.text}</span>
                    </Link>
                </Menu.Item>
            )
            // to avoid linting errors
            return null;
        })
        return (
            <div>
                <Menu theme="light" selectedKeys={[this.props.action]}>
                    {nodes}
                </Menu>
            </div>
        )
    }
}

export default ServiceSidebar;