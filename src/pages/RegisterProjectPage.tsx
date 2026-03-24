import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Alert, Button, Card, Form, Input, Space, Typography } from 'antd'

import { apiRequest } from '../lib/api'

type RegisterResponse = { registered: boolean; role: string }

export default function RegisterProjectPage() {
  const navigate = useNavigate()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [ok, setOk] = useState(false)

  async function onFinish(values: { username: string; password: string }) {
    setError('')
    setLoading(true)
    try {
      await apiRequest<RegisterResponse>('/register/project', {
        method: 'POST',
        body: JSON.stringify(values),
      })
      setOk(true)
      setTimeout(() => navigate('/login'), 300)
    } catch (err) {
      setError(err instanceof Error ? err.message : '注册失败')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card style={{ maxWidth: 420, margin: '0 auto' }}>
      <Space direction="vertical" style={{ width: '100%' }} size="large">
        <div>
          <Typography.Title level={3} style={{ marginBottom: 0 }}>
            注册项目方账号
          </Typography.Title>
          <Typography.Text type="secondary">注册完成后跳转到登录页</Typography.Text>
        </div>

        {ok ? <Alert type="success" showIcon message="注册成功，正在跳转登录..." /> : null}
        {error ? <Alert type="error" showIcon message={error} /> : null}

        <Form
          layout="vertical"
          onFinish={onFinish}
          requiredMark={false}
          disabled={loading}
        >
          <Form.Item
            label="用户名"
            name="username"
            rules={[{ required: true, message: '请输入用户名' }]}
          >
            <Input placeholder="proj1" />
          </Form.Item>
          <Form.Item
            label="密码"
            name="password"
            rules={[{ required: true, message: '请输入密码' }]}
          >
            <Input.Password placeholder="p1" />
          </Form.Item>
          <Button type="primary" htmlType="submit" loading={loading} block>
            注册
          </Button>
        </Form>

        <Space direction="vertical" style={{ width: '100%' }}>
          <Link to="/login">去登录</Link>
          <Link to="/register/user">注册普通用户</Link>
        </Space>
      </Space>
    </Card>
  )
}
