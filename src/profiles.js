import React from 'react';
import { Layout } from 'antd';
import ProfileMenu from './profile_sidebar';
import WAFProfilesList from './waf_profiles_list';
import WAFProfile from './waf_profile';
import PolicyProfilesList from './policy_profiles_list';
import PolicyProfile from './policy_profile';
import TLSDashboard from './tls_dashboard';
import KubeProfilesList from './kube_profiles_list'

class Profile extends React.Component {
    getProfileComponent = () => {
        var component;
        switch (this.props.match.params.type) {
            case "policy-profiles": {
                if (this.props.match.params.name) {
                    component = <PolicyProfile {...this.props} />
                } else {
                    component = <PolicyProfilesList {...this.props} />
                }
                break;
            }
            case "waf-profiles": {
                if (this.props.match.params.name) {
                    component = <WAFProfile name={this.props.match.params.name} />
                } else {
                    component = <WAFProfilesList {...this.props} />
                }
                break;
            }
            case "tls-profiles": {
                component = <TLSDashboard {...this.props} />
                break
            }
            case "certificates": {
                component = <TLSDashboard {...this.props} />
                break
            }
            case "ips": {
                component = <div>IPS Profiles</div>
                break
            }
            case "kubernetes": {
                component = <KubeProfilesList {...this.props} />
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
        var selectedKey = this.props.match.params.type;
        if (selectedKey === "certificates") {
            selectedKey = "tls-profiles"
        }
        return (
            <Layout style={{ height: "calc(100vh - 64px)" }}>
                <Layout.Sider theme="light" collapsible={true}>
                    <ProfileMenu type={selectedKey} />
                </Layout.Sider>
                <Layout.Content style={{ padding: "16px 20px" }}>
                    {this.getProfileComponent()}
                </Layout.Content>
            </Layout>
        )
    }
}

export default Profile;