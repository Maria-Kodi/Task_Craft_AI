import { useNavigate } from 'react-router-dom';

export default function DashboardPage() {
  const navigate = useNavigate();

  // Read the logged-in user from storage (saved during login)
  const storedUser = localStorage.getItem('user') || sessionStorage.getItem('user');
  const user = storedUser ? JSON.parse(storedUser) : null;

  const handleLogout = () => {
    // Clear both storages to fully log the user out
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#fafbfb] px-6">
      <h1 className="text-2xl font-semibold text-[#1B1E29] font-['Space_Grotesk',sans-serif] mb-2">
        Welcome, {user?.fullName || 'there'}!
      </h1>
      <p className="text-sm text-[#6B6558] mb-8">
        You're logged in as {user?.email}
      </p>
      <button
        onClick={handleLogout}
        className="rounded-md bg-[#101946] py-2.5 px-6 text-sm font-semibold text-[#fafbfb] hover:bg-[#0D1438] transition-colors"
      >
        Logout
      </button>
    </div>
  );
}