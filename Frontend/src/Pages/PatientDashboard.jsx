import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import { getUserSession } from '../utils/sessionManager';

const CONTRACT_ADDRESS = import.meta.env.VITE_MEDICAL_RECORDS_CONTRACT_ADDRESS;
const CONTRACT_ABI = [
  "function uploadRecord(string _title, string _date, string _recordType, string _description, string _ipfsUrl) public",
  "function getRecord(uint256 _index) public view returns (string memory title, string memory date, string memory recordType, string memory description, string memory ipfsUrl, address uploader)",
  "function getRecordsCount() public view returns (uint256)",
  "function getRecordsByUploader(address _uploader) public view returns (uint256[] memory)",
  "event RecordUploaded(uint256 indexed recordId, address indexed uploader, string title, string ipfsUrl)"
];

const PatientDashboard = () => {
  const userSession = getUserSession();
  const [personalInfo] = useState({
    name: 'John Doe',
    age: 30,
    bloodGroup: 'O+',
    lastCheckup: '2024-01-15'
  });
  const [totalRecords, setTotalRecords] = useState(0);
  const [activePermissions, setActivePermissions] = useState(0);
  const [records, setRecords] = useState([]);

  useEffect(() => {
    const session = JSON.parse(localStorage.getItem('userSession'));
    const walletAddress = session?.address;
    if (!walletAddress) return;
    if (!CONTRACT_ADDRESS) {
      console.error('CONTRACT_ADDRESS is undefined. Check your .env file and restart the dev server.');
      return;
    }

    const fetchRecordsCount = async () => {
      try {
        const { ethers } = await import('ethers');
        const provider = new ethers.providers.JsonRpcProvider("http://127.0.0.1:8545/");
        const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
        // Get record indices for this user
        const recordIds = await contract.getRecordsByUploader(walletAddress);
        console.log('Record IDs:', recordIds);
        setRecords(recordIds);
        setTotalRecords(recordIds.length);
      } catch (err) {
        console.error('Error fetching user record count:', err);
      }
    };

    const fetchActivePermissions = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/grant-access/patient/${walletAddress}`);
        if (res.ok) {
          const data = await res.json();
          setActivePermissions(data.length || 0);
        }
      } catch (err) {
        console.error('Error fetching permissions:', err);
      }
    };

    fetchRecordsCount();
    fetchActivePermissions();
  }, []);

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8 space-y-6">
        <h1 className="text-3xl font-bold mb-8">Patient Dashboard</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 p-6 rounded-lg">
            <h3 className="text-lg font-medium text-blue-900">Total Records</h3>
            <p className="text-3xl font-bold text-blue-600">{totalRecords}</p>
          </div>
          <div className="bg-green-50 p-6 rounded-lg">
            <h3 className="text-lg font-medium text-green-900">Active Permissions</h3>
            <p className="text-3xl font-bold text-green-600">{activePermissions}</p>
          </div>
          <div className="bg-purple-50 p-6 rounded-lg">
            <h3 className="text-lg font-medium text-purple-900">Recent Access</h3>
            <p className="text-3xl font-bold text-purple-600">0</p>
          </div>
        </div>

        <div className="bg-gray-50 p-6 rounded-lg">
          <h3 className="text-lg font-medium mb-4">Recent Activity</h3>
          <div className="space-y-3">
            {/* Activity items */}
            <div className="flex items-center justify-between p-3 bg-white rounded border">
              <div>
                <p className="font-medium">New record added</p>
                <p className="text-sm text-gray-500">Blood test results</p>
              </div>
              <span className="text-sm text-gray-500">2 hours ago</span>
            </div>
            {/* Add more activity items */}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default PatientDashboard;
