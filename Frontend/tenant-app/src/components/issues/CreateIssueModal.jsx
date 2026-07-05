import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createIssue } from '../../features/issues/issueSlice';
import { Modal, Button, Input, Select, Textarea, Alert, useFormFields } from '@trackify/shared';

const PRIORITY_OPTIONS = [
  { value: 'HIGH', label: 'High' },
  { value: 'MEDIUM', label: 'Medium' },
  { value: 'LOW', label: 'Low' },
];

const STATUS_OPTIONS = [
  { value: 'TODO', label: 'To Do' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'DONE', label: 'Done' },
];

const validators = {
  title: (value) => (!value?.trim() ? 'Issue title is required' : undefined),
};

const CreateIssueModal = ({ isOpen, onClose, projectId }) => {
  const dispatch = useDispatch();
  const { isLoading, error } = useSelector((state) => state.issues);

  const { values, handleChange, handleBlur, validateAll, getFieldError, reset } = useFormFields(
    { title: '', description: '', priority: 'MEDIUM', status: 'TODO', labels: '' },
    validators
  );

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateAll()) return;

    const result = await dispatch(
      createIssue({
        ...values,
        labels: values.labels
          .split(',')
          .map((label) => label.trim())
          .filter(Boolean),
        projectId,
      })
    );
    if (createIssue.fulfilled.match(result)) {
      reset();
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Create Issue"
      footer={
        <>
          <Button type="button" variant="secondary" onClick={handleClose}>
            Cancel
          </Button>
          <Button type="submit" form="create-issue-form" isLoading={isLoading}>
            Create Issue
          </Button>
        </>
      }
    >
      <form id="create-issue-form" onSubmit={handleSubmit}>
        <Input
          id="issue-title"
          name="title"
          label="Issue title *"
          value={values.title}
          onChange={handleChange}
          onBlur={handleBlur}
          error={getFieldError('title')}
          placeholder="What needs to be done?"
          autoFocus
          required
        />

        <Textarea
          id="issue-desc"
          name="description"
          label="Description"
          value={values.description}
          onChange={handleChange}
          rows={4}
          placeholder="Add more detail..."
        />

        <Input
          id="issue-labels"
          name="labels"
          label="Labels"
          value={values.labels}
          onChange={handleChange}
          placeholder="bug, frontend, urgent"
          inputClassName="input--with-icon"
        />
        <p className="form-hint">Separate multiple labels with commas.</p>

        <div className="form-row form-row--2">
          <Select
            id="issue-priority"
            name="priority"
            label="Priority"
            value={values.priority}
            onChange={handleChange}
            options={PRIORITY_OPTIONS}
          />
          <Select
            id="issue-status"
            name="status"
            label="Status"
            value={values.status}
            onChange={handleChange}
            options={STATUS_OPTIONS}
          />
        </div>

        {error && <Alert>{error}</Alert>}
      </form>
    </Modal>
  );
};

export default CreateIssueModal;
