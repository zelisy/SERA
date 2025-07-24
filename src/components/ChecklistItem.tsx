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
    // Hiçbir alan zorunlu olmasın - tüm alanları optional yap
    const shape: Record<string, Yup.Schema> = {};
    
    fields.forEach(field => {
      let schema: Yup.Schema;
      
      switch (field.type) {
        case 'number':
          schema = Yup.number().optional().nullable();
          break;
        case 'date':
          schema = Yup.date().optional().nullable();
          break;
        case 'boolean':
          schema = Yup.boolean().optional();
          break;
        case 'select':
          schema = Yup.string().optional();
          break;
        case 'file':
          schema = Yup.string().optional();
          break;
        default:
          schema = Yup.string().optional();
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
        if (field.type === 'boolean') {
          values[field.id] = savedValue || false;
        } else if (field.type === 'number') {
          values[field.id] = savedValue || '';
        } else {
          values[field.id] = savedValue || '';
        }
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

  const getFieldWidth = (field: FormField) => {
    // Responsive width classes based on field type
    switch (field.type) {
      case 'textarea':
        return 'col-span-full'; // Full width for textarea
      case 'file':
        return 'col-span-full lg:col-span-2'; // Full on mobile, half on desktop
      case 'boolean':
        return 'col-span-full'; // Full width for checkboxes
      case 'date':
        return 'col-span-1 lg:col-span-1'; // Single column
      case 'number':
        return 'col-span-1 lg:col-span-1'; // Single column
      case 'select':
        return 'col-span-1 lg:col-span-1'; // Single column
      default:
        // Text fields - use full width if long, otherwise single column
        return field.id.includes('aciklama') || field.id.includes('address') || field.id.includes('adres') 
          ? 'col-span-full lg:col-span-2' 
          : 'col-span-1 lg:col-span-1';
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
      className: "w-full px-3 py-2.5 lg:px-4 lg:py-3 border border-gray-300 rounded-lg lg:rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 text-sm lg:text-base"
    };

    const fieldWidth = getFieldWidth(field);

    switch (field.type) {
      case 'textarea':
        return (
          <div key={field.id} className={fieldWidth}>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              {field.label}
            </label>
            <Field
              as="textarea"
              {...commonProps}
              rows={4}
              className={`${commonProps.className} resize-vertical min-h-[100px]`}
            />
            <div className="text-red-500 text-xs lg:text-sm mt-1">
              <ErrorMessage name={field.id} />
            </div>
          </div>
        );

      case 'select':
        return (
          <div key={field.id} className={fieldWidth}>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              {field.label}
            </label>
            <Field as="select" {...commonProps} className={`${commonProps.className} bg-white`}>
              <option value="">Seçiniz...</option>
              {field.options?.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </Field>
            {/* Eğer Diğer seçiliyse input göster */}
            {values[field.id] === 'Diğer' && (
              <input
                type="text"
                className="mt-2 w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200"
                placeholder="Lütfen belirtiniz..."
                value={String(values[`${field.id}_diger`] || '')}
                onChange={e => setFieldValue(`${field.id}_diger`, e.target.value)}
              />
            )}
            <div className="text-red-500 text-xs lg:text-sm mt-1">
              <ErrorMessage name={field.id} />
            </div>
          </div>
        );

      case 'boolean':
        return (
          <div key={field.id} className={fieldWidth}>
            <label className="flex items-start lg:items-center space-x-3 cursor-pointer p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
              <Field
                type="checkbox"
                name={field.id}
                className="h-4 w-4 lg:h-5 lg:w-5 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500 mt-0.5 lg:mt-0 flex-shrink-0"
              />
              <div className="flex-1">
                <span className="text-sm lg:text-base font-semibold text-gray-700">
                  {field.label}
                </span>
                {field.placeholder && (
                  <p className="text-xs lg:text-sm text-gray-500 mt-1">{field.placeholder}</p>
                )}
              </div>
            </label>
            <div className="text-red-500 text-xs lg:text-sm mt-1">
              <ErrorMessage name={field.id} />
            </div>
          </div>
        );

      case 'file':
        return (
          <div key={field.id} className={fieldWidth}>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              {field.label}
            </label>
            <div className="space-y-3">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-emerald-400 transition-colors">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      handleFileUpload(file, field.id, setFieldValue);
                    }
                  }}
                  className="block w-full text-xs lg:text-sm text-gray-500 file:mr-2 lg:file:mr-4 file:py-1.5 lg:file:py-2 file:px-3 lg:file:px-4 file:rounded-lg file:border-0 file:text-xs lg:file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 file:cursor-pointer"
                  disabled={uploadingFiles.has(field.id)}
                />
              </div>
              
              {uploadingFiles.has(field.id) && (
                <div className="flex items-center space-x-2 text-emerald-600 bg-emerald-50 p-3 rounded-lg">
                  <div className="animate-spin h-4 w-4 border-2 border-emerald-600 border-t-transparent rounded-full"></div>
                  <span className="text-xs lg:text-sm font-medium">Fotoğraf yükleniyor...</span>
                </div>
              )}
              
              {values[field.id] && (
                <div className="relative group">
                  <img 
                    src={values[field.id] as string} 
                    alt="Preview" 
                    className="w-full max-w-xs lg:max-w-sm max-h-32 lg:max-h-48 object-cover rounded-lg shadow-md border border-gray-200"
                  />
                  <button
                    type="button"
                    onClick={() => setFieldValue(field.id, '')}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              )}
            </div>
            <div className="text-red-500 text-xs lg:text-sm mt-1">
              <ErrorMessage name={field.id} />
            </div>
          </div>
        );

      default:
        return (
          <div key={field.id} className={fieldWidth}>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              {field.label}
            </label>
            <Field
              type={field.type}
              {...commonProps}
            />
            <div className="text-red-500 text-xs lg:text-sm mt-1">
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
    <div className="bg-white rounded-xl lg:rounded-2xl shadow-sm border border-gray-100 transition-all duration-200 hover:shadow-md">
      <div className="p-4 lg:p-6">
        <div className="flex items-start lg:items-center space-x-3 lg:space-x-4">
          <input
            type="checkbox"
            checked={item.completed}
            onChange={(e) => handleStatusChange(e.target.checked)}
            className="h-4 w-4 lg:h-5 lg:w-5 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500 cursor-pointer mt-1 lg:mt-0 flex-shrink-0"
          />
          <span className={`flex-1 text-sm lg:text-base xl:text-lg font-medium transition-all duration-200 leading-relaxed ${
            item.completed 
              ? 'text-gray-500 line-through' 
              : 'text-gray-800'
          }`}>
            {item.label}
          </span>
        </div>

        {showDetails && item.detailFields && (
          <div className="mt-4 lg:mt-6 bg-gray-50 rounded-lg lg:rounded-xl p-4 lg:p-6">
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
                  {/* Responsive Grid System */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
                    {item.detailFields?.map(field => renderField(field, values, setFieldValue))}
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200">
                    <button
                      type="submit"
                      className="flex-1 sm:flex-none bg-gradient-to-r from-emerald-500 to-blue-500 text-white font-semibold py-2.5 lg:py-3 px-4 lg:px-6 rounded-lg lg:rounded-xl hover:from-emerald-600 hover:to-blue-600 focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition-all duration-200 transform hover:scale-105 text-sm lg:text-base"
                    >
                      💾 Kaydet
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowDetails(false)}
                      className="flex-1 sm:flex-none bg-gray-100 text-gray-700 font-semibold py-2.5 lg:py-3 px-4 lg:px-6 rounded-lg lg:rounded-xl hover:bg-gray-200 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all duration-200 text-sm lg:text-base"
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