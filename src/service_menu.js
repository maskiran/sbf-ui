import React from 'react';
import { Menu, Icon, Typography } from 'antd';
import { Link } from 'react-router-dom';


class ServiceMenu extends React.Component {
    render() {
        var serviceHome = "/service/" + this.props.name;
        var servicePolicy = "/service/" + this.props.name + "/policy";
        var serviceLogs = "/service/" + this.props.name + "/logs";
        var serviceAudit = "/service/" + this.props.name + "/audit";
        var menuItems = [
            {
                icon: 'home',
                text: this.props.name,
                url: serviceHome
            },
            {
                icon: 'safety',
                text: 'Policy',
                url: servicePolicy
            },
            {
                icon: 'eye',
                text: 'Traffic Logs',
                url: serviceLogs
            },
            {
                icon: 'audit',
                text: 'Audit Logs',
                url: serviceAudit
            },
        ]
        var nodes = [];
        menuItems.map((item, idx) => {
            nodes.push(
                <Menu.Item key={idx}>
                    <Link to={item.url}>
                        <Icon type={item.icon} />
                        {item.text}
                    </Link>
                </Menu.Item>
            )
        })
        return (
            <div>
                <Menu theme="light">
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