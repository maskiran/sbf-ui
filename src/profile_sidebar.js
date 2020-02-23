import React from 'react';
import { Menu, Icon } from 'antd';
import { Link } from 'react-router-dom';


class ProfileMenu extends React.Component {
    render() {
        var profileHome = "/profiles/home";
        var wafProfiles = "/profiles/waf-profiles";
        var policyProfiles = "/profiles/policy-profiles";
        var tlsProfiles = "/profiles/tls-profiles";
        var ipsProfiles = "/profiles/ips";
        var kubernetes = "/profiles/kubernetes";
        var addressObjects = "/profiles/addresses";
        // menu items to show in the sidebar
        // key is the key for the menu item. The type field in the url
        // is matched with the key value to highlight the menu item
        var menuItems = [
            {
                icon: 'home',
                text: 'Profiles Home',
                url: profileHome,
                key: 'home'
            },
            {
                icon: 'safety',
                text: 'Policy Sets',
                url: policyProfiles,
                key: 'policy-profiles'
            },
            {
                icon: 'global',
                text: 'WAF Profiles',
                url: wafProfiles,
                key: 'waf-profiles'
            },
            {
                icon: 'lock',
                text: 'TLS / Certificates',
                url: tlsProfiles,
                key: 'tls-profiles'
            },
            {
                icon: 'eye',
                text: 'IPS Profiles',
                url: ipsProfiles,
                key: 'ips'
            },
            {
                icon: 'cloud',
                text: 'Kubernetes Configs',
                url: kubernetes,
                key: 'kubernetes'
            },
            {
                icon: 'contacts',
                text: 'Addresses',
                url: addressObjects,
                key: 'addresses'
            },
        ]
        var nodes = [];
        menuItems.map((item, idx) => {
            nodes.push(
                <Menu.Item key={item.key}>
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
                <Menu theme="light" selectedKeys={[this.props.type]}>
                    {nodes}
                </Menu>
            </div>
        )
    }
}

export default ProfileMenu;