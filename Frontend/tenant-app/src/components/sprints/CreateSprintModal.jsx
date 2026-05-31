import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { createSprint } from '../../features/sprints/sprintSlice';
import toast from 'react-hot-toast';
import { Modal, Button } from '@trackify/shared';

const CreateSprintModal = ({ isOpen, onClose, projectId }) => {
  const dispatch = useDispatch();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    goal: '',
    startDate: '',
    endDate: '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name) {
      toast.error('Sprint name is required');
      return;
    }

    setIsSubmitting(true);
    try {
      await dispatch(
        createSprint({
          ...formData,
          projectId,
        })
      ).unwrap();
      toast.success('Sprint created successfully');
      setFormData({ name: '', goal: '', startDate: '', endDate: '' });
      onClose();
    } catch (err) {
      toast.error(err.message || 'Failed to create sprint');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create Sprint"
      className="modal--narrow"
      footer={
        <>
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form="create-sprint-form" isLoading={isSubmitting}>
            Create Sprint
          </Button>
        </>
      }
    >
      <form id="create-sprint-form" onSubmit={handleSubmit} className="form-stack">
        <div className="form-group">
          <label className="form-label" htmlFor="sprint-name">
            Sprint Name *
          </label>
          <input
            id="sprint-name"
            name="name"
            className="input-field"
            value={formData.name}
            onChange={handleChange}
            required
            placeholder="Sprint 1"
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="sprint-goal">
            Goal
          </label>
          <textarea
            id="sprint-goal"
            name="goal"
            className="input-field"
            value={formData.goal}
            onChange={handleChange}
            rows="3"
            placeholder="What should this sprint achieve?"
            style={{ resize: 'vertical' }}
          />
        </div>

        <div className="form-row form-row--2">
          <div className="form-group">
            <label className="form-label" htmlFor="sprint-start">
              Start Date
            </label>
            <input
              id="sprint-start"
              type="date"
              name="startDate"
              className="input-field"
              value={formData.startDate}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="sprint-end">
              End Date
            </label>
            <input
              id="sprint-end"
              type="date"
              name="endDate"
              className="input-field"
              value={formData.endDate}
              onChange={handleChange}
            />
          </div>
        </div>
      </form>
    </Modal>
  );
};

export default CreateSprintModal;
