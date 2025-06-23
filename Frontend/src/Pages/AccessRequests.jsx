import { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { HiUserCircle, HiClock, HiCheck, HiX } from 'react-icons/hi';
import { ethers } from "ethers";

// Use local blockchain contract address and ABI
const CONTRACT_ADDRESS = import.meta.env.VITE_ROLE_REGISTRY_CONTRACT_ADDRESS;
const CONTRACT_ABI = [
  "function getPatientInfo(address user) public view returns (string name, uint age, string bloodGroup, string contactNumber)"
];

const AccessRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Get provider wallet address from session/local storage
    const userSession = sessionStorage.getItem('userSession');
    const providerWallet = userSession ? JSON.parse(userSession).walletAddress : null;
    if (!providerWallet) {
      setRequests([]);
      setError('Provider wallet address not found in session.');
      return;
    }
    setLoading(true);
    setError('');
    fetch(`http://localhost:5000/api/grant-access/provider/${providerWallet}`)
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch access requests');
        return res.json();
      })
      .then(async data => {
        const reqs = Array.isArray(data) ? data : [data];
        // Only show requests where accepted === 'no'
        const filteredReqs = reqs.filter(req => req.accepted === 'No');
        // Fetch patient info for each request from blockchain
        const provider = new ethers.providers.JsonRpcProvider("http://127.0.0.1:8545/");
        const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);

        const requestsWithPatient = await Promise.all(
          filteredReqs.map(async (req) => {
            let patientName = '';
            let patientAge = '';
            let patientBloodGroup = '';
            let patientContact = '';
            try {
              const info = await contract.getPatientInfo(req.patientWallet);
              patientName = info.name;
              patientAge = info.age?.toString();
              patientBloodGroup = info.bloodGroup;
              patientContact = info.contactNumber;
            } catch {
              // If not found or error, leave blank
            }
            return {
              ...req,
              patientName,
              patientAge,
              patientBloodGroup,
              patientContact,
            };
          })
        );
        setRequests(requestsWithPatient);
      })
      .catch(err => {
        setRequests([]);
        setError(err.message);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleRequest = async (requestId, action) => {
    if (!requestId) return;
    try {
      if (action === 'approve') {
        const response = await fetch(`http://localhost:5000/api/grant-access/accept/${requestId}`, {
          method: 'PUT'
        });
        if (!response.ok) throw new Error('Failed to approve request');
      } else if (action === 'reject') {
        const response = await fetch(`http://localhost:5000/api/grant-access/${requestId}`, {
          method: 'DELETE'
        });
        if (!response.ok) throw new Error('Failed to reject request');
      }
      // Remove the request from UI after action
      setRequests(prev => prev.filter(r => (r._id || r.id) !== requestId));
    } catch (err) {
      // Optionally show error toast or message
      alert(err.message);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Access Requests</h1>
          <div className="flex gap-2">
            <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm">
              {requests.filter(r => r.status === 'pending').length} Pending
            </span>
          </div>
        </div>

        {loading && <div>Loading access requests...</div>}
        {error && <div className="text-red-500">{error}</div>}

        <div className="grid gap-4">
          {requests.map(request => (
            <div key={request._id || request.id || request.patientWallet} className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-center">
                  <HiUserCircle className="w-12 h-12 text-blue-600" />
                  <div className="ml-4">
                    <h3 className="font-semibold text-lg">{request.patientName || 'Patient'}</h3>
                    <p className="text-sm text-gray-500">{request.patientWallet}</p>
                    {request.patientAge && (
                      <p className="text-sm text-gray-500">Age: {request.patientAge}</p>
                    )}
                    {request.patientBloodGroup && (
                      <p className="text-sm text-gray-500">Blood Group: {request.patientBloodGroup}</p>
                    )}
                    {request.patientContact && (
                      <p className="text-sm text-gray-500">Contact: {request.patientContact}</p>
                    )}
                    <div className="flex items-center mt-1 text-sm text-gray-500">
                      <HiClock className="mr-1" />
                      Requested: {request.createdAt ? new Date(request.createdAt).toLocaleString() : ''}
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => handleRequest(request._id || request.id, 'approve')}
                    className="flex items-center px-3 py-1 bg-green-50 text-green-600 rounded-lg hover:bg-green-100"
                  >
                    <HiCheck className="mr-1" />
                    Approve
                  </button>
                  <button
                    onClick={() => handleRequest(request._id || request.id, 'reject')}
                    className="flex items-center px-3 py-1 bg-red-50 text-red-600 rounded-lg hover:bg-red-100"
                  >
                    <HiX className="mr-1" />
                    Reject
                  </button>
                </div>
              </div>
            </div>
          ))}
          {requests.length === 0 && !loading && !error && (
            <div>No access requests found.</div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AccessRequests;
