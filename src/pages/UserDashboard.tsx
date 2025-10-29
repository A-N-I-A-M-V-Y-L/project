import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { LogOut, Plus, FileText, Clock, CheckCircle, XCircle } from 'lucide-react';
import GrievanceForm from '../components/GrievanceForm';

interface Grievance {
  id: string;
  grievance_id: string;
  title: string;
  description: string;
  category: string;
  status: string;
  created_at: string;
  updated_at: string;
  resolution_comments: string | null;
  details: any;
}

export default function UserDashboard() {
  const { userProfile, signOut } = useAuth();
  const [grievances, setGrievances] = useState<Grievance[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedGrievance, setSelectedGrievance] = useState<Grievance | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadGrievances();
  }, []);

  async function loadGrievances() {
    try {
      const { data, error } = await supabase
        .from('grievances')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setGrievances(data || []);
    } catch (error) {
      console.error('Error loading grievances:', error);
    } finally {
      setLoading(false);
    }
  }

  function getStatusColor(status: string) {
    switch (status) {
      case 'Submitted':
        return 'bg-blue-100 text-blue-800';
      case 'In Progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'Resolved':
        return 'bg-green-100 text-green-800';
      case 'Closed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  function getStatusIcon(status: string) {
    switch (status) {
      case 'Submitted':
        return <FileText className="w-5 h-5" />;
      case 'In Progress':
        return <Clock className="w-5 h-5" />;
      case 'Resolved':
        return <CheckCircle className="w-5 h-5" />;
      case 'Closed':
        return <XCircle className="w-5 h-5" />;
      default:
        return <FileText className="w-5 h-5" />;
    }
  }

  if (showForm) {
    return (
      <GrievanceForm
        onClose={() => {
          setShowForm(false);
          loadGrievances();
        }}
      />
    );
  }

  if (selectedGrievance) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => setSelectedGrievance(null)}
            className="mb-4 text-blue-600 hover:text-blue-700 font-medium"
          >
            ← Back to Dashboard
          </button>

          <div className="bg-white rounded-xl shadow-md p-8">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-800 mb-2">{selectedGrievance.title}</h1>
                <p className="text-gray-600">Grievance ID: <span className="font-semibold text-blue-600">{selectedGrievance.grievance_id}</span></p>
              </div>
              <span className={`px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(selectedGrievance.status)}`}>
                {selectedGrievance.status}
              </span>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-gray-700 mb-2">Category</h3>
                <p className="text-gray-600">{selectedGrievance.category}</p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-700 mb-2">Description</h3>
                <p className="text-gray-600">{selectedGrievance.description}</p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-700 mb-2">Submitted On</h3>
                <p className="text-gray-600">{new Date(selectedGrievance.created_at).toLocaleString()}</p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-700 mb-2">Last Updated</h3>
                <p className="text-gray-600">{new Date(selectedGrievance.updated_at).toLocaleString()}</p>
              </div>

              {selectedGrievance.resolution_comments && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h3 className="font-semibold text-green-800 mb-2">Resolution Comments</h3>
                  <p className="text-green-700">{selectedGrievance.resolution_comments}</p>
                </div>
              )}

              <div>
                <h3 className="font-semibold text-gray-700 mb-2">Additional Details</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <pre className="text-sm text-gray-600 whitespace-pre-wrap">
                    {JSON.stringify(selectedGrievance.details, null, 2)}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">My Grievances</h1>
              <p className="text-gray-600 mt-1">
                Welcome, {userProfile?.full_name} ({userProfile?.role})
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowForm(true)}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition font-medium"
              >
                <Plus className="w-5 h-5" />
                Submit Grievance
              </button>
              <button
                onClick={signOut}
                className="flex items-center gap-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition font-medium"
              >
                <LogOut className="w-5 h-5" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600 mt-4">Loading your grievances...</p>
          </div>
        ) : grievances.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No Grievances Yet</h3>
            <p className="text-gray-600 mb-6">You haven't submitted any grievances.</p>
            <button
              onClick={() => setShowForm(true)}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition font-medium"
            >
              Submit Your First Grievance
            </button>
          </div>
        ) : (
          <div className="grid gap-4">
            {grievances.map((grievance) => (
              <div
                key={grievance.id}
                onClick={() => setSelectedGrievance(grievance)}
                className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition cursor-pointer border border-gray-100"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-blue-600 font-semibold">{grievance.grievance_id}</span>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 ${getStatusColor(grievance.status)}`}>
                        {getStatusIcon(grievance.status)}
                        {grievance.status}
                      </span>
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">
                        {grievance.category}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">{grievance.title}</h3>
                    <p className="text-gray-600 text-sm line-clamp-2">{grievance.description}</p>
                    <p className="text-xs text-gray-500 mt-3">
                      Submitted: {new Date(grievance.created_at).toLocaleDateString()} at{' '}
                      {new Date(grievance.created_at).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
