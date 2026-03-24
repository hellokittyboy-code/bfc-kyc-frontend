import { useEffect, useState } from 'react'
import dayjs from 'dayjs'
import { Alert, Button, Card, Descriptions, Form, Input, Radio, Select, Space, Typography } from 'antd'

import { useAuth } from '../app/useAuth'
import { apiRequest } from '../lib/api'
import { countryOptions, formatCountryForBackend } from '../lib/countries'

type SubmitResponse = {
  user: {
    username: string
    name: string
    gender: string
    country: string
  }
}

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

export default function KycSubmitPage() {
  const { auth } = useAuth()
  const [error, setError] = useState('')
  const [result, setResult] = useState<SubmitResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [alreadySubmitted, setAlreadySubmitted] = useState(false)

  useEffect(() => {
    const username = auth.subject || ''
    if (!username) return
    apiRequest<UserKycResponse>(`/api/kyc/users/${encodeURIComponent(username)}`)
      .then((res) => {
        const u = res.user
        if ((u.name || '').trim() || (u.country || '').trim() || (u.dob || '').trim()) {
          setAlreadySubmitted(true)
        }
      })
      .catch(() => {})
  }, [auth.subject])

  async function onFinish(values: {
    name: string
    dobYear: number
    dobMonth: number
    dobDay: number
    gender: string
    country: string
  }) {
    setError('')
    setResult(null)
    setLoading(true)
    try {
      const dobMonth = String(values.dobMonth).padStart(2, '0')
      const dobDay = String(values.dobDay).padStart(2, '0')
      const dob = `${values.dobYear}-${dobMonth}-${dobDay}`
      const payload = {
        name: values.name,
        dob,
        gender: values.gender,
        country: formatCountryForBackend(values.country),
      }
      const data = await apiRequest<SubmitResponse>('/api/kyc/submit', {
        method: 'POST',
        body: JSON.stringify(payload),
      })
      setResult(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : '提交失败')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card style={{ maxWidth: 720, margin: '0 auto' }}>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <div>
          <Typography.Title level={3} style={{ marginBottom: 0 }}>
            提交 KYC 信息
          </Typography.Title>
          <Typography.Text type="secondary">当前登录：{auth.subject || auth.userId || '-'}</Typography.Text>
        </div>

        {alreadySubmitted ? (
          <Alert
            type="warning"
            showIcon
            message="你已经提交过 KYC，本系统不允许重复提交。"
          />
        ) : null}

        {error ? <Alert type="error" showIcon message={error} /> : null}

        <Form
          layout="vertical"
          requiredMark={false}
          onFinish={onFinish}
          disabled={alreadySubmitted}
          initialValues={{
            gender: '1',
            country: 'CN',
            dobYear: dayjs().subtract(18, 'year').year(),
            dobMonth: dayjs().subtract(18, 'year').month() + 1,
            dobDay: dayjs().subtract(18, 'year').date(),
          }}
        >
          <Form.Item label="姓名" name="name" rules={[{ required: true, message: '请输入姓名' }]}>
            <Input placeholder="Alice" />
          </Form.Item>
          <Form.Item label="出生日期" required>
            <Space.Compact style={{ width: '100%' }}>
              <Form.Item
                name="dobYear"
                noStyle
                rules={[{ required: true, message: '请选择年份' }]}
              >
                <Select
                  placeholder="年"
                  options={Array.from({ length: 121 }, (_, i) => {
                    const y = dayjs().year() - i
                    return { value: y, label: `${y}` }
                  })}
                  showSearch
                  optionFilterProp="label"
                />
              </Form.Item>
              <Form.Item
                name="dobMonth"
                noStyle
                rules={[{ required: true, message: '请选择月份' }]}
              >
                <Select
                  placeholder="月"
                  options={Array.from({ length: 12 }, (_, i) => {
                    const m = i + 1
                    return { value: m, label: String(m).padStart(2, '0') }
                  })}
                />
              </Form.Item>
              <Form.Item
                shouldUpdate={(prev, curr) =>
                  prev.dobYear !== curr.dobYear || prev.dobMonth !== curr.dobMonth || prev.dobDay !== curr.dobDay
                }
                noStyle
              >
                {({ getFieldValue, setFieldValue }) => {
                  const year = Number(getFieldValue('dobYear') || 0)
                  const month = Number(getFieldValue('dobMonth') || 0)
                  const daysInMonth =
                    year && month ? dayjs(`${year}-${String(month).padStart(2, '0')}-01`).daysInMonth() : 31
                  const dayOptions = Array.from({ length: daysInMonth }, (_, i) => {
                    const d = i + 1
                    return { value: d, label: String(d).padStart(2, '0') }
                  })
                  const currentDay = Number(getFieldValue('dobDay') || 0)
                  if (currentDay && currentDay > daysInMonth) {
                    setFieldValue('dobDay', daysInMonth)
                  }
                  return (
                    <Form.Item
                      name="dobDay"
                      noStyle
                      rules={[{ required: true, message: '请选择日期' }]}
                    >
                      <Select placeholder="日" options={dayOptions} />
                    </Form.Item>
                  )
                }}
              </Form.Item>
            </Space.Compact>
          </Form.Item>
          <Form.Item label="性别" name="gender" rules={[{ required: true, message: '请选择性别' }]}>
            <Radio.Group
              options={[
               { value: '1', label: '男' },
               { value: '0', label: '女' },
              ]}
              optionType="button"
              buttonStyle="solid"
            />
          </Form.Item>
          <Form.Item label="国家" name="country" rules={[{ required: true, message: '请输入国家' }]}>
            <Select
              showSearch
              placeholder="选择国家代码"
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
          <Button type="primary" htmlType="submit" loading={loading} disabled={alreadySubmitted}>
            提交
          </Button>
        </Form>

        {result ? (
          <Descriptions title="提交结果" bordered size="small" column={1}>
            <Descriptions.Item label="username">{result.user.username}</Descriptions.Item>
            <Descriptions.Item label="name">{result.user.name}</Descriptions.Item>
            <Descriptions.Item label="gender">{result.user.gender}</Descriptions.Item>
            <Descriptions.Item label="country">{result.user.country}</Descriptions.Item>
          </Descriptions>
        ) : null}
      </Space>
    </Card>
  )
}
