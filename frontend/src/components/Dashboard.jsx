import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [generatingReport, setGeneratingReport] = useState(false);
  const [reportUrl, setReportUrl] = useState('');
  const navigate = useNavigate();


  const sampleAssessments = [
    { 
      id: 1, 
      session_id: 'as_hr_02_001', 
      name: 'Health & Fitness Assessment', 
      date: '2023-05-15', 
      type: 'as_hr_02' 
    },
    { 
      id: 2, 
      session_id: 'as_card_01_002', 
      name: 'Cardiac Assessment', 
      date: '2023-06-20', 
      type: 'as_card_01' 
    }
  ];

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    setTimeout(() => {
      setAssessments(sampleAssessments);
      setLoading(false);
    }, 500);
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const generateReport = async (sessionId) => {
    setGeneratingReport(true);
    setReportUrl('');
    setError('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/reports/generate/${sessionId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to generate report');
      }

      setReportUrl(`http://localhost:5000${data.report.url}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setGeneratingReport(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="sr-only">Loading...</span>
          </div>
          <p className="mt-2">Loading assessments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Assessment Dashboard</h1>
        <button
          onClick={handleLogout}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Logout
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      {reportUrl && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4" role="alert">
          <span className="block sm:inline">Report generated successfully!</span>
          <div className="mt-2">
            <a 
              href={reportUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-block bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            >
              View Report
            </a>
          </div>
        </div>
      )}

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="px-4 py-5 sm:px-6">
          <h2 className="text-lg font-medium text-gray-900">Your Assessments</h2>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Select an assessment to generate a report
          </p>
        </div>
        <div className="border-t border-gray-200">
          <ul className="divide-y divide-gray-200">
            {assessments.map((assessment) => (
              <li key={assessment.id} className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">{assessment.name}</h3>
                    <p className="text-sm text-gray-500">Session ID: {assessment.session_id}</p>
                    <p className="text-sm text-gray-500">Date: {assessment.date}</p>
                  </div>
                  <button
                    onClick={() => generateReport(assessment.session_id)}
                    disabled={generatingReport}
                    className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:bg-indigo-300"
                  >
                    {generatingReport ? 'Generating...' : 'Generate Report'}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;