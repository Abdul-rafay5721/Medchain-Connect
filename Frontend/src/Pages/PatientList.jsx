import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import { HiSearch, HiFilter, HiUserCircle, HiCalendar, HiDocumentText } from 'react-icons/hi';
import { FaFileMedical } from 'react-icons/fa';
import { ethers } from "ethers";

// Use local blockchain contract address and ABI
const CONTRACT_ADDRESS = import.meta.env.VITE_ROLE_REGISTRY_CONTRACT_ADDRESS;
const CONTRACT_ABI = [
  "function getPatientInfo(address user) public view returns (string name, uint age, string bloodGroup, string contactNumber)"
];

const PatientList = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const filterOptions = [
    { value: 'all', label: 'All Patients' },
    { value: 'active', label: 'Active Access' },
    { value: 'pending', label: 'Pending Access' },
  ];

  useEffect(() => {
    async function fetchPatients() {
      setLoading(true);
      setError('');
      // Get provider wallet address from session/local storage
      const userSession = sessionStorage.getItem('userSession');
      const providerWallet = userSession ? JSON.parse(userSession).walletAddress : null;
      if (!providerWallet) {
        setPatients([]);
        setError('Provider wallet address not found in session.');
        setLoading(false);
        return;
      }
      try {
        // Get patient access records for this provider
        const res = await fetch(`http://localhost:5000/api/grant-access/provider/${providerWallet}`);
        if (!res.ok) throw new Error('Failed to fetch patient list');
        const data = await res.json();
        const accessRecords = Array.isArray(data) ? data : [data];

        // Only show accepted/active patients (accepted === 'Yes')
        const filteredRecords = accessRecords.filter(r => r.accepted === 'Yes');

        // Fetch patient info from blockchain for each patientWallet
        const provider = new ethers.providers.JsonRpcProvider("http://127.0.0.1:8545/");
        const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);

        const patientsWithDetails = await Promise.all(
          filteredRecords.map(async (rec) => {
            let name = '';
            let age = '';
            let bloodGroup = '';
            let contactNumber = '';
            try {
              const info = await contract.getPatientInfo(rec.patientWallet);
              name = info.name;
              age = info.age?.toString();
              bloodGroup = info.bloodGroup;
              contactNumber = info.contactNumber;
            } catch {
              // If not found or error, leave blank
            }
            return {
              id: rec._id || rec.patientWallet,
              name,
              age,
              bloodGroup,
              contactNumber,
              walletAddress: rec.patientWallet,
              accessStatus: 'active',
              lastVisit: rec.updatedAt ? new Date(rec.updatedAt).toLocaleDateString() : '',
              recordsCount: rec.recordsCount || 0 // You may want to fetch this from another API or contract
            };
          })
        );
        setPatients(patientsWithDetails);
      } catch (err) {
        setPatients([]);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchPatients();
  }, []);

  const handleViewRecords = (patientId) => {
    const patient = patients.find(p => p.id === patientId);
    if (patient && patient.walletAddress) {
      // Make sure the route exists in your router (App.jsx or wherever you define routes)
      // Example: <Route path="/records-access/:walletAddress" element={<RecordsAccess />} />
      navigate(`/records-access/${patient.walletAddress}`);
    } else {
      // Optionally show a toast or error if patient or walletAddress is missing
      alert('Patient wallet address not found or route does not exist.');
    }
  };

  const filteredPatients = patients.filter(patient => {
    const matchesSearch = patient.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         patient.walletAddress?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = selectedFilter === 'all' || patient.accessStatus === selectedFilter;
    return matchesSearch && matchesFilter;
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <h1 className="text-2xl font-bold">Patient List</h1>
          
          {/* Search and Filter Section */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative">
              <HiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search patients..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border rounded-lg w-full md:w-64 focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="relative">
              <HiFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <select
                value={selectedFilter}
                onChange={(e) => setSelectedFilter(e.target.value)}
                className="pl-10 pr-4 py-2 border rounded-lg w-full md:w-48 focus:ring-2 focus:ring-blue-500"
              >
                {filterOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {loading && <div>Loading patients...</div>}
        {error && <div className="text-red-500">{error}</div>}

        {/* Patients Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPatients.map(patient => (
            <div key={patient.id} className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center">
                  <HiUserCircle className="w-12 h-12 text-blue-600" />
                  <div className="ml-3">
                    <h3 className="font-semibold text-lg">{patient.name || 'Patient'}</h3>
                    <p className="text-sm text-gray-500">
                      Age: {patient.age || '-'} • {patient.bloodGroup || '-'}
                    </p>
                    <p className="text-sm text-gray-500 break-all">{patient.walletAddress}</p>
                    {patient.contactNumber && (
                      <p className="text-sm text-gray-500">Contact: {patient.contactNumber}</p>
                    )}
                  </div>
                </div>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  patient.accessStatus === 'active' 
                    ? 'bg-green-100 text-green-700'
                    : 'bg-yellow-100 text-yellow-700'
                }`}>
                  {patient.accessStatus}
                </span>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center text-sm text-gray-600">
                  <HiCalendar className="mr-2" />
                  Last Visit: {patient.lastVisit || '-'}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <HiDocumentText className="mr-2" />
                  Records: {patient.recordsCount}
                </div>
              </div>

              <div className="flex justify-between">
                <button
                  onClick={() => handleViewRecords(patient.id)}
                  className="flex items-center px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  <FaFileMedical className="mr-2" />
                  View Records
                </button>
              </div>
            </div>
          ))}
          {filteredPatients.length === 0 && !loading && !error && (
            <div>No patients found.</div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default PatientList;
