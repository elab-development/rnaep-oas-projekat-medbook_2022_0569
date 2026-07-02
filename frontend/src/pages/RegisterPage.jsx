import RegisterForm from '../components/RegisterForm';

export default function RegisterPage() {
  return (
    <div className="auth-page">
      <div className="auth-card auth-card--wide">
        <div className="auth-logo">
          <div className="logo-icon">M</div>
          <h1>MedBook</h1>
          <p>Create your account</p>
        </div>
        <RegisterForm />
      </div>
    </div>
  );
}
