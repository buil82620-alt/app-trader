import LoginHeader from './LoginHeader';
import WelcomeSection from './WelcomeSection';
import LoginForm from './LoginForm';

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gray-900">
      <LoginHeader />
      <WelcomeSection />
      <LoginForm />
    </div>
  );
}
