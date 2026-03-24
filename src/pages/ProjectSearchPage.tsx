import { useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { Alert, Button, Card, Form, Input, Space, Table, Typography } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { Link, useLocation } from 'react-router-dom'

import { apiRequest } from '../lib/api'

type ProjectItem = {
  id: number
  uuid: string
  name: string
  owner: string
  website?: string
}

type SearchResponse = {
  items: ProjectItem[]
  total: number
}

export default function ProjectSearchPage() {
  const location = useLocation()
  const search = useMemo(() => new URLSearchParams(location.search), [location.search])
  const [q, setQ] = useState(search.get('q') || '')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<SearchResponse | null>(null)

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    const query = q.trim()
    if (!query) return
    setError('')
    setResult(null)
    setLoading(true)
    try {
      const data = await apiRequest<SearchResponse>(`/api/projects/search?q=${encodeURIComponent(query)}&limit=50`)
      setResult(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : '查询失败')
    } finally {
      setLoading(false)
    }
  }

  const columns = useMemo<ColumnsType<ProjectItem>>(
    () => [
      { title: 'ID', dataIndex: 'id', width: 90 },
      { title: '名称', dataIndex: 'name', width: 220 },
      { title: 'Owner', dataIndex: 'owner', width: 140 },
      {
        title: 'Website',
        dataIndex: 'website',
        render: (v?: string) =>
          v ? (
            <a href={v} target="_blank" rel="noreferrer">
              {v}
            </a>
          ) : (
            '-'
          ),
      },
      {
        title: '操作',
        width: 240,
        render: (_, r) => (
          <Space>
            <Link to={`/projects/rules/query?projectId=${r.id}`}>按ID查看规则</Link>
            <Link to={`/projects/rules/query-by-name?name=${encodeURIComponent(r.name)}`}>按名称查看</Link>
          </Space>
        ),
      },
    ],
    [],
  )

  return (
    <Card style={{ maxWidth: 900, margin: '0 auto' }}>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <div>
          <Typography.Title level={3} style={{ marginBottom: 0 }}>
            搜索项目
          </Typography.Title>
          <Typography.Text type="secondary">按名称模糊查询项目（fuzzy）</Typography.Text>
        </div>

        {error ? <Alert type="error" showIcon message={error} /> : null}

        <Form layout="inline" onSubmitCapture={onSubmit}>
          <Form.Item label="关键词">
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="输入项目名的一部分" />
          </Form.Item>
          <Button type="primary" htmlType="submit" loading={loading} disabled={!q.trim()}>
            搜索
          </Button>
          <Link to="/projects/rules/list">查看全部规则</Link>
        </Form>

        <Table
          size="small"
          rowKey={(r) => String(r.id)}
          loading={loading}
          pagination={false}
          dataSource={result?.items || []}
          columns={columns}
        />
      </Space>
    </Card>
  )
}

