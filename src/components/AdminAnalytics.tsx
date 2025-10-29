import { ArrowLeft, TrendingUp, Clock, CheckCircle, FileText } from 'lucide-react';

interface Grievance {
  id: string;
  category: string;
  status: string;
  created_at: string;
  updated_at: string;
}

interface AdminAnalyticsProps {
  onBack: () => void;
  grievances: Grievance[];
}

export default function AdminAnalytics({ onBack, grievances }: AdminAnalyticsProps) {
  const totalGrievances = grievances.length;

  const statusCounts = {
    Submitted: grievances.filter((g) => g.status === 'Submitted').length,
    'In Progress': grievances.filter((g) => g.status === 'In Progress').length,
    Resolved: grievances.filter((g) => g.status === 'Resolved').length,
    Closed: grievances.filter((g) => g.status === 'Closed').length,
  };

  const categoryCounts = {
    Academic: grievances.filter((g) => g.category === 'Academic').length,
    Facility: grievances.filter((g) => g.category === 'Facility').length,
    Examination: grievances.filter((g) => g.category === 'Examination').length,
    Placement: grievances.filter((g) => g.category === 'Placement').length,
    Other: grievances.filter((g) => g.category === 'Other').length,
  };

  const resolvedGrievances = grievances.filter((g) => g.status === 'Resolved' || g.status === 'Closed');
  const avgResolutionTime = resolvedGrievances.length > 0
    ? resolvedGrievances.reduce((acc, g) => {
        const created = new Date(g.created_at).getTime();
        const updated = new Date(g.updated_at).getTime();
        return acc + (updated - created) / (1000 * 60 * 60 * 24);
      }, 0) / resolvedGrievances.length
    : 0;

  const resolutionRate = totalGrievances > 0
    ? ((resolvedGrievances.length / totalGrievances) * 100).toFixed(1)
    : 0;

  const maxCategoryCount = Math.max(...Object.values(categoryCounts), 1);
  const maxStatusCount = Math.max(...Object.values(statusCounts), 1);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-gradient-to-r from-slate-700 to-slate-800 shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-5">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-white hover:text-slate-200 transition mb-3"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Dashboard
          </button>
          <h1 className="text-2xl font-bold text-white">Analytics Dashboard</h1>
          <p className="text-slate-200 mt-1">Comprehensive grievance system insights</p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6 border-t-4 border-blue-500">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-gray-600 font-semibold">Total Grievances</h3>
              <FileText className="w-8 h-8 text-blue-500" />
            </div>
            <p className="text-3xl font-bold text-gray-800">{totalGrievances}</p>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border-t-4 border-green-500">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-gray-600 font-semibold">Resolution Rate</h3>
              <TrendingUp className="w-8 h-8 text-green-500" />
            </div>
            <p className="text-3xl font-bold text-gray-800">{resolutionRate}%</p>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border-t-4 border-yellow-500">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-gray-600 font-semibold">Avg Resolution Time</h3>
              <Clock className="w-8 h-8 text-yellow-500" />
            </div>
            <p className="text-3xl font-bold text-gray-800">{avgResolutionTime.toFixed(1)}</p>
            <p className="text-sm text-gray-600">days</p>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border-t-4 border-purple-500">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-gray-600 font-semibold">Resolved</h3>
              <CheckCircle className="w-8 h-8 text-purple-500" />
            </div>
            <p className="text-3xl font-bold text-gray-800">{resolvedGrievances.length}</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <div className="bg-white rounded-xl shadow-md p-8">
            <h2 className="text-xl font-bold text-gray-800 mb-6">Grievances by Category</h2>
            <div className="space-y-5">
              {Object.entries(categoryCounts).map(([category, count]) => (
                <div key={category}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-700 font-medium">{category}</span>
                    <span className="text-gray-600 font-semibold">{count}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-500"
                      style={{ width: `${(count / maxCategoryCount) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-8">
            <h2 className="text-xl font-bold text-gray-800 mb-6">Grievances by Status</h2>
            <div className="space-y-5">
              {Object.entries(statusCounts).map(([status, count]) => {
                const colors = {
                  Submitted: 'from-blue-500 to-blue-600',
                  'In Progress': 'from-yellow-500 to-yellow-600',
                  Resolved: 'from-green-500 to-green-600',
                  Closed: 'from-gray-500 to-gray-600',
                };
                return (
                  <div key={status}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-gray-700 font-medium">{status}</span>
                      <span className="text-gray-600 font-semibold">{count}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                      <div
                        className={`bg-gradient-to-r ${colors[status as keyof typeof colors]} h-3 rounded-full transition-all duration-500`}
                        style={{ width: `${(count / maxStatusCount) * 100}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-8">
          <h2 className="text-xl font-bold text-gray-800 mb-6">Recent Activity</h2>
          <div className="space-y-4">
            {grievances.slice(0, 10).map((g) => (
              <div key={g.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                <div className="flex items-center gap-4">
                  <div className={`w-3 h-3 rounded-full ${
                    g.status === 'Submitted' ? 'bg-blue-500' :
                    g.status === 'In Progress' ? 'bg-yellow-500' :
                    g.status === 'Resolved' ? 'bg-green-500' : 'bg-gray-500'
                  }`} />
                  <div>
                    <p className="font-medium text-gray-800">{g.category} grievance</p>
                    <p className="text-sm text-gray-600">{new Date(g.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  g.status === 'Submitted' ? 'bg-blue-100 text-blue-800' :
                  g.status === 'In Progress' ? 'bg-yellow-100 text-yellow-800' :
                  g.status === 'Resolved' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {g.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
