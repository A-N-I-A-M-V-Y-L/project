import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { X, ChevronRight } from 'lucide-react';

interface GrievanceFormProps {
  onClose: () => void;
}

export default function GrievanceForm({ onClose }: GrievanceFormProps) {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    subCategory: '',
    details: {} as any,
  });

  const categories = {
    Academic: ['Teaching Quality', 'Syllabus', 'Time-Table Clash', 'Lab/Equipment'],
    Facility: ['Classroom Infrastructure', 'WiFi', 'Water Supply', 'Restrooms', 'Canteen', 'Hostel', 'Library', 'Parking'],
    Examination: ['Marks Related', 'Exam Scheduling', 'Exam Not Given', 'Results Delay', 'Invigilation/Conduct'],
    Placement: ['Eligibility Issues', 'Company Opportunity', 'Documentation', 'Placement Cell Support', 'Interview Process'],
    Other: ['General']
  };

  function renderCategoryFields() {
    const { category, subCategory } = formData;

    if (category === 'Academic') {
      if (subCategory === 'Teaching Quality') {
        return (
          <>
            <input
              type="text"
              placeholder="Subject Name"
              value={formData.details.subjectName || ''}
              onChange={(e) => setFormData({ ...formData, details: { ...formData.details, subjectName: e.target.value, subCategory } })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
            <input
              type="text"
              placeholder="Faculty Name"
              value={formData.details.facultyName || ''}
              onChange={(e) => setFormData({ ...formData, details: { ...formData.details, facultyName: e.target.value, subCategory } })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
            <input
              type="text"
              placeholder="Issue Type (e.g., Pace of teaching, Methodology)"
              value={formData.details.issueType || ''}
              onChange={(e) => setFormData({ ...formData, details: { ...formData.details, issueType: e.target.value, subCategory } })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </>
        );
      } else if (subCategory === 'Syllabus') {
        return (
          <>
            <input
              type="text"
              placeholder="Subject Name"
              value={formData.details.subjectName || ''}
              onChange={(e) => setFormData({ ...formData, details: { ...formData.details, subjectName: e.target.value, subCategory } })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
            <input
              type="text"
              placeholder="Course Code"
              value={formData.details.courseCode || ''}
              onChange={(e) => setFormData({ ...formData, details: { ...formData.details, courseCode: e.target.value, subCategory } })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
            <input
              type="text"
              placeholder="Issue Type (e.g., Syllabus not completed)"
              value={formData.details.issueType || ''}
              onChange={(e) => setFormData({ ...formData, details: { ...formData.details, issueType: e.target.value, subCategory } })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </>
        );
      } else if (subCategory === 'Time-Table Clash') {
        return (
          <>
            <select
              value={formData.details.clashType || ''}
              onChange={(e) => setFormData({ ...formData, details: { ...formData.details, clashType: e.target.value, subCategory } })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="">Select Clash Type</option>
              <option value="Lecture">Lecture</option>
              <option value="Lab">Lab</option>
              <option value="Internal Exam">Internal Exam</option>
            </select>
            <input
              type="text"
              placeholder="Clashing Subjects (comma separated)"
              value={formData.details.clashingSubjects || ''}
              onChange={(e) => setFormData({ ...formData, details: { ...formData.details, clashingSubjects: e.target.value, subCategory } })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
            <input
              type="date"
              placeholder="Date of Clash"
              value={formData.details.dateOfClash || ''}
              onChange={(e) => setFormData({ ...formData, details: { ...formData.details, dateOfClash: e.target.value, subCategory } })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </>
        );
      } else if (subCategory === 'Lab/Equipment') {
        return (
          <>
            <input
              type="text"
              placeholder="Lab Name or Number"
              value={formData.details.labNameOrNumber || ''}
              onChange={(e) => setFormData({ ...formData, details: { ...formData.details, labNameOrNumber: e.target.value, subCategory } })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
            <input
              type="text"
              placeholder="Equipment or Software"
              value={formData.details.equipmentOrSoftware || ''}
              onChange={(e) => setFormData({ ...formData, details: { ...formData.details, equipmentOrSoftware: e.target.value, subCategory } })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
            <input
              type="text"
              placeholder="Issue Type (e.g., Not working, Unavailable)"
              value={formData.details.issueType || ''}
              onChange={(e) => setFormData({ ...formData, details: { ...formData.details, issueType: e.target.value, subCategory } })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </>
        );
      }
    } else if (category === 'Facility') {
      if (subCategory === 'Classroom Infrastructure') {
        return (
          <>
            <input
              type="text"
              placeholder="Building"
              value={formData.details.building || ''}
              onChange={(e) => setFormData({ ...formData, details: { ...formData.details, building: e.target.value, subCategory } })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
            <input
              type="text"
              placeholder="Room Number"
              value={formData.details.roomNo || ''}
              onChange={(e) => setFormData({ ...formData, details: { ...formData.details, roomNo: e.target.value, subCategory } })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
            <input
              type="text"
              placeholder="Item (e.g., Projector, Fan, Light)"
              value={formData.details.item || ''}
              onChange={(e) => setFormData({ ...formData, details: { ...formData.details, item: e.target.value, subCategory } })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </>
        );
      } else if (subCategory === 'WiFi' || subCategory === 'Water Supply') {
        return (
          <>
            <input
              type="text"
              placeholder="Building"
              value={formData.details.building || ''}
              onChange={(e) => setFormData({ ...formData, details: { ...formData.details, building: e.target.value, subCategory } })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
            <input
              type="text"
              placeholder="Floor"
              value={formData.details.floor || ''}
              onChange={(e) => setFormData({ ...formData, details: { ...formData.details, floor: e.target.value, subCategory } })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
            <input
              type="text"
              placeholder="Location"
              value={formData.details.location || ''}
              onChange={(e) => setFormData({ ...formData, details: { ...formData.details, location: e.target.value, subCategory } })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
            {subCategory === 'Water Supply' && (
              <input
                type="text"
                placeholder="Issue Type (e.g., No water, Unclean water)"
                value={formData.details.issueType || ''}
                onChange={(e) => setFormData({ ...formData, details: { ...formData.details, issueType: e.target.value, subCategory } })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            )}
          </>
        );
      } else if (subCategory === 'Hostel') {
        return (
          <>
            <input
              type="text"
              placeholder="Hostel Name"
              value={formData.details.hostelName || ''}
              onChange={(e) => setFormData({ ...formData, details: { ...formData.details, hostelName: e.target.value, subCategory } })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
            <input
              type="text"
              placeholder="Room Number"
              value={formData.details.roomNo || ''}
              onChange={(e) => setFormData({ ...formData, details: { ...formData.details, roomNo: e.target.value, subCategory } })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
            <input
              type="text"
              placeholder="Issue Type (e.g., Room Maintenance, Mess Food)"
              value={formData.details.issueType || ''}
              onChange={(e) => setFormData({ ...formData, details: { ...formData.details, issueType: e.target.value, subCategory } })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </>
        );
      }
    } else if (category === 'Examination') {
      if (subCategory === 'Marks Related') {
        return (
          <>
            <input
              type="text"
              placeholder="Subject"
              value={formData.details.subject || ''}
              onChange={(e) => setFormData({ ...formData, details: { ...formData.details, subject: e.target.value, subCategory } })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
            <input
              type="text"
              placeholder="Course Code"
              value={formData.details.courseCode || ''}
              onChange={(e) => setFormData({ ...formData, details: { ...formData.details, courseCode: e.target.value, subCategory } })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
            <input
              type="text"
              placeholder="Exam Name (e.g., Mid-Term 1)"
              value={formData.details.examName || ''}
              onChange={(e) => setFormData({ ...formData, details: { ...formData.details, examName: e.target.value, subCategory } })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
            <input
              type="text"
              placeholder="Issue Type (e.g., Error in total)"
              value={formData.details.issueType || ''}
              onChange={(e) => setFormData({ ...formData, details: { ...formData.details, issueType: e.target.value, subCategory } })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </>
        );
      }
    } else if (category === 'Placement') {
      if (subCategory === 'Eligibility Issues') {
        return (
          <>
            <input
              type="text"
              placeholder="Company Name"
              value={formData.details.companyName || ''}
              onChange={(e) => setFormData({ ...formData, details: { ...formData.details, companyName: e.target.value, subCategory } })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
            <input
              type="text"
              placeholder="Criteria in Dispute (e.g., CGPA, Backlogs)"
              value={formData.details.criteriaInDispute || ''}
              onChange={(e) => setFormData({ ...formData, details: { ...formData.details, criteriaInDispute: e.target.value, subCategory } })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </>
        );
      }
    }

    return (
      <div className="text-gray-600 text-sm">
        Please provide details in the description field above.
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!user) throw new Error('User not authenticated');

      const { error: insertError } = await supabase.from('grievances').insert({
        submitted_by: user.id,
        title: formData.title,
        description: formData.description,
        category: formData.category,
        details: formData.details,
      });

      if (insertError) throw insertError;

      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to submit grievance');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white flex items-center justify-between">
            <h2 className="text-2xl font-bold">Submit New Grievance</h2>
            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg transition">
              <X className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-8">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
                {error}
              </div>
            )}

            <div className="space-y-6">
              {step === 1 && (
                <>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Grievance Title
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Brief title of your grievance"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Category
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value, subCategory: '', details: {} })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    >
                      <option value="">Select a category</option>
                      {Object.keys(categories).map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>

                  {formData.category && (
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Sub-Category
                      </label>
                      <select
                        value={formData.subCategory}
                        onChange={(e) => setFormData({ ...formData, subCategory: e.target.value, details: {} })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      >
                        <option value="">Select a sub-category</option>
                        {categories[formData.category as keyof typeof categories].map((subCat) => (
                          <option key={subCat} value={subCat}>
                            {subCat}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows={4}
                      placeholder="Provide detailed description of your grievance"
                      required
                    />
                  </div>

                  {formData.subCategory && (
                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition font-semibold flex items-center justify-center gap-2"
                    >
                      Next: Additional Details
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  )}
                </>
              )}

              {step === 2 && (
                <>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-4">
                      Additional Details for {formData.subCategory}
                    </label>
                    <div className="space-y-4">{renderCategoryFields()}</div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300 transition font-semibold"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? 'Submitting...' : 'Submit Grievance'}
                    </button>
                  </div>
                </>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
