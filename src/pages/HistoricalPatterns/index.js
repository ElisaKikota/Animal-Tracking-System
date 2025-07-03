import React, { useState, useEffect } from 'react';
import { database } from '../../firebase';
import { ref, onValue } from 'firebase/database';
import { Select, Card, Button, Space, Typography, Row, Col, message } from 'antd';
import { Line } from '@ant-design/plots';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;
const { Option } = Select;

const HistoricalPatterns = () => {
  const [animals, setAnimals] = useState([]);
  const [selectedAnimal, setSelectedAnimal] = useState(null);
  const [selecting, setSelecting] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const animalsRef = ref(database, 'animals');
    const unsubscribe = onValue(animalsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const animalsList = Object.entries(data).map(([id, animal]) => ({
          id,
          ...animal
        }));
        setAnimals(animalsList);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleAnimalSelect = (animalId) => {
    const animal = animals.find(a => a.id === animalId);
    setSelectedAnimal(animal);
    setSelecting(false);
  };

  const handleEdit = () => {
    setSelecting(true);
  };

  const handleMakePrediction = () => {
    if (!selectedAnimal) {
      message.error('Please select an animal first');
      return;
    }
    navigate(`/models/predict/${selectedAnimal.id}`);
  };

  const handleTrainModel = () => {
    if (!selectedAnimal) {
      message.error('Please select an animal first');
      return;
    }
    navigate(`/models/train/${selectedAnimal.id}`);
  };

  return (
    <div style={{ padding: '24px' }}>
      <Title level={2}>Historical Patterns</Title>
      {/* DEBUG OUTPUT */}
      <div style={{ background: '#fffbe6', color: '#ad8b00', padding: 8, marginBottom: 12, borderRadius: 4 }}>
        <div><b>DEBUG:</b></div>
        <div>selectedAnimal: {JSON.stringify(selectedAnimal)}</div>
        <div>selecting: {String(selecting)}</div>
      </div>
      
      <Card style={{ marginBottom: '24px', maxWidth: 400 }}>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          {selecting ? (
            <div>
              <Text strong>Select Animal:</Text>
              <Select
                style={{ width: '100%', marginTop: '8px' }}
                placeholder="Choose an animal"
                onChange={handleAnimalSelect}
                value={selectedAnimal ? selectedAnimal.id : undefined}
              >
                {animals.map(animal => (
                  <Option key={animal.id} value={animal.id}>
                    {animal.name} ({animal.species})
                  </Option>
                ))}
              </Select>
            </div>
          ) : (
            <Card style={{ background: '#f6f8fa', border: 'none', marginBottom: 16 }}>
              <Space direction="vertical" style={{ width: '100%' }}>
                <Text type="secondary" style={{ fontSize: 16, fontWeight: 500 }}>
                  <span role="img" aria-label="animal" style={{ marginRight: 8 }}>👤</span>
                  Selected Animal
                </Text>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ background: '#e0e0e0', borderRadius: 16, padding: '4px 12px', fontWeight: 500 }}>
                    {selectedAnimal.name} {selectedAnimal.species ? `(${selectedAnimal.species})` : ''}
                  </span>
                  <Button type="link" onClick={handleEdit} style={{ padding: 0, fontWeight: 500 }}>EDIT</Button>
                </div>
              </Space>
            </Card>
          )}

          {!selecting && selectedAnimal && (
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
              <Button block type="primary" size="large" onClick={handleMakePrediction}>
                Make Prediction
              </Button>
              <Button block type="default" size="large" onClick={handleTrainModel}>
                Train Model
              </Button>
            </Space>
          )}
        </Space>
      </Card>
    </div>
  );
};

export default HistoricalPatterns; 