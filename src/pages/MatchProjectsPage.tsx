import { useEffect, useState } from 'react'
import { Alert, Button, Card, Space, Table, Tag, Typography } from 'antd'
import { Link } from 'react-router-dom'

import { useAuth } from '../app/useAuth'
import { apiRequest } from '../lib/api'

type Rule = {
  countryMode: number
  countries: string[]
  ageMin: number
  allowedMan: boolean
  allowedWoman: boolean
}

type RuleData = {
  policyId: number
  projectName: string
  owner: string
  website: string
  rules: Rule
}

type MatchResponse = { data: RuleData[] }
type TagsResponse = { tags: Record<string, boolean> }

export default function MatchProjectsPage() {
  const { auth } = useAuth()
  const [error, setError] = useState('')
  const [result, setResult] = useState<MatchResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [tagsByPolicyId, setTagsByPolicyId] = useState<
    Record<number, { loading: boolean; error: string; tags: Record<string, boolean> | null }>
  >({})

  async function load() {
    setError('')
    setResult(null)
    setLoading(true)
    try {
      const username = auth.subject || ''
      const data = await apiRequest<MatchResponse>(`/api/match/users/${encodeURIComponent(username)}/projects`)
      setResult(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : '查询失败')
    } finally {
      setLoading(false)
    }
  }

  async function loadTags(policyId: number) {
    const username = auth.subject || ''
    if (!username || !policyId) return
    setTagsByPolicyId((prev) => ({
      ...prev,
      [policyId]: { loading: true, error: '', tags: prev[policyId]?.tags ?? null },
    }))
    try {
      const data = await apiRequest<TagsResponse>(
        `/api/match/users/${encodeURIComponent(username)}/projects/${policyId}/tags`,
      )
      setTagsByPolicyId((prev) => ({ ...prev, [policyId]: { loading: false, error: '', tags: data.tags || {} } }))
    } catch (err) {
      setTagsByPolicyId((prev) => ({
        ...prev,
        [policyId]: { loading: false, error: err instanceof Error ? err.message : '查询失败', tags: null },
      }))
    }
  }

  useEffect(() => {
    if (auth.subject) void load()
  }, [auth.subject])

  return (
    <Card style={{ maxWidth: 720, margin: '0 auto' }}>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <div>
          <Typography.Title level={3} style={{ marginBottom: 0 }}>
            查询自己匹配的策略
          </Typography.Title>
          <Typography.Text type="secondary">使用当前登录用户名，展示可匹配的策略。</Typography.Text>
        </div>

        {error ? <Alert type="error" showIcon message={error} /> : null}

        {result ? (
          <Table
            size="small"
            rowKey={(r) => r.policyId || r.projectName}
            pagination={false}
            dataSource={result.data || []}
            columns={[
              { title: 'Policy ID', dataIndex: 'policyId' },
              { title: 'Policy', dataIndex: 'projectName' },
              { title: 'Owner', dataIndex: 'owner' },
              {
                title: 'Tags',
                render: (_, r) => {
                  const st = tagsByPolicyId[r.policyId]
                  const tags = st?.tags
                  if (!st) {
                    return (
                      <Button size="small" onClick={() => void loadTags(r.policyId)} disabled={!auth.subject}>
                        加载
                      </Button>
                    )
                  }
                  if (st.loading) return <Typography.Text type="secondary">加载中...</Typography.Text>
                  if (st.error) return <Typography.Text type="danger">{st.error}</Typography.Text>
                  if (!tags || Object.keys(tags).length === 0) return '-'
                  return (
                    <Space size={4} wrap>
                      {Object.entries(tags).map(([k, v]) => (
                        <Tag key={k} color={v ? 'green' : 'red'}>
                          {k}:{String(v)}
                        </Tag>
                      ))}
                    </Space>
                  )
                },
              },
              {
                title: 'Rules',
                dataIndex: 'rules',
                render: (v: Rule) => (
                  <pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                    {JSON.stringify(v, null, 2)}
                  </pre>
                ),
              },
              {
                title: '操作',
                render: (_, r) => (
                  <Space>
                    <Link
                      to={`/match/tags?username=${encodeURIComponent(auth.subject || '')}&projectId=${encodeURIComponent(
                        String(r.policyId),
                      )}`}
                    >
                      标签详情
                    </Link>
                  </Space>
                ),
              },
            ]}
          />
        ) : null}

        <Button onClick={() => void load()} loading={loading} disabled={!auth.subject}>
          刷新
        </Button>
      </Space>
    </Card>
  )
}
