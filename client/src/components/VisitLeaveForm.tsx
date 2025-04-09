//src/components/VisitLeaveForm.tsx
'use client';

import { useState, useEffect } from 'react';
import { recordVisit, recordLeave } from '@/app/actions/visits';
import { toast } from 'react-hot-toast';
import { Eye, EyeOff } from 'lucide-react';


interface VisitLeaveFormProps {
  visitor: {
    id: string;
    first_name: string;
    last_name: string;
    national_id: string;
    is_banned: boolean;
  };
  lastVisit: {
    id: number;
    status: string;
  } | null;
  onComplete?: () => void;
}

export default function VisitLeaveForm({ visitor, lastVisit, onComplete }: VisitLeaveFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [visitReason, setVisitReason] = useState('');
  const [showSecret, setShowSecret] = useState(false);
  const [secretCode, setSecretCode] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  
  // Determine if this is a visit or leave form
  const isLeaveForm = lastVisit && lastVisit.status === 'visit';
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormError(null);
    
    try {
      const formData = new FormData();
      
      if (isLeaveForm) {
        // Handle leave form submission
        formData.append('visit_id', lastVisit!.id.toString());
        formData.append('secret_code', secretCode);
        
        const result = await recordLeave(formData);
        
        if (result.success) {
          toast.success(`Visit completed for ${visitor.first_name} ${visitor.last_name}`);
          setSecretCode('');
          onComplete?.();
        } else {
          setFormError(result.error || 'Failed to record departure');
          toast.error(result.error || 'Failed to record departure');
        }
      } else {
        // Handle visit form submission
        formData.append('visitor_id', visitor.id);
        formData.append('reason', visitReason);
        formData.append('secret_code', secretCode);
        
        const result = await recordVisit(formData);
        
        if (result.success) {
          toast.success(`Visit recorded for ${visitor.first_name} ${visitor.last_name}`);
          setVisitReason('');
          setSecretCode('');
          onComplete?.();
        } else {
          setFormError(result.error || 'Failed to record visit');
          toast.error(result.error || 'Failed to record visit');
        }
      }
    } catch (error: any) {
      setFormError(error.message || 'An unexpected error occurred');
      toast.error('Action failed. Please try again.');
      console.error('Error submitting form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // If the visitor is banned, don't show the form at all for new visits
  if (visitor.is_banned && !isLeaveForm) {
    return (
      <div className="bg-red-900/30 border border-red-500 text-red-200 px-6 py-4 rounded-lg">
        <h3 className="text-lg font-bold mb-2">Entry Restricted</h3>
        <p>This visitor is banned from entering the premises.</p>
      </div>
    );
  }
  
  const toggleSecretVisibility = () => {
    setShowSecret(!showSecret);
  };

  return (
    <div className="bg-[#222] p-6 rounded-lg shadow-lg border border-gray-700">
      <h2 className="text-xl font-semibold mb-4 text-gray-200">
        {isLeaveForm ? 'Record Departure' : 'Record Visit'}
      </h2>
      
      {formError && (
        <div className="bg-red-900/30 border border-red-500 text-red-200 px-4 py-3 rounded-lg mb-4">
          <p>{formError}</p>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Visitor Information Preview */}
        <div className="bg-[#2a2a2a] p-4 rounded-lg mb-4">
          <p className="text-gray-400 text-sm">Visitor</p>
          <p className="text-gray-200 font-medium">{visitor.first_name} {visitor.last_name}</p>
          <p className="text-gray-200">{visitor.national_id}</p>
        </div>
        
        {/* Visit reason field - only shown for new visits */}
        {!isLeaveForm && (
          <div>
            <label htmlFor="reason" className="block text-sm font-medium text-gray-300 mb-1">
              Purpose of Visit:
            </label>
            <textarea
              id="reason"
              value={visitReason}
              onChange={(e) => setVisitReason(e.target.value)}
              className="w-full rounded-lg border border-gray-600 bg-[#2a2a2a] text-gray-200 shadow-sm focus:border-yellow-400 focus:ring-yellow-400 focus:ring-1 placeholder-gray-500 py-2 px-3 h-20"
              placeholder="Enter reason for visit"
              required
            />
          </div>
        )}
        
        {/* Secret code field */}
        <div>
          <label htmlFor="secret_code" className="block text-sm font-medium text-gray-300 mb-1">
            Secret Code:
          </label>
          <div className="relative">
            <input
              type={showSecret ? "text" : "password"}
              id="secret_code"
              value={secretCode}
              onChange={(e) => setSecretCode(e.target.value)}
              className="w-full rounded-lg border border-gray-600 bg-[#2a2a2a] text-gray-200 shadow-sm focus:border-yellow-400 focus:ring-yellow-400 focus:ring-1 placeholder-gray-500 py-2 px-3"
              placeholder="Enter your authorization code"
              required
            />
            <button
              type="button"
              onClick={toggleSecretVisibility}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white focus:outline-none"
            >
              {showSecret ? (
                <EyeOff size={20} />
              ) : (
                <Eye size={20} />
              )}
            </button>
          </div>
          <p className="text-gray-400 text-xs mt-1">
            Your secret code is required to authorize this action.
          </p>
        </div>
        
        {/* Visit/Leave button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full ${
            isLeaveForm 
              ? 'bg-blue-700 hover:bg-blue-600 focus:ring-blue-600' 
              : 'bg-[#f0b100] hover:bg-[#e0a000] focus:ring-[#f0b100]'
          } w-full bg-yellow-500 text-gray-900 py-2 px-4 rounded-md hover:bg-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-gray-800 disabled:opacity-50`}
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing...
            </span>
          ) : (
            isLeaveForm ? 'Record Departure' : 'Record Visit'
          )}
        </button>
      </form>
    </div>
  );
}