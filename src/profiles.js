import React from 'react';
import { Layout } from 'antd';
import ProfileMenu from './profile_sidebar';
import WAFProfilesList from './waf_profiles_list';
import WAFProfile from './waf_profile';

class Profile extends React.Component {
    getProfileComponent = () => {
        var component;
        switch (this.props.match.params.type) {
            case "waf": {
                if (this.props.match.params.name) {
                    component = <WAFProfile name={this.props.match.params.name}/>
                } else {
                    component = <WAFProfilesList {...this.props}/>
                }
                break;
            }
            case "tls": {
                component = <div>TLS</div>
                break
            }
            case "certificates": {
                component = <div>Certificates</div>
                break
            }
            case "ips": {
                component = <div>IPS Profiles</div>
                break
            }
            case "accounts": {
                component = <div>Cloud Accounts</div>
                break
            }
            case "addresses": {
                component = <div>Addresses</div>
                break
            }
            default: {
                component = <div>Profiles Home</div>
                break
            }
        }
        return component
    }

    render() {
        return (
            <Layout style={{ height: "calc(100vh - 64px)" }}>
                <Layout.Sider theme="light" collapsible={true}>
                    <ProfileMenu type={this.props.match.params.type} />
                </Layout.Sider>
                <Layout.Content style={{padding: "20px 20px"}}>
                    {this.getProfileComponent()}
                </Layout.Content>
            </Layout>
        )
    }
}

export default Profile;