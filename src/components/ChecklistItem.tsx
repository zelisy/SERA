import React, { useState } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import type { FormField, ChecklistItem as ChecklistItemType } from '../types/checklist';
import { uploadToCloudinaryDirect, validateImageFile } from '../utils/tempCloudinaryUtils';

interface ChecklistItemProps {
  item: ChecklistItemType;
  onUpdate: (itemId: string, completed: boolean, data?: Record<string, string | number | boolean | string[]>) => void;
}

const ChecklistItem: React.FC<ChecklistItemProps> = ({ item, onUpdate }) => {
  const [showDetails, setShowDetails] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState<Set<string>>(new Set());

  const createValidationSchema = (fields: FormField[]) => {
    const shape: Record<string, Yup.Schema> = {};
    
    fields.forEach(field => {
      let schema: Yup.Schema = Yup.string();
      
      switch (field.type) {
        case 'number':
          schema = Yup.number();
          if (field.validation?.min !== undefined) {
            schema = (schema as Yup.NumberSchema).min(field.validation.min);
          }
          if (field.validation?.max !== undefined) {
            schema = (schema as Yup.NumberSchema).max(field.validation.max);
          }
          break;
        case 'date':
          schema = Yup.date();
          break;
        case 'boolean':
          schema = Yup.boolean();
          break;
        case 'select':
          schema = Yup.string().oneOf(field.options || []);
          break;
        case 'file':
          schema = Yup.string().url('Geçerli bir URL olmalıdır');
          break;
        default:
          if (field.validation?.pattern) {
            schema = (schema as Yup.StringSchema).matches(
              new RegExp(field.validation.pattern),
              field.validation.message || 'Geçersiz format'
            );
          }
      }
      
      if (field.required) {
        schema = schema.required(`${field.label} zorunludur`);
      }
      
      shape[field.id] = schema;
    });
    
    return Yup.object().shape(shape);
  };

  const getInitialValues = (fields: FormField[]) => {
    const values: Record<string, string | number | boolean> = {};
    fields.forEach(field => {
      const savedValue = item.data?.[field.id];
      if (Array.isArray(savedValue)) {
        values[field.id] = savedValue.join(', ');
      } else {
        values[field.id] = savedValue || 
          (field.type === 'boolean' ? false : 
           field.type === 'number' ? 0 : '');
      }
    });
    return values;
  };

  const isFieldVisible = (field: FormField, values: Record<string, string | number | boolean>) => {
    if (!field.dependsOn || field.showWhen === undefined) return true;
    return values[field.dependsOn] === field.showWhen;
  };

  const handleFileUpload = async (
    file: File, 
    fieldId: string, 
    setFieldValue: (field: string, value: string) => void
  ) => {
    try {
      validateImageFile(file);
      setUploadingFiles(prev => new Set(prev).add(fieldId));
      
      const url = await uploadToCloudinaryDirect(file);
      setFieldValue(fieldId, url);
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Yükleme hatası');
    } finally {
      setUploadingFiles(prev => {
        const newSet = new Set(prev);
        newSet.delete(fieldId);
        return newSet;
      });
    }
  };

  const renderField = (
    field: FormField, 
    values: Record<string, string | number | boolean>,
    setFieldValue: (field: string, value: string | number | boolean) => void
  ) => {
    if (!isFieldVisible(field, values)) return null;

    const commonProps = {
      id: field.id,
      name: field.id,
      placeholder: field.placeholder,
      className: "w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
    };

    switch (field.type) {
      case 'textarea':
        return (
          <div key={field.id} className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </label>
            <Field
              as="textarea"
              {...commonProps}
              rows={4}
              className={`${commonProps.className} resize-vertical`}
            />
            <div className="text-red-500 text-sm mt-1">
              <ErrorMessage name={field.id} />
            </div>
          </div>
        );

      case 'select':
        return (
          <div key={field.id} className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </label>
            <Field as="select" {...commonProps}>
              <option value="">Seçiniz...</option>
              {field.options?.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </Field>
            <div className="text-red-500 text-sm mt-1">
              <ErrorMessage name={field.id} />
            </div>
          </div>
        );

      case 'boolean':
        return (
          <div key={field.id} className="mb-6">
            <label className="flex items-center space-x-3 cursor-pointer">
              <Field
                type="checkbox"
                name={field.id}
                className="h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm font-semibold text-gray-700">
                {field.label} {field.required && <span className="text-red-500">*</span>}
              </span>
            </label>
            <div className="text-red-500 text-sm mt-1">
              <ErrorMessage name={field.id} />
            </div>
          </div>
        );

      case 'file':
        return (
          <div key={field.id} className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </label>
            <div className="space-y-3">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    handleFileUpload(file, field.id, setFieldValue);
                  }
                }}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 file:cursor-pointer"
                disabled={uploadingFiles.has(field.id)}
              />
              {uploadingFiles.has(field.id) && (
                <div className="flex items-center space-x-2 text-blue-600">
                  <div className="animate-spin h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full"></div>
                  <span className="text-sm">Yükleniyor...</span>
                </div>
              )}
              {values[field.id] && (
                <div className="mt-3">
                  <img 
                    src={values[field.id] as string} 
                    alt="Preview" 
                    className="max-w-xs max-h-48 rounded-lg shadow-md border border-gray-200"
                  />
                </div>
              )}
            </div>
            <div className="text-red-500 text-sm mt-1">
              <ErrorMessage name={field.id} />
            </div>
          </div>
        );

      default:
        return (
          <div key={field.id} className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </label>
            <Field
              type={field.type}
              {...commonProps}
            />
            <div className="text-red-500 text-sm mt-1">
              <ErrorMessage name={field.id} />
            </div>
          </div>
        );
    }
  };

  const handleStatusChange = (completed: boolean) => {
    if (completed && item.hasDetails) {
      setShowDetails(true);
    } else {
      onUpdate(item.id, completed);
      setShowDetails(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 transition-all duration-200 hover:shadow-md">
      <div className="p-4 md:p-6">
        <div className="flex items-center space-x-3 md:space-x-4">
          <input
            type="checkbox"
            checked={item.completed}
            onChange={(e) => handleStatusChange(e.target.checked)}
            className="h-5 w-5 text-green-600 border-gray-300 rounded focus:ring-green-500 cursor-pointer"
          />
          <span className={`flex-1 text-base md:text-lg font-medium transition-all duration-200 ${
            item.completed 
              ? 'text-gray-500 line-through' 
              : 'text-gray-800'
          }`}>
            {item.label}
          </span>
        </div>

        {showDetails && item.detailFields && (
          <div className="mt-6 bg-gray-50 rounded-xl p-4 md:p-6">
            <Formik
              initialValues={getInitialValues(item.detailFields)}
              validationSchema={createValidationSchema(item.detailFields)}
              onSubmit={(values) => {
                onUpdate(item.id, true, values);
                setShowDetails(false);
              }}
            >
              {({ values, setFieldValue }) => (
                <Form className="space-y-4">
                  <div className="grid gap-6 md:grid-cols-2">
                    {item.detailFields?.map(field => renderField(field, values, setFieldValue))}
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200">
                    <button
                      type="submit"
                      className="flex-1 sm:flex-none bg-gradient-to-r from-green-500 to-blue-500 text-white font-semibold py-3 px-6 rounded-xl hover:from-green-600 hover:to-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 transform hover:scale-105"
                    >
                      💾 Kaydet
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowDetails(false)}
                      className="flex-1 sm:flex-none bg-gray-100 text-gray-700 font-semibold py-3 px-6 rounded-xl hover:bg-gray-200 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all duration-200"
                    >
                      ❌ İptal
                    </button>
                  </div>
                </Form>
              )}
            </Formik>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChecklistItem; 