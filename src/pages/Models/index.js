import React, { useState, useEffect } from 'react';
import { Card, Button, Select, Form, Input, message, Table, Space, Tag, Modal, Descriptions } from 'antd';
import { ExperimentOutlined, DeleteOutlined, HistoryOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { ref, set, onValue, remove } from 'firebase/database';
import { database } from '../../firebase';
import axios from 'axios';
import API_CONFIG from '../../config/api';
import './styles.css';

const { Option } = Select;

const Models = () => {
  const [form] = Form.useForm();
  const [selectedModel, setSelectedModel] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedModelDetails, setSelectedModelDetails] = useState(null);
  const [isDetailsModalVisible, setIsDetailsModalVisible] = useState(false);

  // Fetch existing models
  useEffect(() => {
    const modelsRef = ref(database, 'Models');
    const unsubscribe = onValue(modelsRef, async (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const modelsList = [];
        
        // Process Random Forest models
        if (data['Random Forest']) {
          const rfModels = await Promise.all(
            Object.entries(data['Random Forest']).map(async ([id, model]) => {
              try {
                const response = await axios.get(`${API_CONFIG.BASE_URL}/models/${id}/versions`);
                const versions = response.data.versions;
                return {
                  id,
                  ...model,
                  versions: versions || []
                };
              } catch (error) {
                console.error('Error fetching versions:', error);
                return {
                  id,
                  ...model,
                  versions: []
                };
              }
            })
          );
          modelsList.push(...rfModels);
        }

        // Process LSTM models
        if (data['LSTM']) {
          const lstmModels = await Promise.all(
            Object.entries(data['LSTM']).map(async ([id, model]) => {
              try {
                const response = await axios.get(`${API_CONFIG.BASE_URL}/models/${id}/versions`);
                const versions = response.data.versions;
                return {
                  id,
                  ...model,
                  versions: versions || []
                };
              } catch (error) {
                console.error('Error fetching versions:', error);
                return {
                  id,
                  ...model,
                  versions: []
                };
              }
            })
          );
          modelsList.push(...lstmModels);
        }

        setModels(modelsList);
      } else {
        setModels([]);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleModelSelect = (value) => {
    setSelectedModel(value);
    setIsCreating(true);
  };

  const handleCreateModel = async (values) => {
    try {
      setLoading(true);
      
      // Create model metadata
      const modelData = {
        name: values.modelName,
        version: values.version,
        model_type: selectedModel,
        created_at: new Date().toISOString(),
        last_trained: null,
        accuracy: null,
        parameters: selectedModel === 'random_forest' 
          ? {
              nEstimators: parseInt(values.nEstimators),
              maxDepth: parseInt(values.maxDepth)
            }
          : {
              units: parseInt(values.units),
              epochs: parseInt(values.epochs)
            }
      };

      console.log('Sending model data to backend:', modelData);

      // Create model in backend with timeout
      const response = await axios.post(`${API_CONFIG.BASE_URL}/models/create`, modelData, {
        timeout: 30000, // 30 second timeout
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      console.log('Backend response:', response.data);

      if (response.data && response.data.metadata) {
        // Save model metadata to RTDB under the appropriate type node
        const modelType = response.data.metadata.model_type === 'random_forest' ? 'Random Forest' : 'LSTM';
        const modelRef = ref(database, `Models/${modelType}/${values.modelName}`);
        await set(modelRef, {
          ...response.data.metadata,
          type: response.data.metadata.model_type,
          createdAt: Date.now(),
          status: 'created'
        });

        message.success('Model created successfully!');
        setIsCreating(false);
        form.resetFields();
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      console.error('Error creating model:', error);
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error('Error response data:', error.response.data);
        console.error('Error response status:', error.response.status);
        console.error('Error response headers:', error.response.headers);
        message.error(`Failed to create model: ${error.response.data.detail || error.response.data.message || 'Unknown error'}`);
      } else if (error.request) {
        // The request was made but no response was received
        console.error('Error request:', error.request);
        if (error.code === 'ECONNABORTED') {
          message.error('Request timed out. Please try again.');
        } else {
          message.error('No response received from server. Please check your connection.');
        }
      } else {
        // Something happened in setting up the request that triggered an Error
        console.error('Error message:', error.message);
        message.error(`Failed to create model: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteModel = async (modelId) => {
    try {
      setLoading(true);
      // Find the model to determine its type
      const model = models.find(m => m.id === modelId);
      if (!model) {
        throw new Error('Model not found');
      }
      
      const modelType = model.model_type === 'random_forest' ? 'Random Forest' : 'LSTM';
      // Delete from RTDB using the correct path
      await remove(ref(database, `Models/${modelType}/${modelId}`));
      message.success('Model deleted successfully');
    } catch (error) {
      console.error('Error deleting model:', error);
      message.error('Failed to delete model');
    } finally {
      setLoading(false);
    }
  };

  const showModelDetails = async (model) => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_CONFIG.BASE_URL}/models/${model.id}/${model.versions[0]?.version}/usage`);
      setSelectedModelDetails({
        ...model,
        usage: response.data.usage
      });
      setIsDetailsModalVisible(true);
    } catch (error) {
      console.error('Error fetching model details:', error);
      message.error('Failed to fetch model details');
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Type',
      dataIndex: 'model_type',
      key: 'type',
      render: (type) => (
        <Tag color={type === 'random_forest' ? 'blue' : 'green'}>
          {type === 'random_forest' ? 'Random Forest' : 'LSTM'}
        </Tag>
      ),
    },
    {
      title: 'Latest Version',
      dataIndex: 'versions',
      key: 'latestVersion',
      render: (versions) => versions?.[0]?.version || 'N/A',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={
          status === 'trained' ? 'success' :
          status === 'training' ? 'processing' :
          'default'
        }>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </Tag>
      ),
    },
    {
      title: 'Last Trained',
      dataIndex: 'lastTrained',
      key: 'lastTrained',
      render: (timestamp) => timestamp ? new Date(timestamp).toLocaleString() : 'Never',
    },
    {
      title: 'Accuracy',
      dataIndex: 'accuracy',
      key: 'accuracy',
      render: (accuracy) => accuracy ? `${(accuracy * 100).toFixed(2)}%` : 'N/A',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button 
            icon={<InfoCircleOutlined />} 
            onClick={() => showModelDetails(record)}
          >
            Details
          </Button>
          <Button 
            icon={<HistoryOutlined />} 
            onClick={() => {/* TODO: Show version history */}}
          >
            Versions
          </Button>
          <Button 
            danger 
            icon={<DeleteOutlined />} 
            onClick={() => handleDeleteModel(record.id)}
          >
            Delete
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="models-container">
      <h1>ML Models Management</h1>
      
      <Card className="model-selection-card">
        <h2>Create New Model</h2>
        <Select
          placeholder="Select model type"
          style={{ width: '100%', marginBottom: '20px' }}
          onChange={handleModelSelect}
        >
          <Option value="random_forest">Random Forest</Option>
          <Option value="lstm">LSTM</Option>
        </Select>

        {isCreating && (
          <Form
            form={form}
            layout="vertical"
            onFinish={handleCreateModel}
          >
            <Form.Item
              name="modelName"
              label="Model Name"
              rules={[{ required: true, message: 'Please input model name!' }]}
            >
              <Input placeholder="Enter model name" />
            </Form.Item>

            <Form.Item
              name="description"
              label="Description"
            >
              <Input.TextArea placeholder="Enter model description" />
            </Form.Item>

            <Form.Item
              name="version"
              label="Version"
              rules={[{ required: true, message: 'Please input version!' }]}
            >
              <Input placeholder="Enter version (e.g., v1.0.0)" />
            </Form.Item>

            {selectedModel === 'random_forest' && (
              <>
                <Form.Item
                  name="nEstimators"
                  label="Number of Trees"
                  rules={[{ required: true, message: 'Please input number of trees!' }]}
                >
                  <Input type="number" min={1} placeholder="Enter number of trees" />
                </Form.Item>
                <Form.Item
                  name="maxDepth"
                  label="Maximum Depth"
                >
                  <Input type="number" min={1} placeholder="Enter maximum depth" />
                </Form.Item>
              </>
            )}

            {selectedModel === 'lstm' && (
              <>
                <Form.Item
                  name="units"
                  label="LSTM Units"
                  rules={[{ required: true, message: 'Please input number of LSTM units!' }]}
                >
                  <Input type="number" min={1} placeholder="Enter number of LSTM units" />
                </Form.Item>
                <Form.Item
                  name="epochs"
                  label="Number of Epochs"
                  rules={[{ required: true, message: 'Please input number of epochs!' }]}
                >
                  <Input type="number" min={1} placeholder="Enter number of epochs" />
                </Form.Item>
              </>
            )}

            <Form.Item>
              <Button 
                type="primary" 
                htmlType="submit" 
                icon={<ExperimentOutlined />}
                loading={loading}
              >
                Create Model
              </Button>
            </Form.Item>
          </Form>
        )}
      </Card>

      <Card className="models-list-card">
        <h2>Existing Models</h2>
        <Table 
          columns={columns} 
          dataSource={models}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 5 }}
        />
      </Card>

      <Modal
        title="Model Details"
        visible={isDetailsModalVisible}
        onCancel={() => setIsDetailsModalVisible(false)}
        footer={null}
        width={800}
      >
        {selectedModelDetails && (
          <Descriptions bordered>
            <Descriptions.Item label="Name" span={3}>
              {selectedModelDetails.name}
            </Descriptions.Item>
            <Descriptions.Item label="Type" span={3}>
              {selectedModelDetails.model_type}
            </Descriptions.Item>
            <Descriptions.Item label="Latest Version" span={3}>
              {selectedModelDetails.versions[0]?.version}
            </Descriptions.Item>
            <Descriptions.Item label="Accuracy" span={3}>
              {selectedModelDetails.versions[0]?.accuracy 
                ? `${(selectedModelDetails.versions[0].accuracy * 100).toFixed(2)}%`
                : 'N/A'}
            </Descriptions.Item>
            <Descriptions.Item label="Usage History" span={3}>
              <Table
                dataSource={selectedModelDetails.usage}
                columns={[
                  {
                    title: 'Timestamp',
                    dataIndex: 'timestamp',
                    key: 'timestamp',
                    render: (timestamp) => new Date(timestamp).toLocaleString()
                  },
                  {
                    title: 'Input Features',
                    dataIndex: 'input_features',
                    key: 'input_features',
                    render: (features) => `${features.length} features`
                  },
                  {
                    title: 'Predictions',
                    dataIndex: 'predictions',
                    key: 'predictions',
                    render: (predictions) => `${predictions.length} predictions`
                  }
                ]}
                pagination={{ pageSize: 5 }}
              />
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </div>
  );
};

export default Models; 