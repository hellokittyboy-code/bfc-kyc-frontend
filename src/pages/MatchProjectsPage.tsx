import { useEffect, useState } from 'react'
import { Alert, Button, Card, Descriptions, Space, Table, Typography } from 'antd'
import { Link } from 'react-router-dom'

import { useAuth } from '../app/useAuth'
import { apiRequest } from '../lib/api'

type Rule = {
  countryMode: number
  countries: string[]
  ageMin: number
  ageMax: number
  allowedMan: boolean
  allowedWoman: boolean
}

type RuleData = {
  projectName: string
  owner: string
  website: string
  rules: Rule
}

type MatchResponse = { data: RuleData[] }

export default function MatchProjectsPage() {
  const { auth } = useAuth()
  const [error, setError] = useState('')
  const [result, setResult] = useState<MatchResponse | null>(null)
  const [loading, setLoading] = useState(false)

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

  useEffect(() => {
    if (auth.subject) void load()
  }, [auth.subject])

  return (
    <Card style={{ maxWidth: 720, margin: '0 auto' }}>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <div>
          <Typography.Title level={3} style={{ marginBottom: 0 }}>
            查询用户匹配项目
          </Typography.Title>
          <Typography.Text type="secondary">使用当前登录用户名，展示可匹配的项目。</Typography.Text>
        </div>

        {error ? <Alert type="error" showIcon message={error} /> : null}

        <Descriptions bordered size="small" column={1}>
          <Descriptions.Item label="当前用户">{auth.subject || '-'}</Descriptions.Item>
        </Descriptions>

        <Button onClick={() => void load()} loading={loading} disabled={!auth.subject}>
          刷新
        </Button>

        {result ? (
          <Table
            size="small"
            rowKey={(r) => r.projectName}
            pagination={false}
            dataSource={result.data || []}
            columns={[
              { title: 'Project', dataIndex: 'projectName' },
              { title: 'Owner', dataIndex: 'owner' },
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
                render: (_, r) => (
                  <Space>
                    <Link to={`/projects/rules/query-by-name?name=${encodeURIComponent(r.projectName)}`}>查看规则</Link>
                  </Space>
                ),
              },
            ]}
          />
        ) : null}
      </Space>
    </Card>
  )
}
