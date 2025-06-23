import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { useNavigate } from 'react-router-dom';

// Updated ABI for new contract
const CONTRACT_ABI = [
  "function registerPatient(string _name, uint _age, string _bloodGroup, string _contactNumber) public",
  "function registerProvider(string _name, string _hospital, string _specialization, string _licenseNumber, string _contactNumber) public",
  "function getUserRole(address user) public view returns (string)",
  "function getPatientInfo(address user) public view returns (string name, uint age, string bloodGroup, string contactNumber)",
  "function getProviderInfo(address user) public view returns (string name, string hospital, string specialization, string licenseNumber, string contactNumber)"
];
const CONTRACT_ADDRESS = import.meta.env.VITE_ROLE_REGISTRY_CONTRACT_ADDRESS; // Replace with your local contract address

const SignupPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    walletAddress: '',
    role: '',
    // Patient fields
    name: '',
    age: '',
    bloodGroup: '',
    contactNumber: '',
    // Provider fields
    hospital: '',
    specialization: '',
    licenseNumber: ''
  });
  const [isConnecting, setIsConnecting] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState('');
  const [alreadyRegistered, setAlreadyRegistered] = useState(false);
  const [accounts, setAccounts] = useState([]);

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

  const connectWallet = async () => {
    try {
      setIsConnecting(true);
      setError('');

      // Connect to local blockchain
      const provider = new ethers.providers.JsonRpcProvider("http://127.0.0.1:8545/");
      const accounts = await provider.listAccounts();
      if (!accounts || accounts.length === 0) {
        setError("No accounts found on local blockchain. Please start your local node and unlock an account.");
        return;
      }
      const address = accounts[0];

      // Check if wallet is already registered
      const isRegistered = await checkWalletRegistration(address);
      setFormData(prev => ({ ...prev, walletAddress: address }));

    } catch (err) {
      setError(typeof err === 'string' ? err : err.message);
    } finally {
      setIsConnecting(false);
    }
  };

  const checkWalletRegistration = async (address, providerOverride) => {
    try {
      const provider = providerOverride || new ethers.providers.JsonRpcProvider("http://127.0.0.1:8545/");
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
      const role = await contract.getUserRole(address);
      if (role && role !== "") {
        setAlreadyRegistered(true);
        return true;
      }
      setAlreadyRegistered(false);
      return false;
    } catch (err) {
      setAlreadyRegistered(false);
      return false;
    }
  };

  const handleAccountChange = async (e) => {
    const address = e.target.value;
    setFormData(prev => ({ ...prev, walletAddress: address }));
    if (address) {
      await checkWalletRegistration(address);
    } else {
      setAlreadyRegistered(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsRegistering(true);
      setError('');

      if (!formData.walletAddress) {
        throw new Error('Please connect wallet first');
      }

      // Use local blockchain provider and signer
      const provider = new ethers.providers.JsonRpcProvider("http://127.0.0.1:8545/");
      const signer = provider.getSigner(formData.walletAddress);
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

      if (formData.role === "patient") {
        const tx = await contract.registerPatient(
          formData.name,
          Number(formData.age),
          formData.bloodGroup,
          formData.contactNumber
        );
        await tx.wait();
      } else if (formData.role === "provider") {
        const tx = await contract.registerProvider(
          formData.name,
          formData.hospital,
          formData.specialization,
          formData.licenseNumber,
          formData.contactNumber
        );
        await tx.wait();
      } else {
        throw new Error("Please select a role");
      }

      navigate('/login');
    } catch (err) {
      setError(err.message);
    } finally {
      setIsRegistering(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Connect Wallet to Sign Up</h2>
        <div className="mb-6">
          <label className="block mb-2 font-medium">Select Account</label>
          <select
            value={formData.walletAddress}
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
        <div className="mb-6">
          <button
            type="button"
            onClick={connectWallet}
            disabled={isConnecting}
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400"
          >
            {isConnecting ? 'Connecting...' :
              formData.walletAddress ? 'Wallet Connected' : 'Connect MetaMask'}
          </button>
          {formData.walletAddress && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 break-all">
                Wallet: {formData.walletAddress}
              </p>
            </div>
          )}
        </div>
        {alreadyRegistered && (
          <div className="mb-4 p-3 bg-yellow-100 text-yellow-700 rounded-lg text-center">
            This account is already registered.{' '}
            <button
              onClick={() => navigate('/login')}
              className="text-blue-600 underline ml-1"
            >
              Login now
            </button>
          </div>
        )}
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
            {error}
          </div>
        )}
        {formData.walletAddress && !alreadyRegistered && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block mb-2 font-medium">Select Role</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Choose a role</option>
                <option value="patient">Patient</option>
                <option value="provider">Healthcare Provider</option>
              </select>
            </div>
            {formData.role === "patient" && (
              <>
                <div>
                  <label className="block mb-2 font-medium">Full Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full p-3 border rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="block mb-2 font-medium">Age</label>
                  <input
                    type="number"
                    value={formData.age}
                    onChange={(e) => setFormData(prev => ({ ...prev, age: e.target.value }))}
                    className="w-full p-3 border rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="block mb-2 font-medium">Blood Group</label>
                  <select
                    value={formData.bloodGroup}
                    onChange={(e) => setFormData(prev => ({ ...prev, bloodGroup: e.target.value }))}
                    className="w-full p-3 border rounded-lg"
                    required
                  >
                    <option value="">Select Blood Group</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                  </select>
                </div>
                <div>
                  <label className="block mb-2 font-medium">Contact Number</label>
                  <input
                    type="tel"
                    value={formData.contactNumber}
                    onChange={(e) => setFormData(prev => ({ ...prev, contactNumber: e.target.value }))}
                    className="w-full p-3 border rounded-lg"
                    required
                  />
                </div>
              </>
            )}
            {formData.role === "provider" && (
              <>
                <div>
                  <label className="block mb-2 font-medium">Full Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full p-3 border rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="block mb-2 font-medium">Hospital</label>
                  <input
                    type="text"
                    value={formData.hospital}
                    onChange={(e) => setFormData(prev => ({ ...prev, hospital: e.target.value }))}
                    className="w-full p-3 border rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="block mb-2 font-medium">Specialization</label>
                  <input
                    type="text"
                    value={formData.specialization}
                    onChange={(e) => setFormData(prev => ({ ...prev, specialization: e.target.value }))}
                    className="w-full p-3 border rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="block mb-2 font-medium">License Number</label>
                  <input
                    type="text"
                    value={formData.licenseNumber}
                    onChange={(e) => setFormData(prev => ({ ...prev, licenseNumber: e.target.value }))}
                    className="w-full p-3 border rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="block mb-2 font-medium">Contact Number</label>
                  <input
                    type="tel"
                    value={formData.contactNumber}
                    onChange={(e) => setFormData(prev => ({ ...prev, contactNumber: e.target.value }))}
                    className="w-full p-3 border rounded-lg"
                    required
                  />
                </div>
              </>
            )}
            <button
              type="submit"
              disabled={isRegistering || !formData.role}
              className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400"
            >
              {isRegistering ? 'Registering...' : 'Register'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default SignupPage;
