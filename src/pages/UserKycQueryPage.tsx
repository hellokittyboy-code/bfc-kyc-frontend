import { useState } from 'react'
import type { FormEvent } from 'react'
import { Alert, Button, Card, Descriptions, Form, Input, Space, Typography } from 'antd'

import { apiRequest } from '../lib/api'

type UserKycResponse = {
  user: {
    username: string
    name: string
    dob: string
    gender: string
    country: string
    role: string
  }
}

export default function UserKycQueryPage() {
  const [username, setUsername] = useState('')
  const [error, setError] = useState('')
  const [result, setResult] = useState<UserKycResponse | null>(null)
  const [loading, setLoading] = useState(false)

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setResult(null)
    setLoading(true)
    try {
      const data = await apiRequest<UserKycResponse>(`/api/kyc/users/${encodeURIComponent(username)}`)
      setResult(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : '查询失败')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card style={{ maxWidth: 720, margin: '0 auto' }}>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <div>
          <Typography.Title level={3} style={{ marginBottom: 0 }}>
            查询用户 KYC 信息
          </Typography.Title>
          <Typography.Text type="secondary">根据用户名查询用户的 KYC 字段</Typography.Text>
        </div>

        {error ? <Alert type="error" showIcon message={error} /> : null}

        <Form layout="inline" onSubmitCapture={onSubmit}>
          <Form.Item label="用户名">
            <Input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="u1" />
          </Form.Item>
          <Button type="primary" htmlType="submit" loading={loading} disabled={!username}>
            查询
          </Button>
        </Form>

        {result ? (
          <Descriptions title="用户" bordered size="small" column={1}>
            <Descriptions.Item label="username">{result.user.username}</Descriptions.Item>
            <Descriptions.Item label="role">{result.user.role}</Descriptions.Item>
            <Descriptions.Item label="name">{result.user.name}</Descriptions.Item>
            <Descriptions.Item label="dob">{result.user.dob}</Descriptions.Item>
            <Descriptions.Item label="gender">{result.user.gender}</Descriptions.Item>
            <Descriptions.Item label="country">{result.user.country}</Descriptions.Item>
          </Descriptions>
        ) : null}
      </Space>
    </Card>
  )
}
