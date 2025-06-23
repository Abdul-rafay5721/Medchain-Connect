import { Routes, Route, useLocation } from 'react-router-dom';
import NavigationBar from './components/NavigationBar';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import PatientDashboard from './pages/PatientDashboard';
import ProviderDashboard from './pages/ProviderDashboard';
import MedicalRecords from './pages/MedicalRecords';
import AccessControl from './pages/AccessControl';
import PatientList from './pages/PatientList';
import AccessRequests from './pages/AccessRequests';
import RecordsAccess from './pages/RecordsAccess';
import Profile from './pages/Profile';

function App() {
  const location = useLocation();
  const showDefaultLayout = ['/', '/login', '/signup'].includes(location.pathname);

  return (
    <div className="min-h-screen flex flex-col">
      {showDefaultLayout && <NavigationBar />}
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/patient-dashboard" element={<PatientDashboard />} />
          <Route path="/provider-dashboard" element={<ProviderDashboard />} />
          <Route path="/my-records" element={<MedicalRecords />} />
          <Route path="/access-control" element={<AccessControl />} />
          <Route path="/patient-list" element={<PatientList />} />
          <Route path="/access-requests" element={<AccessRequests />} />
          <Route path="/records-access/:walletAddress" element={<RecordsAccess />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </main>
      {showDefaultLayout && <Footer />}
    </div>
  );
}

export default App;
