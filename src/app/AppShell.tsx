import { useEffect, useMemo } from 'react'
import type { ReactNode } from 'react'
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import {
  ApiOutlined,
  FileSearchOutlined,
  HomeOutlined,
  IdcardOutlined,
  LogoutOutlined,
  LoginOutlined,
  SafetyCertificateOutlined,
  SettingOutlined,
  TagsOutlined,
  UnorderedListOutlined,
  UserAddOutlined,
  UserOutlined,
} from '@ant-design/icons'
import { Button, Dropdown, Layout, Menu, Space, Typography, message } from 'antd'
import type { MenuProps } from 'antd'

import { useAuth } from './useAuth'

type MenuItem = Required<MenuProps>['items'][number]
type MenuItemWithKey = MenuItem & { key: string }

const { Header, Content, Sider } = Layout

export default function AppShell() {
  const { auth, logout, isExpired } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    if (auth.token && isExpired) {
      logout()
      message.warning('登录已过期，请重新登录')
      navigate('/login', { replace: true })
    }
  }, [auth.token, isExpired, logout, navigate])

  const items = useMemo<MenuProps['items']>(() => {
    const item = (
      label: ReactNode,
      key: string,
      icon?: ReactNode,
      children?: MenuItem[],
    ): MenuItem => ({ key, icon, label, children })

    const kycChildren: MenuItem[] =
      auth.role === 'user'
        ? [
            item(<Link to="/kyc/submit">提交KYC</Link>, '/kyc/submit', <IdcardOutlined />),
            item(<Link to="/match/projects">查询匹配策略</Link>, '/match/projects', <FileSearchOutlined />),
          ]
        : auth.role === 'admin' || auth.role === 'project'
          ? [item(<Link to="/users/kyc/query">查询用户KYC</Link>, '/users/kyc/query', <FileSearchOutlined />)]
          : []

    const projectChildren: MenuItem[] = [
      ...(auth.role === 'admin' || auth.role === 'super_admin' || auth.role === 'project'
        ? [item(<Link to="/projects/rules/create">创建规则</Link>, '/projects/rules/create', <UnorderedListOutlined />)]
        : []),
      item(<Link to="/projects/rules/list">规则列表</Link>, '/projects/rules/list', <UnorderedListOutlined />),
      item(<Link to="/projects/rules/query">查询规则</Link>, '/projects/rules/query', <FileSearchOutlined />),
      item(<Link to="/projects/rules/query-by-name">按名称查询</Link>, '/projects/rules/query-by-name', <FileSearchOutlined />),
      item(<Link to="/projects/search">搜索项目</Link>, '/projects/search', <FileSearchOutlined />),
    ]

    const base: MenuItemWithKey[] = [
      item(<Link to="/">概览</Link>, '/', <HomeOutlined />) as MenuItemWithKey,
      item(<Link to="/admin">超级管理员</Link>, '/admin', <SettingOutlined />) as MenuItemWithKey,
      item('KYC', 'kyc', <SafetyCertificateOutlined />, kycChildren) as MenuItemWithKey,
      item('项目规则', 'project', <UnorderedListOutlined />, projectChildren) as MenuItemWithKey,
      item('匹配', 'match', <TagsOutlined />, [
        item(<Link to="/match/projects">匹配项目</Link>, '/match/projects', <UnorderedListOutlined />),
        item(<Link to="/match/tags">标签详情</Link>, '/match/tags', <TagsOutlined />),
      ]) as MenuItemWithKey,
      item(
        <a href="/docs" target="_blank" rel="noreferrer">
          API 文档
        </a>,
        'api',
        <ApiOutlined />,
      ) as MenuItemWithKey,
    ]

    if (!auth.token) {
      return [
        item(<Link to="/">概览</Link>, '/', <HomeOutlined />),
        item(<Link to="/login">登录</Link>, '/login', <LoginOutlined />),
        item('注册', 'register', <UserAddOutlined />, [
          item(<Link to="/register/user">普通用户</Link>, '/register/user', <UserOutlined />),
          item(<Link to="/register/project">项目方</Link>, '/register/project', <UnorderedListOutlined />),
          item(<Link to="/register/admin">管理员</Link>, '/register/admin', <SettingOutlined />),
        ]),
        item(
          <a href="/docs" target="_blank" rel="noreferrer">
            API 文档
          </a>,
          'api',
          <ApiOutlined />,
        ),
      ]
    }

    if (auth.role === 'project') {
      return base.filter((i) => i.key === '/' || i.key === 'project' || i.key === 'api')
    }

    if (auth.role === 'user') {
      return base.filter((i) => i.key === '/' || i.key === 'kyc' || i.key === 'match' || i.key === 'api')
    }

    if (auth.role === 'admin') {
      return base
    }

    if (auth.role === 'super_admin') {
      return [
        item(<Link to="/admin">审批</Link>, '/admin', <SettingOutlined />),
        item(<Link to="/projects/rules/create">提交规则</Link>, '/projects/rules/create', <UnorderedListOutlined />),
      ]
    }

    return base.filter((i) => i.key !== '/admin')
  }, [auth.role, auth.token])

  const selectedKeys = useMemo(() => {
    const p = location.pathname
    return [p]
  }, [location.pathname])

  const userMenuItems = useMemo(
    () => [
      {
        key: 'logout',
        icon: <LogoutOutlined />,
        label: '退出登录',
        onClick: () => {
          logout()
          navigate('/login')
        },
      },
    ],
    [logout, navigate],
  )

  return (
    <Layout style={{ minHeight: '100svh' }}>
      <Sider breakpoint="lg" collapsedWidth={56}>
        <div style={{ padding: 16 }}>
          <Typography.Title level={5} style={{ color: '#fff', margin: 0 }}>
            KYC
          </Typography.Title>
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={selectedKeys}
          items={items}
        />
      </Sider>
      <Layout>
        <Header style={{ background: 'transparent', paddingInline: 16 }}>
          <Space style={{ width: '100%', justifyContent: 'space-between' }}>
            <Space>
              <Typography.Text strong>KYC Constraints Platform</Typography.Text>
            </Space>
            <Space>
              {auth.token ? (
                <Dropdown menu={{ items: userMenuItems }}>
                  <Button icon={<UserOutlined />}>
                    {auth.subject || auth.userId || 'Account'}
                  </Button>
                </Dropdown>
              ) : (
                <Button type="primary" onClick={() => navigate('/login')}>
                  登录
                </Button>
              )}
            </Space>
          </Space>
        </Header>
        <Content style={{ padding: 16 }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  )
}
