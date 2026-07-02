import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import PatientProfile from '../components/patient/PatientProfile';
import DoctorSearch from '../components/patient/DoctorSearch';
import MyAppointments from '../components/patient/MyAppointments';

const NAV_ITEMS = [
  { key: 'profile', label: 'My Profile' },
  { key: 'doctors', label: 'Find Doctors' },
  { key: 'appointments', label: 'My Appointments' },
];

const SECTION_TITLES = {
  profile: 'My Profile',
  doctors: 'Find Doctors',
  appointments: 'My Appointments',
};

export default function PatientDashboard() {
  const [active, setActive] = useState('profile');
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="dashboard">
      <aside className="sidebar">
        <div className="sidebar-brand">MedBook</div>

        <nav className="sidebar-nav">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.key}
              className={`nav-item${active === item.key ? ' active' : ''}`}
              onClick={() => setActive(item.key)}
            >
              {item.label}
            </button>
          ))}
        </nav>

        <button className="sidebar-logout" onClick={handleLogout}>
          Sign Out
        </button>
      </aside>

      <main className="dashboard-main">
        <header className="dashboard-header">
          <h2 className="dashboard-title">{SECTION_TITLES[active]}</h2>
          <div className="header-user">
            <div className="header-avatar">MM</div>
            <span className="header-name">Marko Marković</span>
          </div>
        </header>

        <div className="dashboard-content">
          {active === 'profile' && <PatientProfile />}
          {active === 'doctors' && <DoctorSearch />}
          {active === 'appointments' && <MyAppointments />}
        </div>
      </main>
    </div>
  );
}
