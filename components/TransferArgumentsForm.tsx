'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  AlertTriangle,
  Send,
  Loader2,
  DollarSign,
  User,
  MessageCircle,
  CheckCircle,
  Info
} from 'lucide-react';

interface FormField {
  name: string;
  type: string;
  label: string;
  placeholder: string;
  required: boolean;
  options?: Array<{ value: string; label: string }>;
  min?: number;
  max?: number;
  step?: number;
  maxLength?: number;
  validation?: string;
  defaultValue?: any;
}

interface FormSchema {
  title: string;
  description: string;
  fields: FormField[];
}

interface TransferArgumentsFormProps {
  formSchema: FormSchema;
  missingArguments: string[];
  argumentAnalysis: any;
  onSubmit: (formData: any) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export default function TransferArgumentsForm({
  formSchema,
  missingArguments,
  argumentAnalysis,
  onSubmit,
  onCancel,
  isLoading = false
}: TransferArgumentsFormProps) {
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (fieldName: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: value
    }));

    // Clear error when user starts typing
    if (errors[fieldName]) {
      setErrors(prev => ({
        ...prev,
        [fieldName]: ''
      }));
    }
  };

  const validateField = (field: FormField, value: any): string | null => {
    if (field.required && (!value || value === '')) {
      return `${field.label} is required`;
    }

    if (field.type === 'number' && value) {
      const numValue = parseFloat(value);
      if (isNaN(numValue)) {
        return `${field.label} must be a valid number`;
      }
      if (field.min !== undefined && numValue < field.min) {
        return `${field.label} must be at least ${field.min}`;
      }
      if (field.max !== undefined && numValue > field.max) {
        return `${field.label} must be at most ${field.max}`;
      }
    }

    if (field.validation === 'ethereum_address' && value) {
      if (!/^0x[a-fA-F0-9]{40}$/.test(value)) {
        return 'Invalid Ethereum address format';
      }
    }

    if (field.maxLength && value && value.length > field.maxLength) {
      return `${field.label} must be at most ${field.maxLength} characters`;
    }

    return null;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate all fields
    const newErrors: Record<string, string> = {};
    
    formSchema.fields.forEach(field => {
      const error = validateField(field, formData[field.name]);
      if (error) {
        newErrors[field.name] = error;
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSubmit(formData);
  };

  const getFieldIcon = (fieldName: string) => {
    switch (fieldName) {
      case 'amount': return <DollarSign className="w-4 h-4 text-green-600" />;
      case 'recipient': 
      case 'recipientName': 
      case 'recipientAddress': return <User className="w-4 h-4 text-blue-600" />;
      case 'memo': return <MessageCircle className="w-4 h-4 text-gray-600" />;
      default: return <Info className="w-4 h-4 text-gray-600" />;
    }
  };

  const renderField = (field: FormField) => {
    const value = formData[field.name] || field.defaultValue || '';
    const error = errors[field.name];

    switch (field.type) {
      case 'number':
        return (
          <div key={field.name} className="space-y-2">
            <Label htmlFor={field.name} className="flex items-center gap-2">
              {getFieldIcon(field.name)}
              {field.label}
              {field.required && <span className="text-red-500">*</span>}
            </Label>
            <Input
              id={field.name}
              type="number"
              placeholder={field.placeholder}
              value={value}
              onChange={(e) => handleInputChange(field.name, e.target.value)}
              min={field.min}
              max={field.max}
              step={field.step}
              className={error ? 'border-red-500' : ''}
            />
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>
        );

      case 'select':
        return (
          <div key={field.name} className="space-y-2">
            <Label htmlFor={field.name} className="flex items-center gap-2">
              {getFieldIcon(field.name)}
              {field.label}
              {field.required && <span className="text-red-500">*</span>}
            </Label>
            <Select
              value={value}
              onValueChange={(val) => handleInputChange(field.name, val)}
            >
              <SelectTrigger className={error ? 'border-red-500' : ''}>
                <SelectValue placeholder={field.placeholder} />
              </SelectTrigger>
              <SelectContent>
                {field.options?.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>
        );

      case 'textarea':
        return (
          <div key={field.name} className="space-y-2">
            <Label htmlFor={field.name} className="flex items-center gap-2">
              {getFieldIcon(field.name)}
              {field.label}
              {field.required && <span className="text-red-500">*</span>}
            </Label>
            <Textarea
              id={field.name}
              placeholder={field.placeholder}
              value={value}
              onChange={(e) => handleInputChange(field.name, e.target.value)}
              maxLength={field.maxLength}
              className={error ? 'border-red-500' : ''}
            />
            {field.maxLength && (
              <p className="text-xs text-gray-500">
                {value.length}/{field.maxLength} characters
              </p>
            )}
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>
        );

      case 'checkbox':
        return (
          <div key={field.name} className="flex items-center space-x-2">
            <Checkbox
              id={field.name}
              checked={value}
              onCheckedChange={(checked) => handleInputChange(field.name, checked)}
            />
            <Label htmlFor={field.name} className="text-sm">
              {field.label}
            </Label>
            {error && <p className="text-sm text-red-500 ml-6">{error}</p>}
          </div>
        );

      default: // text input
        return (
          <div key={field.name} className="space-y-2">
            <Label htmlFor={field.name} className="flex items-center gap-2">
              {getFieldIcon(field.name)}
              {field.label}
              {field.required && <span className="text-red-500">*</span>}
            </Label>
            <Input
              id={field.name}
              type="text"
              placeholder={field.placeholder}
              value={value}
              onChange={(e) => handleInputChange(field.name, e.target.value)}
              maxLength={field.maxLength}
              className={error ? 'border-red-500' : ''}
            />
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>
        );
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto border-orange-200 bg-gradient-to-r from-orange-50 to-yellow-50">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-orange-600" />
          </div>
          <div>
            <CardTitle className="text-lg text-orange-800">{formSchema.title}</CardTitle>
            <p className="text-sm text-orange-600 mt-1">{formSchema.description}</p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Original Message Analysis */}
        {argumentAnalysis && (
          <div className="bg-white rounded-lg p-4 border border-orange-200">
            <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
              <Info className="w-4 h-4 text-blue-600" />
              What We Found
            </h4>
            <div className="space-y-2">
              <p className="text-sm text-gray-600">
                <strong>Original Message:</strong> "{argumentAnalysis.analysis?.originalMessage}"
              </p>
              
              {argumentAnalysis.analysis?.extractedPhrases?.length > 0 && (
                <div>
                  <p className="text-sm text-gray-600 mb-1"><strong>Extracted:</strong></p>
                  <div className="flex flex-wrap gap-1">
                    {argumentAnalysis.analysis.extractedPhrases.map((phrase: string, idx: number) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        {phrase}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              
              {argumentAnalysis.analysis?.ambiguities?.length > 0 && (
                <div>
                  <p className="text-sm text-gray-600 mb-1"><strong>Needs Clarification:</strong></p>
                  <ul className="text-xs text-orange-700">
                    {argumentAnalysis.analysis.ambiguities.map((ambiguity: string, idx: number) => (
                      <li key={idx}>• {ambiguity}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Missing Arguments Indicator */}
        <div className="bg-white rounded-lg p-4 border border-orange-200">
          <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-600" />
            Missing Information
          </h4>
          <div className="flex flex-wrap gap-2">
            {missingArguments.map((arg) => (
              <Badge key={arg} variant="destructive" className="text-xs">
                {arg.charAt(0).toUpperCase() + arg.slice(1)} Required
              </Badge>
            ))}
          </div>
        </div>

        {/* Form Fields */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="bg-white rounded-lg p-4 border border-orange-200 space-y-4">
            {formSchema.fields.map(renderField)}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-gradient-to-r from-orange-500 to-red-500 text-white hover:from-orange-600 hover:to-red-600"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Complete Transfer
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
