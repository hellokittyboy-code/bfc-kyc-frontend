import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Alert, Button, Card, Form, Input, Space, Typography } from 'antd'

import { apiRequest } from '../lib/api'

type RegisterResponse = { registered: boolean; role: string }

export default function RegisterAdminPage() {
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [ok, setOk] = useState(false)

  async function onFinish(values: { username: string; password: string }) {
    setError('')
    setLoading(true)
    try {
      await apiRequest<RegisterResponse>('/register/admin', {
        method: 'POST',
        body: JSON.stringify({ username: values.username, password: values.password }),
      })
      setOk(true)
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
            注册管理员账号
          </Typography.Title>
          <Typography.Text type="secondary">注册提交后需超级管理员审批，通过后再登录使用</Typography.Text>
        </div>

        {ok ? (
          <Alert
            type="success"
            showIcon
            message="提交成功"
            description="请等待超级管理员审批通过后再登录使用"
          />
        ) : null}
        {error ? <Alert type="error" showIcon message={error} /> : null}

        <Form layout="vertical" onFinish={onFinish} requiredMark={false} disabled={loading}>
          <Form.Item label="用户名" name="username" rules={[{ required: true, message: '请输入用户名' }]}>
            <Input placeholder="admin1" />
          </Form.Item>
          <Form.Item label="密码" name="password" rules={[{ required: true, message: '请输入密码' }]}>
            <Input.Password placeholder="p1" />
          </Form.Item>
          <Button type="primary" htmlType="submit" loading={loading} block>
            注册
          </Button>
        </Form>

        <Space direction="vertical" style={{ width: '100%' }}>
          <Link to="/login">返回登录</Link>
          <Link to="/register/user">注册普通用户</Link>
          <Link to="/register/project">注册项目方</Link>
        </Space>
      </Space>
    </Card>
  )
}
