import { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { HiUpload, HiDocument, HiCalendar, HiTag, HiPlus, HiX } from 'react-icons/hi';
import { FaFilePdf, FaFileImage } from 'react-icons/fa';
import { ethers } from 'ethers';
import axios from 'axios';

// Smart contract setup
const CONTRACT_ADDRESS = import.meta.env.VITE_MEDICAL_RECORDS_CONTRACT_ADDRESS;
const CONTRACT_ABI = [
  "function uploadRecord(string _title, string _date, string _recordType, string _description, string _ipfsUrl) public",
  "function getRecord(uint256 _index) public view returns (string memory title, string memory date, string memory recordType, string memory description, string memory ipfsUrl, address uploader)",
  "function getRecordsCount() public view returns (uint256)",
  "function getRecordsByUploader(address _uploader) public view returns (uint256[] memory)",
  "event RecordUploaded(uint256 indexed recordId, address indexed uploader, string title, string ipfsUrl)"
];

const MedicalRecords = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [records, setRecords] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    date: '',
    type: '',
    description: '',
    file: null,
  });
  const [isUploading, setIsUploading] = useState(false);
  const [account, setAccount] = useState(null);

  // Get wallet
  useEffect(() => {
    const getAccount = async () => {
      // Use local blockchain provider (e.g., Hardhat, Ganache)
      const provider = new ethers.providers.JsonRpcProvider("http://127.0.0.1:8545/");
      const accounts = await provider.listAccounts();
      if (accounts.length > 0) {
      setAccount(accounts[0]);
      }
    };
    getAccount();
  }, []);

  // Fetch records
  useEffect(() => {
    const fetchRecords = async () => {
      if (!account) return;
      try {
        console.log('Fetching records for account:', account);
        // Use local blockchain provider
        const provider = new ethers.providers.JsonRpcProvider("http://127.0.0.1:8545/");
        const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
        const indices = await contract.getRecordsByUploader(account);
        const fetched = [];

        for (let i = 0; i < indices.length; i++) {
          const idx = Number(indices[i]);
          const rec = await contract.getRecord(idx);
          let ipfsUrl = rec[4];

          // Format to local gateway
          if (ipfsUrl.startsWith('ipfs://')) {
            const cid = ipfsUrl.replace('ipfs://', '');
            ipfsUrl = `http://127.0.0.1:8080/ipfs/${cid}`;
          } else if (ipfsUrl.includes('/ipfs/')) {
            const ipfsPath = ipfsUrl.substring(ipfsUrl.indexOf('/ipfs/'));
            ipfsUrl = `http://127.0.0.1:8080${ipfsPath}`;
          }

          fetched.push({
            id: idx,
            title: rec[0],
            date: rec[1],
            type: rec[2],
            description: rec[3],
            ipfsUrl,
            uploader: rec[5],
            fileType: ipfsUrl.endsWith('.pdf') ? 'pdf' : 'image',
          });
        }
        setRecords(fetched);

        // Show records in console for debug
        console.log("Fetched records from local blockchain:", fetched);
      } catch (err) {
        console.error('Error fetching records:', err);
      }
    };
    fetchRecords();
  }, [account]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.file) return alert("Please select a file.");
    if (!account) return alert("Wallet not connected.");

    setIsUploading(true);
    try {
      // Upload file to Pinata
      const fileData = new FormData();
      fileData.append("file", formData.file);

      const responseData = await axios({
        method: "post",
        url: "https://api.pinata.cloud/pinning/pinFileToIPFS",
        data: fileData,
        headers: {
          pinata_api_key: import.meta.env.VITE_PINATA_API_KEY,
          pinata_secret_api_key: import.meta.env.VITE_PINATA_API_SECRET,
          "Content-Type": "multipart/form-data",
        },
      });

      // Get public IPFS link from Pinata response
      const ipfsHash = responseData.data.IpfsHash;
      const ipfsUrl = `https://gateway.pinata.cloud/ipfs/${ipfsHash}`;

      console.log("Pinata IPFS url:", ipfsUrl);

      // Save metadata to blockchain using ethers and local provider
      const provider = new ethers.providers.JsonRpcProvider("http://127.0.0.1:8545/");
      // Use the first account as signer for local node
      const accounts = await provider.listAccounts();
      const signer = provider.getSigner(accounts[0]);
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

      const tx = await contract.uploadRecord(
        formData.title,
        formData.date,
        formData.type,
        formData.description,
        ipfsUrl
      );
      await tx.wait();

      // Refetch records after upload
      const indices = await contract.getRecordsByUploader(account);
      const fetched = [];
      for (let i = 0; i < indices.length; i++) {
        const idx = Number(indices[i]);
        const rec = await contract.getRecord(idx);
        let ipfsUrl = rec[4];
        // Always use Pinata gateway for display
        if (ipfsUrl && ipfsUrl.startsWith("ipfs://")) {
          const cid = ipfsUrl.replace("ipfs://", "");
          ipfsUrl = `https://gateway.pinata.cloud/ipfs/${cid}`;
        } else if (ipfsUrl && ipfsUrl.includes('/ipfs/')) {
          const ipfsPath = ipfsUrl.substring(ipfsUrl.indexOf('/ipfs/'));
          ipfsUrl = `https://gateway.pinata.cloud${ipfsPath}`;
        }
        fetched.push({
          id: idx,
          title: rec[0],
          date: rec[1],
          type: rec[2],
          description: rec[3],
          ipfsUrl,
          uploader: rec[5],
          fileType: ipfsUrl.endsWith('.pdf') ? 'pdf' : 'image',
        });
      }
      setRecords(fetched);

      // Reset form
      setFormData({ title: '', date: '', type: '', description: '', file: null });
      setIsModalOpen(false);
    } catch (err) {
      console.error('Upload Error:', err);
      alert('Failed to upload to Pinata or save on blockchain.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8 relative">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Medical Records</h2>
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <HiPlus className="mr-2" />
              Add Record
            </button>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {records.map((record) => (
              <div key={record.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{record.title}</h3>
                    <p className="text-sm text-gray-500">{record.date}</p>
                    <p className="text-sm text-gray-500">{record.type}</p>
                    <p className="text-sm text-gray-600 mt-2">{record.description}</p>
                  </div>
                  <div className="text-2xl text-blue-600">
                    {record.fileType === 'pdf' ? <FaFilePdf /> : <FaFileImage />}
                  </div>
                </div>
                <div className="mt-4 flex space-x-2">
                  <a
                    href={record.ipfsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1 text-sm bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100"
                  >
                    View
                  </a>
                  <button
                    className="px-3 py-1 text-sm bg-red-50 text-red-600 rounded-md hover:bg-red-100"
                    onClick={() => setRecords(records.filter((r) => r.id !== record.id))}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {isModalOpen && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen px-4">
              <div className="fixed inset-0 bg-black opacity-50" onClick={() => setIsModalOpen(false)}></div>
              <div className="relative bg-white rounded-xl shadow-lg max-w-2xl w-full p-6 z-10">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-2xl font-bold">Upload Medical Record</h3>
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="p-2 hover:bg-gray-100 rounded-full"
                  >
                    <HiX className="text-gray-500" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <Input label="Record Title" icon={<HiDocument />} value={formData.title} onChange={val => setFormData({ ...formData, title: val })} />
                    <Input label="Date" type="date" icon={<HiCalendar />} value={formData.date} onChange={val => setFormData({ ...formData, date: val })} />
                    <SelectField label="Record Type" icon={<HiTag />} value={formData.type} onChange={val => setFormData({ ...formData, type: val })} />
                    <FileInput icon={<HiUpload />} onChange={(file) => setFormData({ ...formData, file })} />
                  </div>

                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    rows="3"
                  />

                  <div className="flex justify-end space-x-3">
                    <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border rounded-lg hover:bg-gray-50" disabled={isUploading}>Cancel</button>
                    <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-300" disabled={isUploading}>
                      {isUploading ? "Uploading..." : "Upload Record"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

const Input = ({ label, type = "text", icon, value, onChange }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
    <div className="flex items-center">
      {icon}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="flex-1 p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
        required
      />
    </div>
  </div>
);

const SelectField = ({ label, icon, value, onChange }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
    <div className="flex items-center">
      {icon}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="flex-1 p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
        required
      >
        <option value="">Select Type</option>
        <option value="Lab Report">Lab Report</option>
        <option value="Prescription">Prescription</option>
        <option value="Imaging">Imaging</option>
        <option value="Surgery">Surgery</option>
      </select>
    </div>
  </div>
);

const FileInput = ({ icon, onChange }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">Upload File</label>
    <div className="flex items-center">
      {icon}
      <input
        type="file"
        onChange={(e) => onChange(e.target.files[0])}
        className="flex-1 p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
        required
      />
    </div>
  </div>
);

export default MedicalRecords;
