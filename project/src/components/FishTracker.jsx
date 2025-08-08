import { useState, useEffect } from 'react'
import { Button, Card, Form, Input, Select, DatePicker, InputNumber, Table, Modal, Statistic, Row, Col, message, Tag } from 'antd'
import { Fish } from '../entities/Fish'
import dayjs from 'dayjs'

function FishTracker() {
  const [catches, setCatches] = useState([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)

  const timeOfDayOptions = [
    { value: 'morning', label: 'Morning' },
    { value: 'afternoon', label: 'Afternoon' },
    { value: 'evening', label: 'Evening' },
    { value: 'night', label: 'Night' }
  ]

  const weatherOptions = [
    { value: 'sunny', label: 'Sunny' },
    { value: 'cloudy', label: 'Cloudy' },
    { value: 'rainy', label: 'Rainy' },
    { value: 'overcast', label: 'Overcast' },
    { value: 'windy', label: 'Windy' }
  ]

  const loadCatches = async () => {
    try {
      setLoading(true)
      const result = await Fish.list()
      if (result.success) {
        setCatches(result.data)
      }
    } catch (error) {
      message.error('Failed to load fish catches')
    } finally {
      setLoading(false)
    }
  }

  const handleAddCatch = async (values) => {
    try {
      const catchData = {
        ...values,
        datecaught: values.datecaught.format('YYYY-MM-DD')
      }
      
      const result = await Fish.create(catchData)
      if (result.success) {
        message.success('Fish catch added successfully!')
        setIsModalOpen(false)
        form.resetFields()
        loadCatches()
      }
    } catch (error) {
      message.error('Failed to add fish catch')
    }
  }

  useEffect(() => {
    loadCatches()
  }, [])

  const columns = [
    {
      title: 'Species',
      dataIndex: 'species',
      key: 'species',
      render: (text) => <Tag color="blue">{text}</Tag>
    },
    {
      title: 'Weight (lbs)',
      dataIndex: 'weight',
      key: 'weight',
      sorter: (a, b) => a.weight - b.weight,
      render: (weight) => `${weight} lbs`
    },
    {
      title: 'Length (in)',
      dataIndex: 'length',
      key: 'length',
      sorter: (a, b) => (a.length || 0) - (b.length || 0),
      render: (length) => length ? `${length}"` : 'N/A'
    },
    {
      title: 'Location',
      dataIndex: 'location',
      key: 'location'
    },
    {
      title: 'Date',
      dataIndex: 'datecaught',
      key: 'datecaught',
      sorter: (a, b) => new Date(a.datecaught) - new Date(b.datecaught),
      render: (date) => dayjs(date).format('MMM DD, YYYY')
    },
    {
      title: 'Time',
      dataIndex: 'timeOfDay',
      key: 'timeOfDay',
      render: (time) => time ? <Tag>{time}</Tag> : 'N/A'
    },
    {
      title: 'Bait',
      dataIndex: 'bait',
      key: 'bait'
    }
  ]

  const totalCatches = catches.length
  const totalWeight = catches.reduce((sum, fish) => sum + (fish.weight || 0), 0)
  const biggestFish = catches.reduce((max, fish) => 
    (fish.weight || 0) > (max.weight || 0) ? fish : max, 
    { weight: 0 }
  )
  const averageWeight = totalCatches > 0 ? (totalWeight / totalCatches).toFixed(2) : 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-100 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">🎣 Fish Tracker</h1>
          <p className="text-gray-600">Keep track of your fishing adventures and catches</p>
        </div>

        {/* Statistics Cards */}
        <Row gutter={16} className="mb-8">
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic title="Total Catches" value={totalCatches} />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic title="Total Weight" value={totalWeight.toFixed(1)} suffix="lbs" />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic title="Average Weight" value={averageWeight} suffix="lbs" />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic 
                title="Biggest Fish" 
                value={biggestFish.weight || 0} 
                suffix="lbs"
                formatter={(value) => value > 0 ? `${value} lbs` : 'None yet'}
              />
            </Card>
          </Col>
        </Row>

        {/* Add Catch Button */}
        <div className="mb-6">
          <Button 
            type="primary" 
            size="large" 
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-500 hover:bg-blue-600"
          >
            Add New Catch
          </Button>
        </div>

        {/* Fish Catches Table */}
        <Card className="shadow-lg">
          <Table 
            columns={columns}
            dataSource={catches}
            rowKey="_id"
            loading={loading}
            pagination={{ pageSize: 10 }}
            scroll={{ x: 800 }}
          />
        </Card>

        {/* Add Catch Modal */}
        <Modal
          title="Add New Fish Catch"
          open={isModalOpen}
          onCancel={() => {
            setIsModalOpen(false)
            form.resetFields()
          }}
          footer={null}
          width={600}
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={handleAddCatch}
            className="mt-4"
          >
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="species"
                  label="Fish Species"
                  rules={[{ required: true, message: 'Please enter the fish species' }]}
                >
                  <Input placeholder="e.g., Bass, Trout, Pike" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="weight"
                  label="Weight (lbs)"
                  rules={[{ required: true, message: 'Please enter the weight' }]}
                >
                  <InputNumber
                    min={0}
                    step={0.1}
                    placeholder="0.0"
                    style={{ width: '100%' }}
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="length" label="Length (inches)">
                  <InputNumber
                    min={0}
                    step={0.1}
                    placeholder="0.0"
                    style={{ width: '100%' }}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="datecaught"
                  label="Date Caught"
                  rules={[{ required: true, message: 'Please select the date' }]}
                >
                  <DatePicker style={{ width: '100%' }} />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              name="location"
              label="Location"
              rules={[{ required: true, message: 'Please enter the location' }]}
            >
              <Input placeholder="e.g., Lake Michigan, Smith River" />
            </Form.Item>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="bait" label="Bait/Lure Used">
                  <Input placeholder="e.g., Worms, Spinner, Jig" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="timeOfDay" label="Time of Day">
                  <Select placeholder="Select time of day" options={timeOfDayOptions} />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item name="weather" label="Weather Conditions">
              <Select placeholder="Select weather conditions" options={weatherOptions} />
            </Form.Item>

            <Form.Item name="notes" label="Notes">
              <Input.TextArea 
                rows={3} 
                placeholder="Any additional notes about this catch..." 
              />
            </Form.Item>

            <div className="flex justify-end gap-2">
              <Button onClick={() => {
                setIsModalOpen(false)
                form.resetFields()
              }}>
                Cancel
              </Button>
              <Button type="primary" htmlType="submit">
                Add Catch
              </Button>
            </div>
          </Form>
        </Modal>
      </div>
    </div>
  )
}

export default FishTracker