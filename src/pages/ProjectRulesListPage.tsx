import { useEffect, useMemo, useState } from 'react'
import { Alert, Button, Card, Space, Table, Typography } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { Link } from 'react-router-dom'

import { apiRequest } from '../lib/api'

type Rule = {
  countryMode: number
  countries: string[]
  ageMin: number
  allowedMan: boolean
  allowedWoman: boolean
}

type RuleData = {
  projectName: string
  owner: string
  website: string
  rules: Rule
}

type ListRulesResponse = {
  data: RuleData[]
}

function formatCountryMode(v: number) {
  if (v === 2) return 'all'
  if (v === 1) return 'exclude'
  if (v === 0) return 'include'
  return String(v)
}

function formatAllowedGenders(rule?: Rule) {
  const items: string[] = []
  if (rule?.allowedMan) items.push('男')
  if (rule?.allowedWoman) items.push('女')
  return items.join(', ') || '-'
}

function formatAge(rule?: Rule) {
  const min = Number(rule?.ageMin ?? 0)
  if (!min) return '-'
  return `>= ${min}`
}

export default function ProjectRulesListPage() {
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<ListRulesResponse | null>(null)

  async function load() {
    setError('')
    setLoading(true)
    try {
      const res = await apiRequest<ListRulesResponse>('/api/projects/rules')
      setData(res)
    } catch (err) {
      setError(err instanceof Error ? err.message : '查询失败')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [])

  const columns = useMemo<ColumnsType<RuleData>>(
    () => [
      { title: '名称', dataIndex: 'projectName', width: 220 },
      { title: 'Owner', dataIndex: 'owner', width: 120 },
      {
        title: 'Website',
        dataIndex: 'website',
        width: 240,
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
        title: 'countryMode',
        render: (_, r) => formatCountryMode(Number(r.rules?.countryMode ?? 2)),
        width: 120,
      },
      {
        title: 'countries',
        render: (_, r) => (r.rules?.countries || []).join(', ') || '-',
      },
      {
        title: 'age',
        render: (_, r) => formatAge(r.rules),
        width: 140,
      },
      {
        title: 'genders',
        render: (_, r) => formatAllowedGenders(r.rules),
        width: 140,
      },
      {
        title: '操作',
        width: 220,
        render: (_, r) => (
          <Space>
            <Link to={`/projects/rules/query-by-name?name=${encodeURIComponent(r.projectName)}`}>按名称查看</Link>
          </Space>
        ),
      },
    ],
    [],
  )

  return (
    <Card style={{ margin: '0 auto' }}>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <div>
          <Typography.Title level={3} style={{ marginBottom: 0 }}>
            项目规则列表
          </Typography.Title>
          <Typography.Text type="secondary">展示所有项目的规则</Typography.Text>
        </div>

        <Space>
          <Button onClick={() => void load()} loading={loading}>
            刷新
          </Button>
          <Link to="/projects/rules/create">创建规则</Link>
          <Link to="/projects/search">搜索项目</Link>
        </Space>

        {error ? <Alert type="error" showIcon message={error} /> : null}

        <Table
          size="small"
          rowKey={(r) => r.projectName}
          loading={loading}
          pagination={false}
          dataSource={data?.data || []}
          columns={columns}
        />
      </Space>
    </Card>
  )
}
