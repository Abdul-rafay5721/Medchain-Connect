import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import { HiSearch, HiUserCircle, HiDocumentText, HiClock, HiDownload } from 'react-icons/hi';
import { FaFilePdf, FaFileImage } from 'react-icons/fa';
import { ethers } from "ethers";

// MedicalRecordsStorage contract ABI and address
const RECORDS_CONTRACT_ADDRESS = import.meta.env.VITE_MEDICAL_RECORDS_CONTRACT_ADDRESS;
const RECORDS_CONTRACT_ABI = [
  "function getRecordsByUploader(address _uploader) public view returns (uint[] memory)",
  "function getRecord(uint _index) public view returns (string title, string date, string recordType, string description, string ipfsUrl, address uploader)"
];

const RecordsAccess = () => {
  const { walletAddress } = useParams();
  const [searchTerm, setSearchTerm] = useState('');
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchRecords() {
      setLoading(true);
      setError('');
      try {
        const provider = new ethers.providers.JsonRpcProvider("http://127.0.0.1:8545/");
        const contract = new ethers.Contract(RECORDS_CONTRACT_ADDRESS, RECORDS_CONTRACT_ABI, provider);

        // Get all record indexes for this patient
        const indexes = await contract.getRecordsByUploader(walletAddress);
        const fetchedRecords = await Promise.all(
          indexes.map(async (idx) => {
            try {
              const rec = await contract.getRecord(idx);
              return {
                id: idx.toString(),
                title: rec.title,
                date: rec.date,
                recordType: rec.recordType,
                description: rec.description,
                ipfsUrl: rec.ipfsUrl,
                uploader: rec.uploader
              };
            } catch {
              return null;
            }
          })
        );
        setRecords(fetchedRecords.filter(Boolean));
      } catch (err) {
        setError('Failed to fetch records');
        setRecords([]);
      } finally {
        setLoading(false);
      }
    }
    if (walletAddress) fetchRecords();
  }, [walletAddress]);

  const filteredRecords = records.filter(record =>
    record.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.recordType.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <h1 className="text-2xl font-bold">Accessible Records</h1>
          <div className="relative w-full md:w-64">
            <HiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search records..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {loading && <div>Loading records...</div>}
        {error && <div className="text-red-500">{error}</div>}

        <div className="grid md:grid-cols-2 gap-6">
          {filteredRecords.map(record => (
            <div key={record.id} className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center">
                  <HiUserCircle className="w-10 h-10 text-blue-600" />
                  <div className="ml-3">
                    <h3 className="font-semibold">{record.title}</h3>
                    <p className="text-sm text-gray-500">{record.recordType}</p>
                  </div>
                </div>
                <div className="text-2xl text-blue-600">
                  {record.ipfsUrl?.endsWith('.pdf') ? <FaFilePdf /> : <FaFileImage />}
                </div>
              </div>

              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center">
                  <HiDocumentText className="mr-2" />
                  Uploaded: {record.date}
                </div>
                <div className="flex items-center">
                  <HiClock className="mr-2" />
                  {/* You can add access expiry logic if available */}
                  {/* Access Expires: ... */}
                </div>
                <div>
                  <span className="font-semibold">Description:</span> {record.description}
                </div>
              </div>

              <a
                href={record.ipfsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 w-full flex items-center justify-center px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100"
                download
              >
                
                View Record
              </a>
            </div>
          ))}
          {filteredRecords.length === 0 && !loading && !error && (
            <div>No records found.</div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default RecordsAccess;
