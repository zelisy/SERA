export type FieldType = 'text' | 'textarea' | 'date' | 'number' | 'select' | 'boolean' | 'file';

export interface FormField {
  id: string;
  label: string;
  type: FieldType;
  required?: boolean;
  placeholder?: string;
  options?: string[]; // For select fields
  dependsOn?: string; // Field id that this field depends on
  showWhen?: string | number | boolean; // Value that triggers visibility
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    message?: string;
  };
}

export interface ChecklistItem {
  id: string;
  label: string;
  completed: boolean;
  hasDetails: boolean;
  detailFields?: FormField[];
  data?: Record<string, string | number | boolean | string[]>;
}

export interface ChecklistSection {
  id: string;
  title: string;
  items: ChecklistItem[];
}

export interface ChecklistData {
  sections: ChecklistSection[];
  metadata: {
    createdAt: string;
    updatedAt: string;
    createdBy?: string;
  };
} 