import { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { getUserSession } from '../utils/sessionManager';

const ProviderDashboard = () => {
  const userSession = getUserSession();
  console.log('User Session:', userSession);
  
  const walletAddress = userSession?.walletAddress;
  console.log('Provider Wallet Address:', walletAddress);
  
  const [patients, setPatients] = useState([]);
  const acceptedPatientsCount = patients.filter(p => p.accepted === 'Yes').length;
  const accessRequestsCount = patients.filter(p => p.accepted === 'No').length;

  useEffect(() => {
    const fetchPatients = async () => {
      if (!walletAddress) return;
      try {
        const res = await fetch(`http://localhost:5000/api/grant-access/provider/${walletAddress}`);
        if (res.ok) {
          const data = await res.json();
          console.log('Fetched Patients:', data);
          
          setPatients(data);
        }
      } catch (err) {
        console.error('Error fetching provider patients:', err);
      }
    };
    fetchPatients();
  }, [walletAddress]);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold mb-8">Provider Dashboard</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 p-6 rounded-lg">
            <h3 className="text-lg font-medium text-blue-900">Total Patients</h3>
            <p className="text-3xl font-bold text-blue-600">{acceptedPatientsCount}</p>
          </div>
          <div className="bg-green-50 p-6 rounded-lg">
            <h3 className="text-lg font-medium text-green-900">Access Requests</h3>
            <p className="text-3xl font-bold text-green-600">{accessRequestsCount}</p>
          </div>
          <div className="bg-purple-50 p-6 rounded-lg">
            <h3 className="text-lg font-medium text-purple-900">Records Accessed</h3>
            <p className="text-3xl font-bold text-purple-600">0</p>
          </div>
        </div>

        <div className="bg-gray-50 p-6 rounded-lg">
          <h3 className="text-lg font-medium mb-4">Recent Patients</h3>
          <div className="space-y-3">
            {patients.map((patient, idx) => (
              <div key={patient.id || idx} className="flex items-center justify-between p-3 bg-white rounded border">
                <div>
                  <p className="font-medium">{patient.name || patient.patientName || patient.patient || 'Unknown'}</p>
                  <p className="text-sm text-gray-500">Last accessed: {patient.lastAccessed || 'N/A'}</p>
                </div>
                <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                  View Records
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ProviderDashboard;
