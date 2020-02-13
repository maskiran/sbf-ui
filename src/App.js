import React from 'react';
import { HashRouter, Link } from 'react-router-dom';
import { Layout, Menu, Icon } from 'antd';
import Routes from './routes';
import logo from './logo.svg';
import 'antd/dist/antd.css';
import './App.css';


const HeaderContent = (
    <div>
        <div className="logo">
            <img src={logo} alt="logo" />
        </div>
        <Menu theme="dark" mode="horizontal" style={{ lineHeight: '64px', float: 'left' }}>
            <Menu.Item key="1">
                <Link to="/">
                    <Icon type="dashboard" />
                    Home
                </Link>
            </Menu.Item>
            <Menu.Item key="2">
                <Link to="/services">
                    <Icon type="safety" />
                    Services
                </Link>
            </Menu.Item>
            <Menu.Item key="3">
                <Link to="/profiles/home">
                    <Icon type="profile" />
                    Manage Profiles
                </Link>
            </Menu.Item>
        </Menu>
        <Menu theme="dark" mode="horizontal" style={{ lineHeight: '64px', float: 'right' }}>
            <Menu.Item key="1">
                <Icon type="user" />
                User
            </Menu.Item>
        </Menu>
    </div>
);

class App extends React.Component {
    render() {
        return (
            <HashRouter>
                <Layout style={{ minHeight: "100vh" }}>
                    <Layout.Header>{HeaderContent}</Layout.Header>
                    <Layout.Content>{Routes}</Layout.Content>
                </Layout>
            </HashRouter>
        )
    }
}

export default App;