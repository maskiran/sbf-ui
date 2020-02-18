import React from 'react';
import { Tabs } from 'antd';
import TLSProfilesList from './tls_profiles_list';
import CertificatesList from './certificates_list';

class TLSDashboard extends React.Component {

    handleTabClick = (tabKey) => {
        var url = "/profiles/" + tabKey;
        this.props.history.push(url)
    }

    render() {
        // instead of doing diff, the whole component is rerendered as the key changes
        return (
            <Tabs onTabClick={this.handleTabClick} key={this.props.match.params.type}
                activeKey={this.props.match.params.type}>
                <Tabs.TabPane key="tls-profiles" tab="Profiles" style={{marginTop: "15px"}}>
                    {this.props.match.params.type === "tls-profiles" ? <TLSProfilesList {...this.props}/> : null}
                </Tabs.TabPane>
                <Tabs.TabPane key="certificates" tab="Certificates" style={{marginTop: "15px"}}>
                    {this.props.match.params.type === "certificates" ? <CertificatesList {...this.props}/> : null}
                </Tabs.TabPane>
            </Tabs>
        )
    }
}

export default TLSDashboard;