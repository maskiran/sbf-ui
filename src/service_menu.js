import React from 'react';
import { Menu, Icon, Typography } from 'antd';
import { Link } from 'react-router-dom';


class ServiceMenu extends React.Component {
    render() {
        var serviceHome = "/service/" + this.props.name + "/home";
        var servicePolicy = "/service/" + this.props.name + "/policy";
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
                icon: 'safety',
                text: 'Policy',
                url: servicePolicy,
                action: 'policy'
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
                        {item.text}
                    </Link>
                </Menu.Item>
            )
            // to avoid linting errors
            return null;
        })
        return (
            <div>
                <Menu theme="light" selectedKeys={[this.props.action]}>
                    <Menu.Item key="-1">
                        <Typography.Title level={4}>Service Details</Typography.Title>
                    </Menu.Item>
                    {nodes}
                </Menu>
            </div>
        )
    }
}

export default ServiceMenu;