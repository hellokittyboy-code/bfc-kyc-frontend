import { useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { Alert, Button, Card, Descriptions, Form, Input, Space, Typography } from 'antd'
import { useLocation } from 'react-router-dom'

import { apiRequest } from '../lib/api'

type Rule = {
  countryMode: number
  countries: string[]
  ageMin: number
  ageMax: number
  allowedMan: boolean
  allowedWoman: boolean
}

type ProjectRuleResponse = {
  project: {
    id: number
    uuid?: string
    name: string
    owner: string
    website?: string
    rule: Rule
  }
}

function formatAllowedGenders(rule?: Rule) {
  const items: string[] = []
  if (rule?.allowedMan) items.push('男')
  if (rule?.allowedWoman) items.push('女')
  return items.join(', ') || '-'
}

export default function ProjectRuleQueryByNamePage() {
  const location = useLocation()
  const search = useMemo(() => new URLSearchParams(location.search), [location.search])
  const [name, setName] = useState(search.get('name') || '')
  const [error, setError] = useState('')
  const [result, setResult] = useState<ProjectRuleResponse | null>(null)
  const [loading, setLoading] = useState(false)

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    const q = name.trim()
    if (!q) return
    setError('')
    setResult(null)
    setLoading(true)
    try {
      const data = await apiRequest<ProjectRuleResponse>(`/api/projects/by-name/${encodeURIComponent(q)}/rules`)
      setResult(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : '查询失败')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card style={{ maxWidth: 900, margin: '0 auto' }}>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <div>
          <Typography.Title level={3} style={{ marginBottom: 0 }}>
            按名称查询项目规则
          </Typography.Title>
          <Typography.Text type="secondary">Name 已唯一，可直接用 name 查询规则</Typography.Text>
        </div>

        {error ? <Alert type="error" showIcon message={error} /> : null}

        <Form layout="inline" onSubmitCapture={onSubmit}>
          <Form.Item label="Project Name">
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="project-a" />
          </Form.Item>
          <Button type="primary" htmlType="submit" loading={loading} disabled={!name.trim()}>
            查询
          </Button>
        </Form>

        {result ? (
          <Descriptions title="规则" bordered size="small" column={1}>
            <Descriptions.Item label="projectId">{result.project.id}</Descriptions.Item>
            <Descriptions.Item label="uuid">{result.project.uuid || '-'}</Descriptions.Item>
            <Descriptions.Item label="name">{result.project.name}</Descriptions.Item>
            <Descriptions.Item label="owner">{result.project.owner}</Descriptions.Item>
            <Descriptions.Item label="website">
              {result.project.website ? (
                <a href={result.project.website} target="_blank" rel="noreferrer">
                  {result.project.website}
                </a>
              ) : (
                '-'
              )}
            </Descriptions.Item>
            <Descriptions.Item label="countryMode">
              {result.project.rule.countryMode === 2
                ? 'all'
                : result.project.rule.countryMode === 1
                  ? 'exclude'
                  : 'include'}
            </Descriptions.Item>
            <Descriptions.Item label="countries">
              {(result.project.rule.countries || []).join(', ') || '-'}
            </Descriptions.Item>
            <Descriptions.Item label="age">
              {result.project.rule.ageMin} ~ {result.project.rule.ageMax}
            </Descriptions.Item>
            <Descriptions.Item label="allowedGenders">
              {formatAllowedGenders(result.project.rule)}
            </Descriptions.Item>
          </Descriptions>
        ) : null}
      </Space>
    </Card>
  )
}
