import LoginForm from '../components/LoginForm';

export default function LoginPage() {
  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <div className="logo-icon">M</div>
          <h1>MedBook</h1>
          <p>Your health management system</p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
