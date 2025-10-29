import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { LogOut, BarChart3, Filter, Search } from 'lucide-react';
import AdminAnalytics from '../components/AdminAnalytics';

interface Grievance {
  id: string;
  grievance_id: string;
  title: string;
  description: string;
  category: string;
  status: string;
  created_at: string;
  updated_at: string;
  assigned_to: string | null;
  resolution_comments: string | null;
  details: any;
  submitted_by: string;
  submitter?: {
    full_name: string;
    email: string;
    role: string;
    department: string;
  };
}

export default function AdminDashboard() {
  const { userProfile, signOut } = useAuth();
  const [grievances, setGrievances] = useState<Grievance[]>([]);
  const [filteredGrievances, setFilteredGrievances] = useState<Grievance[]>([]);
  const [selectedGrievance, setSelectedGrievance] = useState<Grievance | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [updateForm, setUpdateForm] = useState({
    status: '',
    resolution_comments: '',
  });

  useEffect(() => {
    loadGrievances();
  }, []);

  useEffect(() => {
    let filtered = grievances;

    if (searchTerm) {
      filtered = filtered.filter(
        (g) =>
          g.grievance_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          g.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          g.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterCategory) {
      filtered = filtered.filter((g) => g.category === filterCategory);
    }

    if (filterStatus) {
      filtered = filtered.filter((g) => g.status === filterStatus);
    }

    setFilteredGrievances(filtered);
  }, [searchTerm, filterCategory, filterStatus, grievances]);

  async function loadGrievances() {
    try {
      const { data: grievancesData, error: grievancesError } = await supabase
        .from('grievances')
        .select('*')
        .order('created_at', { ascending: false });

      if (grievancesError) throw grievancesError;

      const grievancesWithSubmitter = await Promise.all(
        (grievancesData || []).map(async (g) => {
          const { data: userData } = await supabase
            .from('users')
            .select('full_name, email, role, department')
            .eq('id', g.submitted_by)
            .maybeSingle();

          return {
            ...g,
            submitter: userData || undefined,
          };
        })
      );

      setGrievances(grievancesWithSubmitter);
      setFilteredGrievances(grievancesWithSubmitter);
    } catch (error) {
      console.error('Error loading grievances:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdate() {
    if (!selectedGrievance) return;

    try {
      const { error } = await supabase
        .from('grievances')
        .update({
          status: updateForm.status,
          resolution_comments: updateForm.resolution_comments,
        })
        .eq('id', selectedGrievance.id);

      if (error) throw error;

      await loadGrievances();
      setSelectedGrievance(null);
      setUpdateForm({ status: '', resolution_comments: '' });
    } catch (error) {
      console.error('Error updating grievance:', error);
    }
  }

  function getStatusColor(status: string) {
    switch (status) {
      case 'Submitted':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'In Progress':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Resolved':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Closed':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  }

  if (showAnalytics) {
    return <AdminAnalytics onBack={() => setShowAnalytics(false)} grievances={grievances} />;
  }

  if (selectedGrievance) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-5xl mx-auto">
          <button
            onClick={() => setSelectedGrievance(null)}
            className="mb-4 text-blue-600 hover:text-blue-700 font-semibold"
          >
            ← Back to Dashboard
          </button>

          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-slate-700 to-slate-800 p-6 text-white">
              <h2 className="text-2xl font-bold">Grievance Details & Resolution</h2>
            </div>

            <div className="p-8">
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-500 uppercase mb-1">Grievance ID</h3>
                    <p className="text-xl font-bold text-blue-600">{selectedGrievance.grievance_id}</p>
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold text-gray-500 uppercase mb-1">Title</h3>
                    <p className="text-lg font-semibold text-gray-800">{selectedGrievance.title}</p>
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold text-gray-500 uppercase mb-1">Description</h3>
                    <p className="text-gray-700">{selectedGrievance.description}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h3 className="text-sm font-semibold text-gray-500 uppercase mb-1">Category</h3>
                      <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold">
                        {selectedGrievance.category}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-gray-500 uppercase mb-1">Current Status</h3>
                      <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold border ${getStatusColor(selectedGrievance.status)}`}>
                        {selectedGrievance.status}
                      </span>
                    </div>
                  </div>

                  {selectedGrievance.submitter && (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">Submitted By</h3>
                      <div className="space-y-1">
                        <p className="text-gray-800 font-semibold">{selectedGrievance.submitter.full_name}</p>
                        <p className="text-gray-600 text-sm">{selectedGrievance.submitter.email}</p>
                        <p className="text-gray-600 text-sm">{selectedGrievance.submitter.role} • {selectedGrievance.submitter.department}</p>
                      </div>
                    </div>
                  )}

                  <div>
                    <h3 className="text-sm font-semibold text-gray-500 uppercase mb-1">Additional Details</h3>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <pre className="text-sm text-gray-700 whitespace-pre-wrap">
                        {JSON.stringify(selectedGrievance.details, null, 2)}
                      </pre>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
                    <h3 className="text-lg font-bold text-blue-900 mb-4">Update Grievance</h3>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Change Status
                        </label>
                        <select
                          value={updateForm.status}
                          onChange={(e) => setUpdateForm({ ...updateForm, status: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="">Select new status</option>
                          <option value="Submitted">Submitted</option>
                          <option value="In Progress">In Progress</option>
                          <option value="Resolved">Resolved</option>
                          <option value="Closed">Closed</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Resolution Comments
                        </label>
                        <textarea
                          value={updateForm.resolution_comments}
                          onChange={(e) => setUpdateForm({ ...updateForm, resolution_comments: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          rows={6}
                          placeholder="Add your resolution comments here..."
                        />
                      </div>

                      <button
                        onClick={handleUpdate}
                        disabled={!updateForm.status}
                        className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Update Grievance
                      </button>
                    </div>
                  </div>

                  {selectedGrievance.resolution_comments && (
                    <div className="bg-green-50 rounded-lg p-6 border border-green-200">
                      <h3 className="text-sm font-semibold text-green-800 uppercase mb-2">Current Resolution Comments</h3>
                      <p className="text-green-900">{selectedGrievance.resolution_comments}</p>
                    </div>
                  )}

                  <div className="text-sm text-gray-600 space-y-1">
                    <p>Submitted: {new Date(selectedGrievance.created_at).toLocaleString()}</p>
                    <p>Last Updated: {new Date(selectedGrievance.updated_at).toLocaleString()}</p>
                  </div>
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
      <header className="bg-gradient-to-r from-slate-700 to-slate-800 shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-5">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
              <p className="text-slate-200 mt-1">
                Welcome, {userProfile?.full_name} (Administrator)
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowAnalytics(true)}
                className="flex items-center gap-2 bg-white text-slate-800 px-4 py-2 rounded-lg hover:bg-slate-100 transition font-medium"
              >
                <BarChart3 className="w-5 h-5" />
                Analytics
              </button>
              <button
                onClick={signOut}
                className="flex items-center gap-2 bg-slate-600 text-white px-4 py-2 rounded-lg hover:bg-slate-500 transition font-medium"
              >
                <LogOut className="w-5 h-5" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <div className="flex items-center gap-4 mb-4">
            <Filter className="w-5 h-5 text-gray-600" />
            <h3 className="font-semibold text-gray-800">Filter & Search</h3>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by ID, title, or description..."
                className="w-full pl-11 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Categories</option>
              <option value="Academic">Academic</option>
              <option value="Facility">Facility</option>
              <option value="Examination">Examination</option>
              <option value="Placement">Placement</option>
              <option value="Other">Other</option>
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Status</option>
              <option value="Submitted">Submitted</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
              <option value="Closed">Closed</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-700 mx-auto"></div>
            <p className="text-gray-600 mt-4">Loading grievances...</p>
          </div>
        ) : filteredGrievances.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <p className="text-gray-600">No grievances found matching your criteria.</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-100 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">ID</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Title</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Category</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Status</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Submitted By</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Date</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredGrievances.map((grievance) => (
                    <tr key={grievance.id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4">
                        <span className="font-semibold text-blue-600">{grievance.grievance_id}</span>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-medium text-gray-800">{grievance.title}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold">
                          {grievance.category}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(grievance.status)}`}>
                          {grievance.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {grievance.submitter && (
                          <div>
                            <p className="font-medium text-gray-800">{grievance.submitter.full_name}</p>
                            <p className="text-xs text-gray-600">{grievance.submitter.role}</p>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(grievance.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => {
                            setSelectedGrievance(grievance);
                            setUpdateForm({
                              status: grievance.status,
                              resolution_comments: grievance.resolution_comments || '',
                            });
                          }}
                          className="text-blue-600 hover:text-blue-700 font-semibold text-sm"
                        >
                          View & Update
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
