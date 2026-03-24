import { useState } from 'react'
import type { FormEvent } from 'react'
import { Alert, Button, Card, Form, Input, Space, Table, Tag, Typography } from 'antd'
import { useLocation } from 'react-router-dom'

import { useAuth } from '../app/useAuth'
import { apiRequest } from '../lib/api'

type TagsResponse = { tags: Record<string, boolean> }

export default function UserProjectTagsPage() {
  const { auth } = useAuth()
  const location = useLocation()
  const search = new URLSearchParams(location.search)
  const [username, setUsername] = useState(search.get('username') || auth.subject || '')
  const [projectId, setProjectId] = useState(search.get('projectId') || '1')
  const [error, setError] = useState('')
  const [result, setResult] = useState<TagsResponse | null>(null)
  const [loading, setLoading] = useState(false)

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setResult(null)
    setLoading(true)
    try {
      const data = await apiRequest<TagsResponse>(
        `/api/match/users/${encodeURIComponent(username)}/projects/${projectId}/tags`,
      )
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
            查询用户对项目的公共约束标签
          </Typography.Title>
          <Typography.Text type="secondary">返回该用户在该项目规则下的标签布尔值集合</Typography.Text>
        </div>

        {error ? <Alert type="error" showIcon message={error} /> : null}

        <Form layout="inline" onSubmitCapture={onSubmit}>
          <Form.Item label="用户名">
            <Input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="u1" />
          </Form.Item>
          <Form.Item label="Project ID">
            <Input value={projectId} onChange={(e) => setProjectId(e.target.value)} placeholder="1" />
          </Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            disabled={!username || !projectId}
          >
            查询
          </Button>
        </Form>

        {result ? (
          <Table
            size="small"
            pagination={false}
            rowKey={(r) => r.key}
            dataSource={Object.entries(result.tags || {}).map(([k, v]) => ({ key: k, pass: v }))}
            columns={[
              { title: 'Tag', dataIndex: 'key' },
              {
                title: 'Value',
                dataIndex: 'pass',
                render: (v: boolean) => (v ? <Tag color="green">true</Tag> : <Tag color="red">false</Tag>),
              },
            ]}
          />
        ) : null}
      </Space>
    </Card>
  )
}
