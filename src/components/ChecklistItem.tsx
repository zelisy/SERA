import React, { useState } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import type { FormField, ChecklistItem as ChecklistItemType } from '../types/checklist';
import { uploadToCloudinaryDirect, validateImageFile } from '../utils/tempCloudinaryUtils';
import MobileCameraButton from './MobileCameraButton';
import PlantControlButton from './PlantControlButton';
import ImageLightbox from './ImageLightbox';
import OptimizedImage from './OptimizedImage';

interface ChecklistItemProps {
  item: ChecklistItemType;
  onUpdate: (itemId: string, completed: boolean, data?: Record<string, string | number | boolean | string[] | { selected: boolean; photo: string; } | { selected: boolean; note: string; }>) => void;
  onPlantControlClick?: () => void;
}

const ChecklistItem: React.FC<ChecklistItemProps> = ({ item, onUpdate, onPlantControlClick }) => {
  const [showDetails, setShowDetails] = useState<boolean>(() => {
    const hasSavedData = Boolean(item.data && Object.keys(item.data).length > 0);
    return Boolean(item.hasDetails && (item.completed || hasSavedData));
  });
  const [uploadingFiles, setUploadingFiles] = useState<Set<string>>(new Set());
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);

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
        case 'multiple-files':
          schema = Yup.array().of(Yup.string()).optional();
          break;
        case 'pest-control':
          schema = Yup.object().shape({
            selected: Yup.boolean().optional(),
            photo: Yup.string().optional()
          }).optional();
          break;
              case 'development-stage':
        schema = Yup.object().shape({
          selected: Yup.boolean().optional(),
          note: Yup.string().optional()
        }).optional();
        break;
      case 'radio':
        schema = Yup.string().optional();
        break;
      case 'checkbox':
        schema = Yup.boolean().optional();
        break;
      case 'subheader':
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
    const values: Record<string, string | number | boolean | string[] | { selected: boolean; photo: string; } | { selected: boolean; note: string; }> = {};
    fields.forEach(field => {
      const savedValue = item.data?.[field.id];
      switch (field.type) {
        case 'boolean':
          values[field.id] = (typeof savedValue === 'boolean') ? savedValue : false;
          break;
        case 'number':
          values[field.id] = (typeof savedValue === 'number') ? savedValue : '';
          break;
        case 'pest-control':
          values[field.id] = (savedValue && typeof savedValue === 'object') ? (savedValue as { selected: boolean; photo: string }) : { selected: false, photo: '' };
          break;
        case 'development-stage':
          values[field.id] = (savedValue && typeof savedValue === 'object') ? (savedValue as { selected: boolean; note: string }) : { selected: false, note: '' };
          break;
        case 'multiple-files':
          values[field.id] = Array.isArray(savedValue) ? (savedValue as string[]) : [];
          break;
        case 'radio':
        case 'select':
        case 'text':
        case 'date':
        case 'file':
          values[field.id] = (typeof savedValue === 'string') ? savedValue : '';
          break;
        case 'checkbox':
          values[field.id] = (typeof savedValue === 'boolean') ? savedValue : false;
          break;
        case 'subheader':
          values[field.id] = (typeof savedValue === 'string') ? savedValue : '';
          break;
        default:
          values[field.id] = (typeof savedValue === 'string') ? savedValue : '';
      }
    });
    return values;
  };

  const isFieldVisible = (field: FormField, values: Record<string, string | number | boolean | string[] | { selected: boolean; photo: string; } | { selected: boolean; note: string; }>) => {
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

  const handleMultipleFileUpload = async (
    files: File[], 
    fieldId: string, 
    setFieldValue: (field: string, value: string | number | boolean | string[] | { selected: boolean; photo: string; } | { selected: boolean; note: string; }) => void,
    currentUrls: string[] = []
  ) => {
    try {
      setUploadingFiles(prev => new Set(prev).add(fieldId));
      
      const uploadPromises = Array.from(files).map(async (file) => {
        validateImageFile(file);
        return await uploadToCloudinaryDirect(file);
      });
      
      const newUrls = await Promise.all(uploadPromises);
      const allUrls = [...currentUrls, ...newUrls];
      setFieldValue(fieldId, allUrls);
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
      case 'multiple-files':
        return 'col-span-full'; // Full width for multiple files
      case 'pest-control':
        return 'col-span-full'; // Full width for pest control
      case 'development-stage':
        return 'col-span-full'; // Full width for development stage
      case 'boolean':
        return 'col-span-full'; // Full width for checkboxes
      case 'radio':
        return 'col-span-full'; // Full width for radio buttons
      case 'checkbox':
        return 'col-span-full'; // Full width for checkboxes
      case 'subheader':
        return 'col-span-full'; // Full width for subheaders
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
    values: Record<string, string | number | boolean | string[] | { selected: boolean; photo: string; } | { selected: boolean; note: string; }>,
    setFieldValue: (field: string, value: string | number | boolean | string[] | { selected: boolean; photo: string; } | { selected: boolean; note: string; }) => void
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
            <textarea
              id={commonProps.id}
              name={commonProps.name}
              placeholder={commonProps.placeholder}
              rows={4}
              className={`${commonProps.className} resize-vertical min-h-[100px]`}
              value={String(values[field.id] ?? '')}
              onChange={(e) => {
                const v = e.target.value;
                setFieldValue(field.id, v);
                // Form submit sırasında onUpdate çağrılıyor; değişimde çağırmak focus kaybına yol açtığı için kaldırıldı
              }}
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
            <select
              id={commonProps.id}
              name={commonProps.name}
              className={`${commonProps.className} bg-white`}
              value={String(values[field.id] ?? '')}
              onChange={(e) => {
                const v = e.target.value;
                setFieldValue(field.id, v);
                // Değişimde persist etmiyoruz; submit'te kaydedilecek
              }}
            >
              <option value="">Seçiniz...</option>
              {field.options?.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
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
              <input
                type="checkbox"
                checked={Boolean(values[field.id])}
                onChange={(e) => {
                  const v = e.target.checked;
                  setFieldValue(field.id, v);
                  // Değişimde persist etmiyoruz; submit'te kaydedilecek
                }}
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
              <MobileCameraButton
                onPhotoTaken={(file) => handleFileUpload(file, field.id, setFieldValue)}
                onGallerySelect={(files) => {
                  if (files.length > 0) {
                    handleFileUpload(files[0], field.id, setFieldValue);
                  }
                }}
                disabled={uploadingFiles.has(field.id)}
              />
              {uploadingFiles.has(field.id) && (
                <div className="flex items-center space-x-2 text-emerald-600 bg-emerald-50 p-3 rounded-lg">
                  <div className="animate-spin h-4 w-4 border-2 border-emerald-600 border-t-transparent rounded-full"></div>
                  <span className="text-xs lg:text-sm font-medium">Fotoğraf yükleniyor...</span>
                </div>
              )}
              {values[field.id] && (
                <div className="relative group">
                  <button type="button" onClick={() => setPreviewImageUrl(values[field.id] as string)} className="focus:outline-none">
                    <OptimizedImage
                      src={values[field.id] as string}
                      alt="Preview"
                      className="w-full max-w-xs lg:max-w-sm max-h-32 lg:max-h-48 object-cover rounded-lg shadow-md border border-gray-200 hover:scale-105 transition-transform duration-200 cursor-pointer"
                    />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setFieldValue(field.id, '');
                    }}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 group-focus:opacity-100 transition-opacity touch-manipulation"
                    style={{ minWidth: '36px', minHeight: '36px' }}
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

      case 'multiple-files':
        {
          const currentUrls = Array.isArray(values[field.id]) ? values[field.id] as string[] : [];
          return (
            <div key={field.id} className={fieldWidth}>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {field.label}
              </label>
              <div className="space-y-3">
                <MobileCameraButton
                  onPhotoTaken={(file) => handleMultipleFileUpload([file], field.id, setFieldValue, currentUrls)}
                  onGallerySelect={(files) => handleMultipleFileUpload(Array.from(files), field.id, setFieldValue, currentUrls)}
                  multiple={true}
                  disabled={uploadingFiles.has(field.id)}
                />
                {uploadingFiles.has(field.id) && (
                  <div className="flex items-center space-x-2 text-emerald-600 bg-emerald-50 p-3 rounded-lg">
                    <div className="animate-spin h-4 w-4 border-2 border-emerald-600 border-t-transparent rounded-full"></div>
                    <span className="text-xs lg:text-sm font-medium">Fotoğraflar yükleniyor...</span>
                  </div>
                )}
                {currentUrls.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {currentUrls.map((url, index) => (
                      <div key={index} className="relative group">
                        <button type="button" onClick={() => setPreviewImageUrl(url)} className="focus:outline-none">
                          <OptimizedImage
                            src={url}
                            alt={`Fotoğraf ${index + 1}`}
                            className="w-full h-24 lg:h-32 object-cover rounded-lg shadow-md border border-gray-200 hover:scale-105 transition-transform duration-200 cursor-pointer"
                          />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const newUrls = currentUrls.filter((_, i) => i !== index);
                            setFieldValue(field.id, newUrls);
                          }}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 group-focus:opacity-100 transition-opacity touch-manipulation"
                          style={{ minWidth: '32px', minHeight: '32px' }}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="text-red-500 text-xs lg:text-sm mt-1">
                <ErrorMessage name={field.id} />
              </div>
            </div>
          );
        }

      case 'pest-control':
        {
          const pestValue = values[field.id] as { selected: boolean; photo: string } || { selected: false, photo: '' };
          return (
            <div key={field.id} className={fieldWidth}>
              <div className="space-y-3">
                {/* Checkbox for selection */}
                <label className="flex items-start lg:items-center space-x-3 cursor-pointer p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                  <input
                    type="checkbox"
                    checked={pestValue.selected}
                    onChange={(e) => {
                      const newValue = { ...pestValue, selected: e.target.checked };
                      setFieldValue(field.id, newValue);
                      // Submit'te kaydedilecek
                    }}
                    className="h-4 w-4 lg:h-5 lg:w-5 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500 mt-0.5 lg:mt-0 flex-shrink-0"
                  />
                  <div className="flex-1">
                    <span className="text-sm lg:text-base font-semibold text-gray-700">
                      {field.label}
                    </span>
                  </div>
                </label>

                {/* Photo upload section - only show if selected */}
                {pestValue.selected && (
                  <div className="ml-7 space-y-3">
                    <MobileCameraButton
                      onPhotoTaken={(file) => {
                        handleFileUpload(file, `${field.id}_photo`, (_, photoUrl) => {
                          const newValue = { ...pestValue, photo: photoUrl };
                          setFieldValue(field.id, newValue);
                        });
                      }}
                      onGallerySelect={(files) => {
                        if (files.length > 0) {
                          handleFileUpload(files[0], `${field.id}_photo`, (_, photoUrl) => {
                            const newValue = { ...pestValue, photo: photoUrl };
                            setFieldValue(field.id, newValue);
                          });
                        }
                      }}
                      disabled={uploadingFiles.has(`${field.id}_photo`)}
                    />
                    
                    {uploadingFiles.has(`${field.id}_photo`) && (
                      <div className="flex items-center space-x-2 text-emerald-600 bg-emerald-50 p-3 rounded-lg">
                        <div className="animate-spin h-4 w-4 border-2 border-emerald-600 border-t-transparent rounded-full"></div>
                        <span className="text-xs lg:text-sm font-medium">Fotoğraf yükleniyor...</span>
                      </div>
                    )}
                    
                    {pestValue.photo && (
                      <div className="relative group">
                        <button type="button" onClick={() => setPreviewImageUrl(pestValue.photo)} className="focus:outline-none">
                          <OptimizedImage
                            src={pestValue.photo}
                            alt="Zararlı fotoğrafı"
                            className="w-full max-w-xs lg:max-w-sm max-h-32 lg:max-h-48 object-cover rounded-lg shadow-md border border-gray-200 hover:scale-105 transition-transform duration-200 cursor-pointer"
                          />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const newValue = { ...pestValue, photo: '' };
                            setFieldValue(field.id, newValue);
                            // Submit'te kaydedilecek
                          }}
                          className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 group-focus:opacity-100 transition-opacity touch-manipulation"
                          style={{ minWidth: '36px', minHeight: '36px' }}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        }

      case 'development-stage':
        {
          const stageValue = values[field.id] as { selected: boolean; note: string } || { selected: false, note: '' };
          return (
            <div key={field.id} className={fieldWidth}>
              <div className="space-y-3">
                {/* Checkbox for selection */}
                <label className="flex items-start lg:items-center space-x-3 cursor-pointer p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                  <input
                    type="checkbox"
                    checked={stageValue.selected}
                    onChange={(e) => {
                      const newValue = { ...stageValue, selected: e.target.checked };
                      setFieldValue(field.id, newValue);
                      const newValues = { ...values, [field.id]: newValue };
                      onUpdate(item.id, true, newValues);
                    }}
                    className="h-4 w-4 lg:h-5 lg:w-5 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500 mt-0.5 lg:mt-0 flex-shrink-0"
                  />
                  <div className="flex-1">
                    <span className="text-sm lg:text-base font-semibold text-gray-700">
                      {field.label}
                    </span>
                  </div>
                </label>

                {/* Note input section - only show if selected */}
                {stageValue.selected && (
                  <div className="ml-7 space-y-3">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Gübreleme önerisi
                      </label>
                      <textarea
                        value={stageValue.note}
                        onChange={(e) => {
                          const newValue = { ...stageValue, note: e.target.value };
                          setFieldValue(field.id, newValue);
                          // Submit'te kaydedilecek
                        }}
                        placeholder="Gübreleme önerisi ve notlarınızı buraya yazın..."
                        className="w-full px-3 py-2.5 lg:px-4 lg:py-3 border border-gray-300 rounded-lg lg:rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 text-sm lg:text-base resize-vertical min-h-[100px]"
                        rows={4}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            const textarea = e.target as HTMLTextAreaElement;
                            const start = textarea.selectionStart;
                            const end = textarea.selectionEnd;
                            const value = textarea.value;
                            textarea.value = value.substring(0, start) + '\n' + value.substring(end);
                            textarea.selectionStart = textarea.selectionEnd = start + 1;
                          }
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        }

      case 'radio':
        return (
          <div key={field.id} className={fieldWidth}>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              {field.label}
            </label>
            <div className="space-y-2">
              {field.options?.map(option => (
                <label key={option} className="flex items-center space-x-3 cursor-pointer p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                  <Field
                    type="radio"
                    name={field.id}
                    value={option}
                    className="h-4 w-4 text-emerald-600 border-gray-300 focus:ring-emerald-500"
                  />
                  <span className="text-sm font-medium text-gray-700">{option}</span>
                </label>
              ))}
            </div>
            <div className="text-red-500 text-xs lg:text-sm mt-1">
              <ErrorMessage name={field.id} />
            </div>
          </div>
        );

      case 'checkbox':
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

      case 'subheader':
        return (
          <div key={field.id} className={fieldWidth}>
            <div className="border-b border-gray-200 pb-2 mb-4">
              <h4 className="text-lg font-bold text-gray-800">
                {field.label}
              </h4>
            </div>
          </div>
        );

      default:
        return (
          <div key={field.id} className={fieldWidth}>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              {field.label}
            </label>
            <input
              type={field.type}
              id={commonProps.id}
              name={commonProps.name}
              placeholder={commonProps.placeholder}
              className={commonProps.className}
              value={typeof values[field.id] === 'string' || typeof values[field.id] === 'number' ? (values[field.id] as string | number) : ''}
              onChange={(e) => {
                const raw = e.target.value;
                const nextValue: string | number = field.type === 'number' ? (raw === '' ? '' : Number(raw)) : raw;
                setFieldValue(field.id, nextValue);
                // Submit'te kaydedilecek
              }}
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
          {item.id === 'kontrol-bitkileri-kontrolu' ? (
            <>
              <div className="flex-shrink-0">
                <div className={`w-4 h-4 lg:w-5 lg:h-5 rounded-full border-2 ${
                  item.completed 
                    ? 'bg-emerald-500 border-emerald-500' 
                    : 'border-gray-300'
                } flex items-center justify-center`}>
                  {item.completed && <span className="text-white text-xs">✓</span>}
                </div>
              </div>
              <span className={`flex-1 text-sm lg:text-base xl:text-lg font-medium transition-all duration-200 leading-relaxed ${
                item.completed 
                  ? 'text-gray-500' 
                  : 'text-gray-800'
              }`}>
                {item.label}
              </span>
              {onPlantControlClick && (
                <PlantControlButton
                  onClick={onPlantControlClick}
                  isCompleted={item.completed}
                />
              )}
            </>
          ) : (
            <>
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
            </>
          )}
        </div>

        {showDetails && item.detailFields && (
          <div className="mt-4 lg:mt-6 bg-gray-50 rounded-lg lg:rounded-xl p-4 lg:p-6">
            <Formik
              key={`${item.id}-${JSON.stringify(item.data ?? {})}`}
              enableReinitialize
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
        {/* Global image lightbox for this item */}
        <ImageLightbox imageUrl={previewImageUrl} onClose={() => setPreviewImageUrl(null)} />
      </div>
    </div>
  );
};

export default ChecklistItem; 