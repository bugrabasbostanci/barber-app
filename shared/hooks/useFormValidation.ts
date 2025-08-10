/**
 * useFormValidation hook for form state and validation management
 */

'use client';

import { useState, useCallback, useRef } from 'react';
import { z } from 'zod';
import { ValidationError } from '../utils/validationUtils';

export interface UseFormValidationOptions<T> {
  initialValues?: Partial<T>;
  schema?: z.ZodSchema<T>;
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
  onSubmit?: (values: T) => void | Promise<void>;
  onError?: (errors: Record<string, string>) => void;
}

export interface FormState<T> {
  values: T;
  errors: Record<string, string>;
  touched: Record<string, boolean>;
  isSubmitting: boolean;
  isValid: boolean;
  isDirty: boolean;
}

export function useFormValidation<T extends Record<string, any>>(
  options: UseFormValidationOptions<T> = {}
) {
  const {
    initialValues = {} as Partial<T>,
    schema,
    validateOnChange = true,
    validateOnBlur = true,
    onSubmit,
    onError
  } = options;

  const [state, setState] = useState<FormState<T>>({
    values: initialValues as T,
    errors: {},
    touched: {},
    isSubmitting: false,
    isValid: false,
    isDirty: false
  });

  const initialValuesRef = useRef(initialValues);

  const validate = useCallback((values: T): Record<string, string> => {
    if (!schema) return {};

    try {
      schema.parse(values);
      return {};
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors: Record<string, string> = {};
        error.errors.forEach(err => {
          const path = err.path.join('.');
          errors[path] = err.message;
        });
        return errors;
      }
      return { general: 'Doğrulama hatası oluştu' };
    }
  }, [schema]);

  const validateField = useCallback((name: keyof T, value: any): string | undefined => {
    if (!schema) return undefined;

    try {
      // Create a temporary object with the current field value
      const tempValues = { ...state.values, [name]: value };
      schema.parse(tempValues);
      return undefined;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldError = error.errors.find(err => 
          err.path.join('.') === String(name)
        );
        return fieldError?.message;
      }
      return 'Doğrulama hatası';
    }
  }, [schema, state.values]);

  const setFieldValue = useCallback((name: keyof T, value: any) => {
    setState(prev => {
      const newValues = { ...prev.values, [name]: value };
      const isDirty = JSON.stringify(newValues) !== JSON.stringify(initialValuesRef.current);
      
      let newErrors = prev.errors;
      if (validateOnChange) {
        const fieldError = validateField(name, value);
        newErrors = {
          ...prev.errors,
          [name]: fieldError || ''
        };
        // Remove empty error messages
        Object.keys(newErrors).forEach(key => {
          if (!newErrors[key]) {
            delete newErrors[key];
          }
        });
      }

      return {
        ...prev,
        values: newValues,
        errors: newErrors,
        isDirty,
        isValid: Object.keys(newErrors).length === 0
      };
    });
  }, [validateOnChange, validateField]);

  const setFieldTouched = useCallback((name: keyof T, touched: boolean = true) => {
    setState(prev => ({
      ...prev,
      touched: { ...prev.touched, [name]: touched }
    }));
  }, []);

  const setFieldError = useCallback((name: keyof T, error: string) => {
    setState(prev => ({
      ...prev,
      errors: { ...prev.errors, [name]: error },
      isValid: false
    }));
  }, []);

  const clearFieldError = useCallback((name: keyof T) => {
    setState(prev => {
      const newErrors = { ...prev.errors };
      delete newErrors[String(name)];
      return {
        ...prev,
        errors: newErrors,
        isValid: Object.keys(newErrors).length === 0
      };
    });
  }, []);

  const handleBlur = useCallback((name: keyof T) => {
    setFieldTouched(name, true);
    
    if (validateOnBlur) {
      const fieldError = validateField(name, state.values[name]);
      if (fieldError) {
        setFieldError(name, fieldError);
      } else {
        clearFieldError(name);
      }
    }
  }, [validateOnBlur, validateField, state.values, setFieldTouched, setFieldError, clearFieldError]);

  const validateForm = useCallback(() => {
    const errors = validate(state.values);
    setState(prev => ({
      ...prev,
      errors,
      isValid: Object.keys(errors).length === 0
    }));
    return Object.keys(errors).length === 0;
  }, [validate, state.values]);

  const handleSubmit = useCallback(async (e?: React.FormEvent) => {
    e?.preventDefault();

    setState(prev => ({ ...prev, isSubmitting: true }));

    const errors = validate(state.values);
    
    if (Object.keys(errors).length > 0) {
      setState(prev => ({
        ...prev,
        errors,
        isValid: false,
        isSubmitting: false
      }));
      onError?.(errors);
      return;
    }

    try {
      await onSubmit?.(state.values);
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setState(prev => ({ ...prev, isSubmitting: false }));
    }
  }, [state.values, validate, onSubmit, onError]);

  const reset = useCallback((newValues?: Partial<T>) => {
    const resetValues = newValues || initialValuesRef.current;
    setState({
      values: resetValues as T,
      errors: {},
      touched: {},
      isSubmitting: false,
      isValid: false,
      isDirty: false
    });
  }, []);

  const setValues = useCallback((values: Partial<T>) => {
    setState(prev => {
      const newValues = { ...prev.values, ...values };
      const isDirty = JSON.stringify(newValues) !== JSON.stringify(initialValuesRef.current);
      const errors = validate(newValues);
      
      return {
        ...prev,
        values: newValues,
        errors,
        isDirty,
        isValid: Object.keys(errors).length === 0
      };
    });
  }, [validate]);

  const setErrors = useCallback((errors: Record<string, string>) => {
    setState(prev => ({
      ...prev,
      errors,
      isValid: Object.keys(errors).length === 0
    }));
  }, []);

  // Helper functions for form fields
  const getFieldProps = useCallback((name: keyof T) => ({
    name: String(name),
    value: state.values[name] || '',
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      setFieldValue(name, e.target.value);
    },
    onBlur: () => handleBlur(name),
    error: state.touched[String(name)] && state.errors[String(name)],
    'aria-invalid': Boolean(state.errors[String(name)])
  }), [state.values, state.touched, state.errors, setFieldValue, handleBlur]);

  const getFieldError = useCallback((name: keyof T): string | undefined => {
    return state.touched[String(name)] ? state.errors[String(name)] : undefined;
  }, [state.touched, state.errors]);

  const isFieldTouched = useCallback((name: keyof T): boolean => {
    return Boolean(state.touched[String(name)]);
  }, [state.touched]);

  const isFieldError = useCallback((name: keyof T): boolean => {
    return Boolean(state.errors[String(name)]);
  }, [state.errors]);

  return {
    ...state,
    setFieldValue,
    setFieldTouched,
    setFieldError,
    clearFieldError,
    handleBlur,
    handleSubmit,
    validateForm,
    reset,
    setValues,
    setErrors,
    getFieldProps,
    getFieldError,
    isFieldTouched,
    isFieldError
  };
}