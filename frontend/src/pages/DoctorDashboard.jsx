import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import DoctorProfile from '../components/doctor/DoctorProfile';
import DoctorSchedule from '../components/doctor/DoctorSchedule';
import DoctorAppointments from '../components/doctor/DoctorAppointments';

const NAV = [
  { key: 'profile',      label: 'My Profile' },
  { key: 'schedule',     label: 'My Schedule' },
  { key: 'appointments', label: 'Appointments' },
];

const TITLES = {
  profile:      'My Profile',
  schedule:     'My Schedule',
  appointments: 'Appointments',
};

export default function DoctorDashboard() {
  const [active, setActive] = useState('profile');
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <div className="dashboard">
      <aside className="sidebar">
        <div className="sidebar-brand">MedBook</div>

        <nav className="sidebar-nav">
          {NAV.map((item) => (
            <button
              key={item.key}
              className={`nav-item${active === item.key ? ' active' : ''}`}
              onClick={() => setActive(item.key)}
            >
              {item.label}
            </button>
          ))}
        </nav>

        <button className="sidebar-logout" onClick={handleLogout}>Sign Out</button>
      </aside>

      <main className="dashboard-main">
        <header className="dashboard-header">
          <h2 className="dashboard-title">{TITLES[active]}</h2>
          <div className="header-user">
            <div className="header-avatar" style={{ background: '#0f766e' }}>AP</div>
            <span className="header-name">Dr. Ana Petrović</span>
          </div>
        </header>

        <div className="dashboard-content">
          {active === 'profile'      && <DoctorProfile />}
          {active === 'schedule'     && <DoctorSchedule />}
          {active === 'appointments' && <DoctorAppointments />}
        </div>
      </main>
    </div>
  );
}
