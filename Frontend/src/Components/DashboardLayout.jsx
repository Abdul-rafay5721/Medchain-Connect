import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { getUserSession, clearUserSession } from '../utils/sessionManager';
import logo from '../assets/Medchain connect logo.png';
import { RiDashboardLine, RiFileList3Line, RiLockLine, RiCheckLine } from 'react-icons/ri';
import { HiUsers, HiDocumentText } from 'react-icons/hi';
import { MdOutlineRequestPage } from 'react-icons/md';
import { CgProfile } from 'react-icons/cg';
import { FiLogOut } from 'react-icons/fi';
import { BiChevronLeft, BiChevronRight } from 'react-icons/bi';

const DashboardLayout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const userSession = getUserSession();

  const NavLink = ({ to, children, icon: Icon }) => {
    const isActive = location.pathname === to;
    return (
      <Link 
        to={to}
        className={`flex items-center ${isCollapsed ? 'justify-center' : 'px-4'} py-3 rounded-lg transition-colors ${
          isActive 
            ? 'bg-blue-50 text-blue-600' 
            : 'text-gray-600 hover:bg-gray-50'
        }`}
      >
        <Icon className={`${isCollapsed ? 'text-2xl' : 'text-xl'} ${isActive ? 'text-blue-600' : 'text-gray-500'}`} />
        {!isCollapsed && <span className="ml-3">{children}</span>}
      </Link>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-40 transform transition-all duration-300 ease-in-out
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          ${isCollapsed ? 'w-16' : 'w-64'}
          bg-white border-r border-gray-200`}
      >
        {/* Logo Section */}
        <div className="h-16 flex items-center border-b border-gray-200">
          <div className={`flex items-center ${isCollapsed ? 'justify-center w-full' : 'justify-between px-4 w-full'}`}>
            {!isCollapsed ? (
              <>
                <div className="flex items-center">
                  <img src={logo} alt="Logo" className="h-8 w-8" />
                  <span className="ml-2 text-lg font-semibold text-gray-800">
                    MedChain
                  </span>
                </div>
              </>
            ) : (
              <img src={logo} alt="Logo" className="h-8 w-8" />
            )}
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className={`p-2 rounded-lg hover:bg-gray-100 ${isCollapsed ? 'absolute right-0 -mr-3 bg-white shadow-md border' : ''}`}
            >
              {isCollapsed ? <BiChevronRight size={20} /> : <BiChevronLeft size={20} />}
            </button>
          </div>
        </div>

        {/* User Info */}
        {!isCollapsed && (
          <div className="p-4 border-b border-gray-200">
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="font-medium text-gray-800">{userSession?.name}</p>
              <p className="text-sm text-gray-500 capitalize">{userSession?.role}</p>
            </div>
          </div>
        )}

          <nav className="p-4 space-y-1">
            <NavLink
              to={userSession?.role === 'patient' ? '/patient-dashboard' : '/provider-dashboard'}
              icon={RiDashboardLine}
            >
              Dashboard
            </NavLink>
            {userSession?.role === 'patient' ? (
              <>
                <NavLink to="/my-records" icon={RiFileList3Line}>
            Medical Records
                </NavLink>
                <NavLink to="/access-control" icon={RiLockLine}>
            Access Control
                </NavLink>
                {/* <NavLink to="/permissions" icon={RiCheckLine}>
            Permissions
                </NavLink> */}
              </>
            ) : (
              <>
                <NavLink to="/patient-list" icon={HiUsers}>
            Patient List
                </NavLink>
                <NavLink to="/access-requests" icon={MdOutlineRequestPage}>
            Access Requests
                </NavLink>
              </>
            )}
            <NavLink to="/profile" icon={CgProfile}>
              Profile
            </NavLink>
          </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4">
          <button
            onClick={() => {
              clearUserSession();
              navigate('/login');
            }}
            className={`w-full ${isCollapsed ? 'px-0' : 'px-4'} py-2 text-sm text-red-600 hover:text-white hover:bg-red-600 rounded-lg border border-red-600 transition-colors flex items-center justify-center`}
          >
            <FiLogOut className={`${isCollapsed ? 'text-xl' : 'text-lg'}`} />
            {!isCollapsed && <span className="ml-2">Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`flex-1 min-w-0 overflow-auto p-6 transition-all duration-300`}>
        {children}
      </main>
    </div>
  );
};

export default DashboardLayout;
