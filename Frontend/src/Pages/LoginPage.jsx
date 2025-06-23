import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ethers } from "ethers";
import { setUserSession } from '../utils/sessionManager';

// Use local blockchain contract address
const CONTRACT_ADDRESS = import.meta.env.VITE_ROLE_REGISTRY_CONTRACT_ADDRESS; // Replace with your local contract address
const CONTRACT_ABI = [
  "function userRoles(address) view returns (uint8)",
  "function getPatientInfo(address user) public view returns (string name, uint age, string bloodGroup, string contactNumber)",
  "function getProviderInfo(address user) public view returns (string name, string hospital, string specialization, string licenseNumber, string contactNumber)"
];

const LoginPage = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [walletAddress, setWalletAddress] = useState('');
  const [userRole, setUserRole] = useState('');
  const [userInfo, setUserInfo] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const navigate = useNavigate();

  // Fetch accounts on mount
  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const provider = new ethers.providers.JsonRpcProvider("http://127.0.0.1:8545/");
        const accs = await provider.listAccounts();
        setAccounts(accs);
      } catch (err) {
        setError('Could not fetch accounts from local blockchain.');
      }
    };
    fetchAccounts();
  }, []);

  const handleAccountChange = (e) => {
    setWalletAddress(e.target.value);
    setUserInfo(null);
    setUserRole('');
    setError('');
  };

  const connectWallet = async () => {
    try {
      setLoading(true);
      setError('');

      if (!walletAddress) {
        setError('Please select an account.');
        return;
      }
      // Connect to local blockchain
      const provider = new ethers.providers.JsonRpcProvider("http://127.0.0.1:8545/");
      // Check if the contract address is a contract
      const code = await provider.getCode(CONTRACT_ADDRESS);
      if (!code || code === "0x") {
        setError("The contract address is not a deployed contract. Please check your contract deployment and address.");
        return;
      }

      // Get user role from contract (userRoles mapping: 0=None, 1=Patient, 2=Provider)
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
      const roleId = await contract.userRoles(walletAddress);

      let role = "";
      if (roleId === 1 || roleId === "1") {
        role = "patient";
      } else if (roleId === 2 || roleId === "2") {
        role = "provider";
      } else {
        setError("Please register first");
        return;
      }

      let userInfo = {};
      if (role === "patient") {
        const info = await contract.getPatientInfo(walletAddress);
        userInfo = {
          name: info.name,
          age: info.age?.toString(),
          bloodGroup: info.bloodGroup,
          contactNumber: info.contactNumber,
          role: "patient"
        };
      } else if (role === "provider") {
        const info = await contract.getProviderInfo(walletAddress);
        userInfo = {
          name: info.name,
          hospital: info.hospital,
          specialization: info.specialization,
          licenseNumber: info.licenseNumber ? info.licenseNumber.toString() : "",
          contactNumber: info.contactNumber.toString(),
          role: "provider"
        };
        console.log(`Provider Info: ${JSON.stringify(userInfo)}`);
      }

      // Store user session
      setUserSession(walletAddress, userInfo);
      // Also set in localStorage for session persistence
      localStorage.setItem('userSession', JSON.stringify({ address: walletAddress, userInfo }));
      
      

      // Set states for UI feedback
      setUserInfo(userInfo);
      setUserRole(role);

      // Show success message and redirect after a delay
      const successMessage = `Successfully logged in as ${role}`;
      console.log(successMessage);

      setTimeout(() => {
        if (role === 'patient') {
          navigate('/patient-dashboard');
        } else if (role === 'provider') {
          navigate('/provider-dashboard');
        }
      }, 1000);

    } catch (err) {
      console.error('Login error:', err);
      setError(err.message || 'Failed to get user information');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Login with Local Blockchain</h2>
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
            {error}
          </div>
        )}
        <div className="mb-4">
          <label className="block mb-2 font-medium">Select Account</label>
          <select
            value={walletAddress}
            onChange={handleAccountChange}
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 mb-2"
            required
          >
            <option value="">Choose blockchain account</option>
            {accounts.map(acc => (
              <option key={acc} value={acc}>{acc}</option>
            ))}
          </select>
        </div>
        <button
          onClick={connectWallet}
          disabled={loading || !walletAddress}
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors mb-4"
        >
          {loading ? 'Connecting...' : 'Connect Local Account'}
        </button>
        {walletAddress && userInfo && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg space-y-2">
            <p className="text-sm text-gray-600 break-all">
              Connected: {walletAddress}
            </p>
            <p className="text-sm text-gray-600">Name: {userInfo.name}</p>
            {userInfo.role === "patient" && (
              <>
                <p className="text-sm text-gray-600">Age: {userInfo.age}</p>
                <p className="text-sm text-gray-600">Blood Group: {userInfo.bloodGroup}</p>
                <p className="text-sm text-gray-600">Contact: {userInfo.contactNumber}</p>
              </>
            )}
            {userInfo.role === "provider" && (
              <>
                <p className="text-sm text-gray-600">Hospital: {userInfo.hospital}</p>
                <p className="text-sm text-gray-600">Specialization: {userInfo.specialization}</p>
                <p className="text-sm text-gray-600">License Number: {userInfo.licenseNumber}</p>
                <p className="text-sm text-gray-600">Contact: {userInfo.contactNumber}</p>
              </>
            )}
            <p className="text-sm text-gray-600">Role: {userInfo.role}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoginPage;
