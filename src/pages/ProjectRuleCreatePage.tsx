import { useState } from 'react'
import { Alert, Button, Card, Checkbox, Descriptions, Form, Input, InputNumber, Select, Space, Typography } from 'antd'

import { useAuth } from '../app/useAuth'
import { apiRequest } from '../lib/api'
import { countryOptions, formatCountryForBackend } from '../lib/countries'

type CreateResponse = { data: string }

export default function ProjectRuleCreatePage() {
  const { auth } = useAuth()
  const [form] = Form.useForm()
  const countryMode = Form.useWatch('countryMode', form)
  const [error, setError] = useState('')
  const [result, setResult] = useState<CreateResponse | null>(null)
  const [loading, setLoading] = useState(false)

  async function onFinish(values: {
    name: string
    website?: string
    countryMode: 0 | 1 | 2
    countries: string[]
    ageMin?: number
    ageMax?: number
    allowedMan: boolean
    allowedWoman: boolean
  }) {
    setError('')
    setResult(null)
    setLoading(true)
    try {
      const payload = {
        ...values,
        countries: (values.countries || []).map(formatCountryForBackend),
      }
      const data = await apiRequest<CreateResponse>('/api/projects/rules', {
        method: 'POST',
        body: JSON.stringify(payload),
      })
      setResult(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : '创建失败')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card style={{ maxWidth: 720, margin: '0 auto' }}>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <div>
          <Typography.Title level={3} style={{ marginBottom: 0 }}>
            项目方：创建规则
          </Typography.Title>
          <Typography.Text type="secondary">
            仅 project 角色可创建。当前角色：{auth.role || '-'}，账号：{auth.subject || '-'}
          </Typography.Text>
        </div>

        {error ? <Alert type="error" showIcon message={error} /> : null}

        <Form
          form={form}
          layout="vertical"
          requiredMark={false}
          onFinish={onFinish}
          initialValues={{
            name: 'Project A',
            website: 'https://example.com',
            countryMode: 2,
            countries: [],
            ageMin: 18,
            ageMax: 60,
            allowedMan: true,
            allowedWoman: true,
          }}
        >
          <Form.Item label="项目名称" name="name" rules={[{ required: true, message: '请输入项目名称' }]}>
            <Input />
          </Form.Item>
          <Form.Item label="项目网址" name="website" rules={[{ type: 'url', message: '请输入合法网址' }]}>
            <Input placeholder="https://..." />
          </Form.Item>
          <Form.Item
            label="国家模式"
            name="countryMode"
            rules={[{ required: true, message: '请选择国家模式' }]}
          >
            <Select
              options={[
                { value: 2, label: '默认全部允许' },
                { value: 0, label: '允许列表' },
                { value: 1, label: '禁止列表' },
              ]}
            />
          </Form.Item>
          <Form.Item
            label="国家列表"
            name="countries"
            rules={[
              ({ getFieldValue }) => ({
                validator(_, value) {
                  const mode = Number(getFieldValue('countryMode') ?? 2)
                  const list = Array.isArray(value) ? value : []
                  if (mode === 2) return Promise.resolve()
                  if (list.length > 0) return Promise.resolve()
                  return Promise.reject(new Error('请选择至少一个国家'))
                },
              }),
            ]}
          >
            <Select
              mode="multiple"
              showSearch
              placeholder="选择国家（可多选）"
              disabled={Number(countryMode ?? 2) === 2}
              options={countryOptions}
              optionFilterProp="label"
              filterOption={(input, option) => {
                const label = String(option?.label || '')
                const value = String(option?.value || '')
                const q = input.trim().toLowerCase()
                return label.toLowerCase().includes(q) || value.toLowerCase().includes(q)
              }}
            />
          </Form.Item>
          <Form.Item label="年龄范围">
            <Space>
              <Form.Item name="ageMin" noStyle>
                <InputNumber min={0} placeholder="min" />
              </Form.Item>
              <span>~</span>
              <Form.Item name="ageMax" noStyle>
                <InputNumber min={0} placeholder="max" />
              </Form.Item>
            </Space>
          </Form.Item>
          <Form.Item label="允许性别">
            <Space>
              <Form.Item name="allowedMan" valuePropName="checked" noStyle>
                <Checkbox>男</Checkbox>
              </Form.Item>
              <Form.Item name="allowedWoman" valuePropName="checked" noStyle>
                <Checkbox>女</Checkbox>
              </Form.Item>
            </Space>
          </Form.Item>

          <Button type="primary" htmlType="submit" loading={loading}>
            创建
          </Button>
        </Form>

        {result ? (
          <Descriptions title="创建结果" bordered size="small" column={1}>
            <Descriptions.Item label="结果">{result.data}</Descriptions.Item>
          </Descriptions>
        ) : null}
      </Space>
    </Card>
  )
}
