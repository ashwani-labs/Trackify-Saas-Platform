import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createProject } from '../../features/projects/projectSlice';
import { Briefcase, Key, Database } from 'lucide-react';
import { Modal, Button, Alert, Select, Textarea } from '@trackify/shared';
import toast from 'react-hot-toast';

const INITIAL_FORM = {
  name: '',
  key: '',
  description: '',
  category: 'Software',
};

const CATEGORY_OPTIONS = [
  { value: 'Software', label: 'Software Engineering' },
  { value: 'Business', label: 'Business Management' },
  { value: 'Marketing', label: 'Marketing & Growth' },
  { value: 'Finance', label: 'Finance & Operations' },
];

const CreateProjectModal = ({ isOpen, onClose }) => {
  const dispatch = useDispatch();
  const { isLoading, error } = useSelector((state) => state.projects);
  const [formData, setFormData] = useState(INITIAL_FORM);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
      ...(name === 'name' && !prev.key
        ? {
            key: value
              .substring(0, 3)
              .toUpperCase()
              .replace(/[^A-Z]/g, ''),
          }
        : {}),
    }));
  };

  const handleClose = () => {
    if (isLoading) return;
    setFormData(INITIAL_FORM);
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const resultAction = await dispatch(createProject(formData));
    if (createProject.fulfilled.match(resultAction)) {
      toast.success(`Project "${formData.name}" created`);
      setFormData(INITIAL_FORM);
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Create New Project"
      footer={
        <>
          <Button type="button" variant="secondary" onClick={handleClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" form="create-project-form" isLoading={isLoading}>
            Create Project
          </Button>
        </>
      }
    >
      <form id="create-project-form" className="form-stack" onSubmit={handleSubmit}>
        {error && <Alert className="page-alert">{error}</Alert>}

        <div className="form-group">
          <label className="form-label" htmlFor="name">
            Project name *
          </label>
          <div className="input-wrap">
            <Briefcase className="input-wrap__icon" size={16} aria-hidden />
            <input
              type="text"
              id="name"
              name="name"
              className="input input--with-icon"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g. Apollo Mission"
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="key">
            Project key *
          </label>
          <div className="input-wrap">
            <Key className="input-wrap__icon" size={16} aria-hidden />
            <input
              type="text"
              id="key"
              name="key"
              className="input input--with-icon"
              value={formData.key}
              onChange={handleChange}
              placeholder="e.g. APO"
              required
              maxLength="10"
            />
          </div>
          <span className="form-hint">Used as a prefix for issue IDs (e.g. APO-123).</span>
        </div>

        <Select
          id="category"
          name="category"
          label="Category"
          icon={Database}
          value={formData.category}
          onChange={handleChange}
          options={CATEGORY_OPTIONS}
        />

        <Textarea
          id="description"
          name="description"
          label="Description (optional)"
          value={formData.description}
          onChange={handleChange}
          placeholder="Briefly describe the project goals..."
          className="form-group"
        />
      </form>
    </Modal>
  );
};

export default CreateProjectModal;
