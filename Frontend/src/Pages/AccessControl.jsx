import { useState, useEffect } from 'react';
import { ethers } from "ethers";
import DashboardLayout from '../components/DashboardLayout';
import { HiUserAdd, HiX, HiSearch, HiCheck, HiX as HiRemove } from 'react-icons/hi';
import { MdAccessTime } from 'react-icons/md';
import toast, { Toaster } from 'react-hot-toast';

// Use local blockchain contract address
const CONTRACT_ADDRESS = import.meta.env.VITE_ROLE_REGISTRY_CONTRACT_ADDRESS;
const CONTRACT_ABI = [
  "function userRoles(address) view returns (uint8)",
  "function getProviderInfo(address user) public view returns (string name, string hospital, string specialization, string licenseNumber, string contactNumber)"
];

const toastOptions = {
  duration: 2000,
  style: {
    fontSize: '1.15rem',
    padding: '1.25rem 2rem',
    minWidth: '340px',
    borderRadius: '0.75rem',
    boxShadow: '0 4px 24px 0 rgba(0,0,0,0.10)',
  },
  position: 'top-right',
  iconTheme: {
    primary: '#2563eb',
    secondary: '#fff',
  },
};

function ToastWithProgress(message, type = "success") {
  toast.custom((t) => (
    <div
      className={`bg-white shadow-lg rounded-xl px-6 py-5 min-w-[340px] border-l-8 ${
        type === "success" ? "border-green-500" : "border-red-500"
      }`}
      style={{ fontSize: "1.15rem", position: "relative", overflow: "hidden" }}
    >
      <div className="mb-2 font-semibold">
        {type === "success" ? "Success" : "Error"}
      </div>
      <div>{message}</div>
        <div
          className={`h-2 rounded transition-all duration-100 ${type === "success" ? "bg-green-500" : "bg-red-500"}`}
          style={{
            width: "100%",
            position: "absolute",
            left: 0,
            bottom: 0,
            animation: "progressBarAnim 3s linear forwards"
          }}
        />
      <style>
        {`
          @keyframes progressBarAnim {
            from { width: 100%; }
            to { width: 0%; }
          }
        `}
      </style>
    </div>
  ), { duration: 2000 });
}

const AccessControl = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [doctorAccounts, setDoctorAccounts] = useState([]);
  const [filteredDoctors, setFilteredDoctors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [accessList, setAccessList] = useState([]);
  const [accessRecords, setAccessRecords] = useState([]);

  // Fetch doctor accounts from blockchain
  useEffect(() => {
    async function fetchDoctorAccounts() {
      setLoading(true);
      setError('');
      try {
        const provider = new ethers.providers.JsonRpcProvider("http://127.0.0.1:8545/");
        const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
        const accounts = await provider.listAccounts();
        const doctors = [];
        for (const address of accounts) {
          try {
            const roleId = await contract.userRoles(address);
            if (roleId === 2 || roleId === "2") {
              const info = await contract.getProviderInfo(address);
              doctors.push({
                id: address,
                name: info.name,
                hospital: info.hospital,
                speciality: info.specialization,
                walletAddress: address,
                licenseNumber: info.licenseNumber,
                contactNumber: info.contactNumber,
                role: "provider"
              });
            }
          } catch (err) {
            // Ignore accounts that throw (not registered, etc.)
          }
        }
        setDoctorAccounts(doctors);
      } catch (err) {
        setError("Failed to fetch doctors from blockchain.");
      } finally {
        setLoading(false);
      }
    }
    fetchDoctorAccounts();
  }, []);

  useEffect(() => {
    setFilteredDoctors(
      doctorAccounts.filter(
        (doc) =>
          doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          doc.walletAddress.toLowerCase().includes(searchQuery.toLowerCase())
      )
    );
  }, [searchQuery, doctorAccounts]);

  // Fetch access records for current patient from backend
  useEffect(() => {
    const userSession = sessionStorage.getItem('userSession');
    const patientWallet = userSession ? JSON.parse(userSession).walletAddress : null;
    if (!patientWallet) {
      setAccessRecords([]);
      return;
    }
    async function fetchAccessList() {
      try {
        const res = await fetch(`http://localhost:5000/api/grant-access/patient/${patientWallet}`);
        if (!res.ok) throw new Error('Failed to fetch access list');
        const data = await res.json();
        // If backend returns a single object, wrap in array
        setAccessRecords(Array.isArray(data) ? data : [data]);
      } catch (err) {
        setAccessRecords([]);
      }
    }
    fetchAccessList();
  }, []);

  // Combine access records with provider info
  useEffect(() => {
    // Map each access record to provider info
    const list = accessRecords.map(record => {
      const provider = doctorAccounts.find(doc => doc.walletAddress.toLowerCase() === record.providerWallet.toLowerCase());
      return {
        id: record._id || record.providerWallet,
        name: provider?.name || 'Unknown',
        hospital: provider?.hospital || '',
        speciality: provider?.speciality || provider?.specialization || '',
        walletAddress: record.providerWallet,
        grantedAt: record.createdAt ? new Date(record.createdAt).toLocaleDateString() : '',
        expiresAt: record.expiresAt ? new Date(record.expiresAt).toLocaleDateString() : '', // if exists
      };
    });
    setAccessList(list);
  }, [accessRecords, doctorAccounts]);

  const handleGrantAccess = async (provider) => {
    // Get patient wallet address from session/local storage
    const patientWallet = sessionStorage.getItem('userSession') ? JSON.parse(sessionStorage.getItem('userSession')).walletAddress : null;
    console.log('patientWallet:', patientWallet);
    
    if (!patientWallet) {
      ToastWithProgress('Patient wallet address not found in session.', "error");
      return;
    }
    try {
      const response = await fetch('http://localhost:5000/api/grant-access', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          patientWallet,
          providerWallet: provider.walletAddress,
          grantAccess: "Yes"
        })
      });
      if (!response.ok) {
        throw new Error('Already granted access!');
      }
      ToastWithProgress('Access granted successfully!', "success");
      setIsModalOpen(false);

      // Option 1: Fetch updated access list from backend
      try {
        const res = await fetch(`http://localhost:5000/api/grant-access/patient/${patientWallet}`);
        if (res.ok) {
          const data = await res.json();
          setAccessRecords(Array.isArray(data) ? data : [data]);
        }
      } catch (err) {
        // Optionally handle fetch error
      }

      // Option 2 (alternative): 
      // setAccessRecords(prev => [...prev, { providerWallet: provider.walletAddress, createdAt: new Date().toISOString(), _id: Math.random().toString() }]);
      // (But fetching from backend is more reliable)
    } catch (err) {
      ToastWithProgress(err.message, "error");
    }
  };

  const handleRevokeAccess = async (accessId) => {
    if (!accessId) return;
    try {
      const response = await fetch(`http://localhost:5000/api/grant-access/${accessId}`, {
        method: 'DELETE'
      });
      if (!response.ok) {
        throw new Error('Failed to revoke access');
      }
      setAccessList(prev => prev.filter(item => item.id !== accessId));
      setAccessRecords(prev => prev.filter(item => (item._id || item.providerWallet) !== accessId));
      ToastWithProgress('Access revoked successfully!', "success");
    } catch (err) {
      ToastWithProgress('Error revoking access: ' + err.message, "error");
    }
  };

  return (
    <DashboardLayout>
      <Toaster position="top-right" toastOptions={toastOptions} />
      <div className="space-y-8">
        {/* Header with Grant Access Button */}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Access Control</h1>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <HiUserAdd className="mr-2" />
            Grant Access
          </button>
        </div>

        {/* Active Access List */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-4">Active Access Permissions</h2>
          <div className="space-y-4">
            {accessList.map((provider) => (
              <div key={provider.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-lg">{provider.name}</h3>
                    <p className="text-sm text-gray-600">{provider.hospital}</p>
                    <p className="text-sm text-gray-600">{provider.speciality}</p>
                    <p className="text-sm text-gray-500 mt-2">Wallet: {provider.walletAddress}</p>
                  </div>
                  <div className="text-right">
                    <button
                      onClick={() => handleRevokeAccess(provider.id)}
                      className="px-3 py-1 bg-red-50 text-red-600 rounded-md hover:bg-red-100"
                    >
                      Revoke Access
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Grant Access Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen px-4">
              <div className="fixed inset-0 bg-black opacity-50" onClick={() => setIsModalOpen(false)}></div>
              
              <div className="relative bg-white rounded-xl shadow-lg max-w-2xl w-full p-6 z-10">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-2xl font-bold">Grant Access</h3>
                  <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full">
                    <HiX className="text-gray-500" />
                  </button>
                </div>

                {/* Search Bar */}
                <div className="relative mb-6">
                  <HiSearch className="absolute left-3 top-3 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search providers by name or wallet address..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Search Results */}
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {loading && (
                    <div className="text-gray-500 text-center py-8">Loading doctors...</div>
                  )}
                  {error && (
                    <div className="text-red-500 text-center py-8">{error}</div>
                  )}
                  {!loading && !error && filteredDoctors.map((provider) => (
                    <div key={provider.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <h4 className="font-semibold">{provider.name}</h4>
                          <p className="text-sm text-gray-600">{provider.hospital}</p>
                          <p className="text-sm text-gray-600">{provider.speciality}</p>
                          <p className="text-sm text-gray-500 mt-1">Wallet: {provider.walletAddress}</p>
                          <p className="text-sm text-gray-500 mt-1">License: {provider.licenseNumber}</p>
                          <p className="text-sm text-gray-500 mt-1">Contact: {provider.contactNumber}</p>
                        </div>
                        <button
                          onClick={() => handleGrantAccess(provider)}
                          className="flex items-center px-3 py-1 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100"
                        >
                          <HiCheck className="mr-1" />
                          Grant Access
                        </button>
                      </div>
                    </div>
                  ))}
                  {!loading && !error && filteredDoctors.length === 0 && (
                    <div className="text-gray-500 text-center py-8">No doctors found.</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default AccessControl;
