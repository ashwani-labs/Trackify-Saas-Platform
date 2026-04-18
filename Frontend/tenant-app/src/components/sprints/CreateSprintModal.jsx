import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { createSprint } from '../../features/sprints/sprintSlice';
import toast from 'react-hot-toast';

const CreateSprintModal = ({ isOpen, onClose, projectId }) => {
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({
    name: '',
    goal: '',
    startDate: '',
    endDate: '',
  });

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name) {
      toast.error('Sprint name is required');
      return;
    }
    
    try {
      await dispatch(createSprint({
        ...formData,
        projectId
      })).unwrap();
      toast.success('Sprint created successfully');
      onClose();
    } catch (err) {
      toast.error(err.message || 'Failed to create sprint');
    }
  };

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
      <div style={{ background: '#1c1c1c', padding: '24px', borderRadius: '8px', width: '400px', color: '#fff' }}>
        <h3 style={{ marginTop: 0, marginBottom: '16px' }}>Create Sprint</h3>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', color: '#888' }}>Sprint Name</label>
            <input name="name" value={formData.name} onChange={handleChange} required style={{ width: '100%', padding: '8px', boxSizing: 'border-box', background: '#2c2c2e', border: '1px solid #444', color: '#fff', borderRadius: '4px' }} />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', color: '#888' }}>Goal</label>
            <textarea name="goal" value={formData.goal} onChange={handleChange} style={{ width: '100%', padding: '8px', boxSizing: 'border-box', background: '#2c2c2e', border: '1px solid #444', color: '#fff', borderRadius: '4px', minHeight: '60px' }} />
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', color: '#888' }}>Start Date</label>
              <input type="date" name="startDate" value={formData.startDate} onChange={handleChange} style={{ width: '100%', padding: '8px', boxSizing: 'border-box', background: '#2c2c2e', border: '1px solid #444', color: '#fff', borderRadius: '4px' }} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', color: '#888' }}>End Date</label>
              <input type="date" name="endDate" value={formData.endDate} onChange={handleChange} style={{ width: '100%', padding: '8px', boxSizing: 'border-box', background: '#2c2c2e', border: '1px solid #444', color: '#fff', borderRadius: '4px' }} />
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px' }}>
            <button type="button" onClick={onClose} style={{ padding: '8px 16px', borderRadius: '4px', background: 'transparent', color: '#ccc', border: '1px solid #444', cursor: 'pointer' }}>Cancel</button>
            <button type="submit" style={{ padding: '8px 16px', borderRadius: '4px', background: '#3b82f6', color: '#fff', border: 'none', cursor: 'pointer' }}>Create</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateSprintModal;
