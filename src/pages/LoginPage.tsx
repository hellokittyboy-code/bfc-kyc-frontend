import { useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Alert, Button, Card, Form, Input, Space, Typography } from 'antd'

import { useAuth } from '../app/useAuth'
import { apiRequest } from '../lib/api'

type LoginResponse = { token: string }

export default function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login } = useAuth()
  const from = useMemo(() => {
    const s = location.state as { from?: string } | null
    return s?.from || '/'
  }, [location.state])

  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const form = new FormData(e.target as HTMLFormElement)
      const username = String(form.get('username') || '')
      const password = String(form.get('password') || '')
      const data = await apiRequest<LoginResponse>('/login', {
        method: 'POST',
        body: JSON.stringify({ username, password }),
      })
      login(data.token)
      navigate(from, { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : '登录失败')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card style={{ maxWidth: 420, margin: '0 auto' }}>
      <Space direction="vertical" style={{ width: '100%' }} size="large">
        <div>
          <Typography.Title level={3} style={{ marginBottom: 0 }}>
            登录
          </Typography.Title>
          <Typography.Text type="secondary">
            默认 super_admin：用户名 admin，密码 admin
          </Typography.Text>
        </div>

        {error ? <Alert type="error" showIcon message={error} /> : null}

        <Form layout="vertical" onSubmitCapture={onSubmit} requiredMark={false}>
          <Form.Item
            label="用户名"
            name="username"
            rules={[{ required: true, message: '请输入用户名' }]}
          >
            <Input name="username" placeholder="admin" autoFocus />
          </Form.Item>
          <Form.Item
            label="密码"
            name="password"
            rules={[{ required: true, message: '请输入密码' }]}
          >
            <Input.Password name="password" placeholder="admin" />
          </Form.Item>

          <Button type="primary" htmlType="submit" loading={loading} block>
            登录
          </Button>
        </Form>

        <Space direction="vertical" style={{ width: '100%' }}>
          <Link to="/register/user">注册普通用户</Link>
          <Link to="/register/project">注册项目方</Link>
        </Space>
      </Space>
    </Card>
  )
}
