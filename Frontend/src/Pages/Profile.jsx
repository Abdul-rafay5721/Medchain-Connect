import { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { getUserSession } from '../utils/sessionManager';
import { FaUser, FaEnvelope, FaPhone, FaDroplet, FaIdCard } from 'react-icons/fa6';
import { HiIdentification } from 'react-icons/hi';

const Profile = () => {
  const [userInfo, setUserInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const session = getUserSession();
    if (session) {
      setUserInfo(session);
      setIsLoading(false);
    }
  }, []);

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        {/* Profile Header */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 h-32"></div>
          <div className="px-6 py-4 relative">
            <div className="absolute -top-12 left-6">
              <div className="bg-white p-2 rounded-full shadow-lg">
                <div className="bg-blue-100 w-20 h-20 rounded-full flex items-center justify-center">
                  <FaUser className="w-10 h-10 text-blue-600" />
                </div>
              </div>
            </div>
            <div className="mt-10">
              <h1 className="text-2xl font-bold text-gray-800">{userInfo?.name}</h1>
              <p className="text-gray-600 capitalize">{userInfo?.role}</p>
            </div>
          </div>
        </div>

        {/* Profile Information */}
        <div className="mt-6 bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-6">Personal Information</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-6">
              <div className="flex items-center space-x-4">
                <div className="bg-blue-50 p-3 rounded-lg">
                  <HiIdentification className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Wallet Address</p>
                  <p className="font-medium">{userInfo?.walletAddress}</p>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className="bg-blue-50 p-3 rounded-lg">
                  <FaIdCard className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Age</p>
                  <p className="font-medium">{userInfo?.age} years</p>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className="bg-blue-50 p-3 rounded-lg">
                  <FaDroplet className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Blood Group</p>
                  <p className="font-medium">{userInfo?.bloodGroup}</p>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className="bg-blue-50 p-3 rounded-lg">
                  <FaPhone className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Contact Number</p>
                  <p className="font-medium">{userInfo?.contactNumber}</p>
                </div>
              </div>
            </div>

            {/* Statistics/Summary */}
            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4">Account Summary</h3>
              <div className="space-y-4">
                <div className="bg-white p-4 rounded-lg">
                  <p className="text-sm text-gray-500">Medical Records</p>
                  <p className="text-2xl font-bold text-blue-600">12</p>
                </div>
                <div className="bg-white p-4 rounded-lg">
                  <p className="text-sm text-gray-500">Active Permissions</p>
                  <p className="text-2xl font-bold text-blue-600">3</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Profile;
