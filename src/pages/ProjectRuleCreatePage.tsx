import { useState } from 'react'
import { Alert, Button, Card, Checkbox, Descriptions, Form, Input, InputNumber, Select, Space, Typography, Radio } from 'antd'

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
  const isAdminOrSuper = auth.role === 'admin' || auth.role === 'super_admin'
  const [ruleKind, setRuleKind] = useState<'default' | 'custom'>('default')
  const defaultTemplates = [
    { key: 'def18_all', label: '默认规则：允许最小年龄18，性别不限', ageMin: 18, allowedMan: true, allowedWoman: true },
    { key: 'def21_all', label: '默认规则：允许最小年龄21，性别不限', ageMin: 21, allowedMan: true, allowedWoman: true },
  ]

  async function onFinish(values: {
    name: string
    countryMode: 0 | 1 | 2
    countries: string[]
    ageMin?: number
    allowedMan: boolean
    allowedWoman: boolean
  }) {
    setError('')
    setResult(null)
    setLoading(true)
    try {
      const payload = {
        name: isAdminOrSuper ? `country_rule_${Date.now()}` : values.name,
        website: '',
        countryMode: values.countryMode,
        countries: (values.countries || []).map(formatCountryForBackend),
        ageMin: values.ageMin ?? 0,
        allowedMan: values.allowedMan,
        allowedWoman: values.allowedWoman,
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
            创建规则
          </Typography.Title>
          <Typography.Text type="secondary">
            国家由管理员提交；管理员提交之后后端会生成国家标签，项目方选择标签即可。当前角色：{auth.role || '-'}，账号：{auth.subject || '-'}
          </Typography.Text>
        </div>

        {!isAdminOrSuper ? (
          <Alert
            type="info"
            showIcon
            message="国家由管理员提交"
            description="当前为项目方视图：仅可设置年龄和性别；国家标签选择将在后端对接完成后开放"
          />
        ) : null}

        {error ? <Alert type="error" showIcon message={error} /> : null}

        <Form
          form={form}
          layout="vertical"
          requiredMark={false}
          onFinish={onFinish}
          initialValues={{
            name: 'Project A',
            countryMode: isAdminOrSuper ? 0 : 2,
            countries: [],
            ageMin: 18,
            allowedMan: true,
            allowedWoman: true,
          }}
        >
          {!isAdminOrSuper ? (
            <Form.Item label="规则类型" name="ruleKind" initialValue={ruleKind}>
              <Radio.Group
                value={ruleKind}
                onChange={(e) => {
                  const v = e.target.value as 'default' | 'custom'
                  setRuleKind(v)
                }}
              >
                <Radio.Button value="default">选择默认规则</Radio.Button>
                <Radio.Button value="custom">自定义规则</Radio.Button>
              </Radio.Group>
            </Form.Item>
          ) : null}

          {!isAdminOrSuper ? (
            <>
              {ruleKind === 'default' ? (
                <Form.Item label="默认规则模板">
                  <Select
                    defaultValue={defaultTemplates[0].key}
                    options={defaultTemplates.map((t) => ({ value: t.key, label: t.label }))}
                    onChange={(val) => {
                      const tpl = defaultTemplates.find((t) => t.key === val)
                      if (tpl) {
                        form.setFieldsValue({
                          ageMin: tpl.ageMin,
                          allowedMan: tpl.allowedMan,
                          allowedWoman: tpl.allowedWoman,
                        })
                      }
                    }}
                  />
                </Form.Item>
              ) : null}
              <Form.Item label="策略ID (policy id)" name="policyId">
                <Input placeholder="例如：policy_001（当前仅展示，不提交到后端）" disabled={ruleKind === 'default'} />
              </Form.Item>
              <Form.Item label="策略名字 (policy name)" name="name" rules={[{ required: true, message: '请输入策略名字' }]}>
                <Input disabled={ruleKind === 'default'} />
              </Form.Item>
            </>
          ) : null}
          {isAdminOrSuper ? (
            <>
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
            </>
          ) : (
            <>
              <Form.Item label="国家标签（由管理员维护）">
                <Select placeholder="后端对接完成后可选择" disabled />
              </Form.Item>
            </>
          )}
          {!isAdminOrSuper ? (
            <>
              <Form.Item label="允许最小年龄" name="ageMin">
                <InputNumber min={0} placeholder="例如：18" disabled={ruleKind === 'default'} />
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
            </>
          ) : null}

          {isAdminOrSuper ? (
            <Button type="primary" htmlType="submit" loading={loading}>
              提交国家规则
            </Button>
          ) : (
            <Button disabled>创建（待管理员提交国家标签后开放）</Button>
          )}
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
