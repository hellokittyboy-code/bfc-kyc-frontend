import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Alert, Button, Card, Space, Table, Tabs, Typography } from 'antd'
import type { ColumnsType } from 'antd/es/table'

import { apiRequest } from '../lib/api'
import { useAuth } from '../app/useAuth'

type Rule = {
  countryMode: number
  countries: string[]
  ageMin?: number
  allowedMan?: boolean
  allowedWoman?: boolean
}

type RuleData = {
  policyId: number
  projectName: string
  owner: string
  website: string
  rules: Rule
}

type ListRulesResp = {
  data: RuleData[]
}

type HealthResp = {
  ok: boolean
}

export default function SuperAdminPage() {
  const { auth } = useAuth()
  const [tab, setTab] = useState<'rules' | 'health' | 'approval'>(auth.role === 'super_admin' ? 'approval' : 'rules')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [rules, setRules] = useState<ListRulesResp | null>(null)
  const [health, setHealth] = useState<HealthResp | null>(null)
  const [pending, setPending] = useState<{ username: string; role: string }[]>([])

  async function load(nextTab: typeof tab) {
    setError('')
    setLoading(true)
    try {
      if (nextTab === 'rules') {
        const res = await apiRequest<ListRulesResp>('/api/projects/rules')
        setRules(res)
      } else if (nextTab === 'health') {
        const res = await apiRequest<HealthResp>('/health')
        setHealth(res)
      } else {
        const res = await apiRequest<{ data: { username: string; role: string }[] }>('/api/admin/pending-users')
        setPending(res.data || [])
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '请求失败')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (auth.role === 'super_admin' && tab !== 'approval') {
      setTab('approval')
      return
    }
    if (auth.role !== 'super_admin' && tab === 'approval') {
      setTab('rules')
      return
    }
    void load(tab)
  }, [auth.role, tab])

  const ruleColumns = useMemo<ColumnsType<RuleData>>(
    () => [
      { title: 'ID', dataIndex: 'policyId', width: 100 },
      { title: '名称', dataIndex: 'projectName', width: 200 },
      { title: 'Owner', dataIndex: 'owner', width: 140 },
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
      { title: 'countryMode', render: (_, r) => String(r.rules?.countryMode ?? ''), width: 120 },
      { title: 'countries', render: (_, r) => (r.rules?.countries || []).join(', ') || '-' },
    ],
    [],
  )

  const items = useMemo(() => {
    if (auth.role === 'super_admin') {
      return [
        {
          key: 'approval',
          label: '审批',
          children: (
            <Table
              size="small"
              rowKey={(r) => r.username}
              loading={loading}
              pagination={false}
              dataSource={pending}
              columns={[
                { title: '用户名', dataIndex: 'username', width: 160 },
                {
                  title: '角色',
                  dataIndex: 'role',
                  width: 160,
                  render: (r: string) => (r === 'admin_pending' ? '管理员(待审)' : r === 'project_pending' ? '项目方(待审)' : r),
                },
                {
                  title: '操作',
                  width: 140,
                  render: (_, r) => (
                    <Button
                      type="primary"
                      size="small"
                      onClick={async () => {
                        try {
                          setLoading(true)
                          setError('')
                          await apiRequest('/api/admin/approve', {
                            method: 'POST',
                            body: JSON.stringify({ username: r.username }),
                          })
                          await load('approval')
                        } catch (err) {
                          setError(err instanceof Error ? err.message : '审批失败')
                        } finally {
                          setLoading(false)
                        }
                      }}
                    >
                      通过
                    </Button>
                  ),
                },
              ]}
            />
          ),
        } as const,
      ]
    }

    return [
      {
        key: 'rules',
        label: '规则列表',
        children: (
          <Table
            size="small"
            rowKey={(r) => String(r.policyId)}
            loading={loading}
            pagination={false}
            dataSource={rules?.data || []}
            columns={ruleColumns}
          />
        ),
      },
      {
        key: 'health',
        label: '健康检查',
        children: (
          <Space direction="vertical" style={{ width: '100%' }}>
            <Typography.Text>GET /health</Typography.Text>
            <Typography.Text strong>{health ? String(health.ok) : '-'}</Typography.Text>
          </Space>
        ),
      },
    ]
  }, [auth.role, health, loading, pending, ruleColumns, rules?.data])

  return (
    <Card style={{ margin: '0 auto' }}>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <div>
          <Typography.Title level={3} style={{ marginBottom: 0 }}>
            {auth.role === 'super_admin' ? '超级管理员' : '管理员控制台'}
          </Typography.Title>
          <Typography.Text type="secondary">
            {auth.role === 'super_admin' ? '仅显示审批与规则提交入口' : '用于查看规则与健康检查'}
          </Typography.Text>
        </div>

        <Space>
          <Button onClick={() => void load(tab)} loading={loading}>
            刷新
          </Button>
          {auth.role === 'super_admin' ? (
            <Button type="primary">
              <Link to="/projects/rules/create">提交国家规则</Link>
            </Button>
          ) : null}
        </Space>

        {error ? <Alert type="error" showIcon message={error} /> : null}

        <Tabs activeKey={tab} onChange={(k) => setTab(k as typeof tab)} items={items} />
      </Space>
    </Card>
  )
}
