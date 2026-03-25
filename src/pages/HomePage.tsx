import { Link } from 'react-router-dom'
import { Card, Col, Row, Space, Typography } from 'antd'

import { useAuth } from '../app/useAuth'

export default function HomePage() {
  const { auth } = useAuth()

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <div>
        <Typography.Title level={2} style={{ marginBottom: 0 }}>
          KYC Constraints Platform
        </Typography.Title>
        <Typography.Text type="secondary">
          项目方定义规则，用户提交信息，系统计算匹配结果与标签（后端 Casbin + JWT + Postgres/GORM）。
        </Typography.Text>
      </div>

      {!auth.token ? (
        <Row gutter={[16, 16]}>
          <Col xs={24} md={6}>
            <Card title="登录" actions={[<Link to="/login">进入</Link>]}>
              进入系统后可进行 KYC、项目规则与匹配查询。
            </Card>
          </Col>
          <Col xs={24} md={6}>
            <Card title="注册普通用户" actions={[<Link to="/register/user">进入</Link>]}>
              普通用户提交 KYC 后，可查询匹配项目与标签。
            </Card>
          </Col>
          <Col xs={24} md={6}>
            <Card title="注册项目方" actions={[<Link to="/register/project">进入</Link>]}>
              项目方注册提交后需超级管理员审批，通过后可创建规则与查询。
            </Card>
          </Col>
          <Col xs={24} md={6}>
            <Card title="注册管理员" actions={[<Link to="/register/admin">进入</Link>]}>
              管理员注册提交后需超级管理员审批，通过后可登录使用。
            </Card>
          </Col>
        </Row>
      ) : (
        auth.role === 'super_admin' ? (
          <Row gutter={[16, 16]}>
            <Col xs={24} md={12}>
              <Card title="审批" actions={[<Link to="/admin">进入</Link>]}>
                审批管理员/项目方注册申请。
              </Card>
            </Col>
            <Col xs={24} md={12}>
              <Card title="提交国家规则" actions={[<Link to="/projects/rules/create">进入</Link>]}>
                提交项目规则（国家/年龄/性别）。
              </Card>
            </Col>
          </Row>
        ) : (
          <Row gutter={[16, 16]}>
            <Col xs={24} md={8}>
              <Card
                title="KYC"
                actions={[
                  ...(auth.role === 'user'
                    ? [<Link to="/kyc/submit">提交</Link>, <Link to="/match/projects">查询匹配策略</Link>]
                    : [<Link to="/users/kyc/query">查询</Link>]),
                ]}
              >
                管理/提交个人 KYC 信息。
              </Card>
            </Col>
            <Col xs={24} md={8}>
              <Card
                title="项目规则"
                actions={[
                  <Link to="/projects/rules/create">创建</Link>,
                  <Link to="/projects/rules/list">列表</Link>,
                  <Link to="/projects/rules/query">按ID查询</Link>,
                  <Link to="/projects/rules/query-by-name">按名称查询</Link>,
                  <Link to="/projects/search">搜索</Link>,
                ]}
              >
                项目方定义约束规则（国家/年龄/性别）。
              </Card>
            </Col>
            <Col xs={24} md={8}>
              <Card
                title="匹配"
                actions={[<Link to="/match/projects">项目列表</Link>, <Link to="/match/tags">标签详情</Link>]}
              >
                计算用户与项目规则是否匹配，并返回标签。
              </Card>
            </Col>
          </Row>
        )
      )}
    </Space>
  )
}
