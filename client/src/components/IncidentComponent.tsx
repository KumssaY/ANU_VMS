// src/components/IncidentComponent.tsx

'use client';

import { useState, useEffect } from 'react';
import { reportIncident, getVisitorIncidentsByNationalId } from '@/app/actions/visitor';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff } from 'lucide-react';


interface IncidentComponentProps {
  visitor: {
    id: string;
    first_name: string;
    last_name: string;
    national_id: string;
  };
  nationalId: string;  // Addition of this line
}

export default function IncidentComponent({ visitor, nationalId }: IncidentComponentProps) {
  const [incidents, setIncidents] = useState<any[]>([]);
  const [incidentDetails, setIncidentDetails] = useState('');
  const [secretCode, setSecretCode] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [showSecret, setShowSecret] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const router = useRouter();

  console.log("IncidentComponent received nationalId:", nationalId);


  // Fetch incidents when the component mounts
  useEffect(() => {
    if (nationalId) {
      fetchIncidents();
    }
  }, [nationalId]);
  

  const fetchIncidents = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log(`Fetching incidents for nationalId: ${nationalId}`);
      const result = await getVisitorIncidentsByNationalId(nationalId);
      console.log("API Response:", result);
          
      if (result.success) {
        setIncidents(result.incidents || []);
      } else {
        setError(result.error || 'Failed to load incidents');
        toast.error(result.error || 'Failed to load incidents');
      }
    } catch (error: any) {
      const errorMessage = error.message || 'An unexpected error occurred';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };
  


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccessMessage(null);
    
    try {
      const formData = new FormData();
      formData.append('visitor_id', visitor.id);
      formData.append('incident_details', incidentDetails);
      formData.append('secret_code', secretCode);

      const result = await reportIncident(formData);

      if (result.success) {
        setSuccessMessage('Incident reported successfully');
        toast.success('Incident reported successfully');
        setIncidentDetails('');
        setSecretCode('');
        // Refresh incidents list
        fetchIncidents();
      } else {
        setError(result.error || 'Failed to report incident');
        toast.error(result.error || 'Failed to report incident');
      }
    } catch (error: any) {
      const errorMessage = error.message || 'An unexpected error occurred';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const viewIncidentDetails = (incidentId: number) => {
    router.push(`/incidents/${incidentId}`);
  };

  const viewAllIncidents = () => {
    // Use the nationalId prop directly - this is the fix
    const encodedNationalId = encodeURIComponent(nationalId);
    router.push(`/incidents?national_id=${encodedNationalId}`);
  };

  const toggleSecretVisibility = () => {
    setShowSecret(!showSecret);
  };

  return (
    <div className="space-y-6">
      {/* Report Incident Form */}
      <div className="bg-[#222] rounded-lg shadow-md overflow-hidden">
        <div className="bg-[#222] text-white p-4">
          <h2 className="text-xl font-bold">Report New Incident</h2>
        </div>
        
        <div className="p-4">
          {successMessage && (
            <div className="mb-4 p-3 rounded bg-green-900 text-green-400">
              {successMessage}
            </div>
          )}
          
          {error && (
            <div className="mb-4 p-3 rounded bg-red-900 text-red-400">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <p className="mb-2 text-gray-300">
                <span className="font-semibold">Visitor:</span> {visitor.first_name} {visitor.last_name}
              </p>
            </div>
            
            <div>
              <label htmlFor="incident_details" className="block text-sm font-medium text-gray-300">
                Incident Details:
              </label>
              <textarea
                id="incident_details"
                value={incidentDetails}
                onChange={(e) => setIncidentDetails(e.target.value)}
                className="w-full rounded-lg border border-gray-600 bg-[#2a2a2a] text-gray-200 shadow-sm focus:border-yellow-400 focus:ring-yellow-400 focus:ring-1 placeholder-gray-500 py-2 px-3 h-20"
                rows={3}
                placeholder="Describe the incident in detail"
                required
              />
            </div>
            
            <div>
              <label htmlFor="secret_code" className="block text-sm font-medium text-gray-300">
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
            </div>
            
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-yellow-500 text-gray-900 py-2 px-4 rounded-md hover:bg-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-gray-800 disabled:opacity-50"
            >
              {isSubmitting ? 'Submitting...' : 'Report Incident'}
            </button>
          </form>
        </div>
      </div>
      
      {/* Incidents Table */}
      <div className="bg-[#222] rounded-lg shadow-md overflow-hidden">
        <div className="bg-[#222] text-white p-4">
          <h2 className="text-xl font-bold">Recent Incidents</h2>
        </div>
        
        <div className="p-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <svg className="animate-spin h-6 w-6 text-[#f0b100]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
          ) : incidents.length === 0 ? (
            <div className="text-center py-8 text-gray-300">
              No incidents found for this visitor.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-700">
                <thead className="bg-yellow-500">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                      ID
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                      Description
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                      Recorded At
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-[#222] divide-y divide-gray-700">
                  {incidents.slice(0, 5).map((incident) => (
                    <tr key={incident.incident_id} className="hover:bg-[#2a2a2a] transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                        #{incident.incident_id}
                      </td>
                      <td className="px-6 py-4 text-sm text-white">
                        {incident.description.length > 100
                          ? `${incident.description.substring(0, 100)}...`
                          : incident.description}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                        {formatDate(incident.recorded_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => viewIncidentDetails(incident.incident_id)}
                          className="text-[#f0b100] hover:text-[#e0a000] transition-colors"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}

                  {incidents.length > 5 && (
                    <tr className="bg-[#222]">
                      <td colSpan={4} className="px-6 py-4 text-center">
                        <button
                          onClick={viewAllIncidents}
                          className="w-full bg-yellow-500 text-gray-900 py-2 px-4 rounded-md hover:bg-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-gray-800 disabled:opacity-50"
                        >
                          View all {incidents.length} incidents
                        </button>
                      </td>
                    </tr>
                  )}
                </tbody>

              </table>
              
              {incidents.length <= 5 && incidents.length > 0 && (
                <div className="mt-4 flex justify-center">
                  <button 
                    onClick={viewAllIncidents}
                    className="w-full p-3 bg-yellow-500 text-black font-bold rounded-md mt-6"
                  >
                    View All Incidents
                  </button>
                </div>

              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
