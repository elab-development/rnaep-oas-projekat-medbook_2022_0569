import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AdminUsers from '../components/admin/AdminUsers';
import AdminRegisterForm from '../components/admin/AdminRegisterForm';

const NAV_ITEMS = [
  { key: 'users', label: 'Users' },
  { key: 'create-admin', label: 'Create Admin' },
];

const SECTION_TITLES = {
  users: 'User Management',
  'create-admin': 'Create Admin',
};

export default function AdminDashboard() {
  const [active, setActive] = useState('users');
  const [refreshKey, setRefreshKey] = useState(0);
  const { user, logout } = useAuth();
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
            <div className="header-avatar">
              {user?.name?.[0]}{user?.surname?.[0]}
            </div>
            <span className="header-name">{user?.name} {user?.surname}</span>
          </div>
        </header>

        <div className="dashboard-content">
          {active === 'users' && <AdminUsers key={refreshKey} />}
          {active === 'create-admin' && (
            <AdminRegisterForm onCreated={() => setRefreshKey((k) => k + 1)} />
          )}
        </div>
      </main>
    </div>
  );
}
