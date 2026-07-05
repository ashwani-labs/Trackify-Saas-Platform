import { useCallback, useRef, useState } from 'react';

/**
 * Lightweight form state with blur validation.
 * validators: { fieldName: (value, allValues) => string | undefined }
 */
export function useFormFields(initialValues, validators = {}) {
  const initialValuesRef = useRef(initialValues);
  initialValuesRef.current = initialValues;

  const validatorsRef = useRef(validators);
  validatorsRef.current = validators;

  const [values, setValues] = useState(initialValues);
  const [touched, setTouched] = useState({});
  const [errors, setErrors] = useState({});

  const validateField = useCallback((name, nextValues) => {
    const validator = validatorsRef.current[name];
    if (!validator) return undefined;
    return validator(nextValues[name], nextValues);
  }, []);

  const validateAll = useCallback(() => {
    const nextErrors = {};
    Object.keys(validatorsRef.current).forEach((name) => {
      const message = validateField(name, values);
      if (message) nextErrors[name] = message;
    });
    setErrors(nextErrors);
    setTouched(Object.keys(validatorsRef.current).reduce((acc, key) => ({ ...acc, [key]: true }), {}));
    return Object.keys(nextErrors).length === 0;
  }, [validateField, values]);

  const setFieldValue = useCallback(
    (name, value) => {
      setValues((prev) => {
        const next = { ...prev, [name]: value };
        if (touched[name]) {
          const message = validateField(name, next);
          setErrors((prevErrors) => {
            const updated = { ...prevErrors };
            if (message) updated[name] = message;
            else delete updated[name];
            return updated;
          });
        }
        return next;
      });
    },
    [touched, validateField]
  );

  const handleChange = useCallback(
    (e) => {
      const { name, value } = e.target;
      setFieldValue(name, value);
    },
    [setFieldValue]
  );

  const handleBlur = useCallback(
    (e) => {
      const { name } = e.target;
      setTouched((prev) => ({ ...prev, [name]: true }));
      const message = validateField(name, values);
      setErrors((prev) => {
        const next = { ...prev };
        if (message) next[name] = message;
        else delete next[name];
        return next;
      });
    },
    [validateField, values]
  );

  const reset = useCallback((nextValues) => {
    setValues(nextValues ?? initialValuesRef.current);
    setTouched({});
    setErrors({});
  }, []);

  const getFieldError = useCallback((name) => (touched[name] ? errors[name] : undefined), [errors, touched]);

  const isValid = Object.keys(validatorsRef.current).every((name) => !validateField(name, values));

  return {
    values,
    errors,
    touched,
    isValid,
    setFieldValue,
    handleChange,
    handleBlur,
    validateAll,
    reset,
    getFieldError,
  };
}
