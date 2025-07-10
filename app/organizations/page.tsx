'use client';

import React, { useState, useEffect } from 'react';
import type { Organization } from '@/app/types/organization';
import { Button, Table, Modal, Form, Input, message } from 'antd';

async function fetchOrganizations() {
  try {
    const response = await fetch('/api/organizations');
    if (!response.ok) {
      throw new Error('Failed to fetch organizations');
    }
    const { data } = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching organizations:', error);
    message.error('Failed to load organizations');
    return [];
  }
}

async function createOrganization(name: string, description?: string) {
  try {
    const response = await fetch('/api/organizations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, description }),
    });

    if (!response.ok) {
      throw new Error('Failed to create organization');
    }

    const { data } = await response.json();
    message.success('Organization created successfully');
    return data;
  } catch (error) {
    console.error('Error creating organization:', error);
    message.error('Failed to create organization');
    throw error;
  }
}

const OrganizationPage: React.FC = () => {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);

  useEffect(() => {
    fetchOrganizations().then(data => {
      setOrganizations(data);
      setLoading(false);
    });
  }, []);

  const handleCreate = async (values: { name: string; description?: string }) => {
    try {
      setLoading(true);
      const newOrg = await createOrganization(values.name, values.description);
      setOrganizations([...organizations, newOrg]);
      setIsModalVisible(false);
    } catch (error) {
      console.error('Failed to create organization:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ margin: 0 }}>Organizations</h1>
        <Button type="primary" onClick={() => setIsModalVisible(true)}>
          Create Organization
        </Button>
      </div>

      <Table
        dataSource={organizations}
        loading={loading}
        rowKey="_id"
        columns={[
          { title: 'Name', dataIndex: 'name', key: 'name' },
          { title: 'Description', dataIndex: 'description', key: 'description' },
          {
            title: 'Created At',
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: (date: string) => new Date(date).toLocaleDateString()
          },
          {
            title: 'Updated At',
            dataIndex: 'updatedAt',
            key: 'updatedAt',
            render: (date: string) => new Date(date).toLocaleDateString()
          },
        ]}
      />

      <Modal
        title="Create Organization"
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
      >
        <Form layout="vertical" onFinish={handleCreate}>
          <Form.Item
            name="name"
            label="Name"
            rules={[{ required: true, message: 'Please input the organization name!' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <Input.TextArea />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading}>
              Create
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default OrganizationPage;
