import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '../api/axios';
import BrandMark from '../components/BrandMark';

function SectionLabel({ children, dark }) {
  return (
    <span
      className={`text-[11px] font-medium tracking-[0.18em] uppercase font-['IBM_Plex_Mono',monospace] ${
        dark ? 'text-[#7C82B8]' : 'text-[#6B6558]'
      }`}
    >
      {children}
    </span>
  );
}

function formatMemberSince(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '';
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

export default function SettingsPage() {
  const [profile, setProfile] = useState(null);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  const [deleteConfirming, setDeleteConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await api.get('/users/me');
      const user = response.data?.user || response.data;
      if (user) {
        setProfile(user);
        setFullName(user.fullName || '');
        setEmail(user.email || '');
      }
    } catch (err) {
      console.error('Failed to load profile:', err);
      toast.error('Could not load your profile');
    }
  };

  const initials = (fullName || 'U')
    .trim()
    .split(' ')
    .filter(Boolean)
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    navigate('/login');
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);

    try {
      const response = await api.put('/users/me', { fullName, email });
      const updatedUser = response.data?.user || response.data;

      setProfile(updatedUser);

      // Синхронізація оновлених даних користувача в активному сховищі
      if (localStorage.getItem('user')) {
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }
      if (sessionStorage.getItem('user')) {
        sessionStorage.setItem('user', JSON.stringify(updatedUser));
      }

      toast.success('Profile updated');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not update profile');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordError('');

    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords don't match");
      return;
    }
    if (newPassword.length < 8) {
      setPasswordError('New password must be at least 8 characters');
      return;
    }

    setSavingPassword(true);
    try {
      await api.put('/users/me/password', { currentPassword, newPassword });
      toast.success('Password updated');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setPasswordError(err.response?.data?.message || 'Could not update password');
    } finally {
      setSavingPassword(false);
    }
  };

  const handleDeleteAccount = async () => {
    setDeleting(true);
    try {
      await api.delete('/users/me');
      toast.success('Account deleted');
      localStorage.clear();
      sessionStorage.clear();
      navigate('/register');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not delete account');
      setDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fafbfb]">
      {/* Dark hero band */}
      <div className="relative bg-[#0B1130] overflow-hidden">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              'linear-gradient(#7C82B8 1px, transparent 1px), linear-gradient(90deg, #7C82B8 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />

        <header className="relative px-4 sm:px-8 py-5 flex items-center justify-between border-b border-white/10">
          <div className="flex items-center gap-6">
            <BrandMark theme="dark" />
            <Link
              to="/dashboard"
              className="flex items-center gap-1.5 text-[13px] font-medium text-white/60 hover:text-white transition-colors"
            >
              <svg viewBox="0 0 12 12" width="10" height="10" fill="none">
                <path d="M7.5 2.5L3.5 6l4 3.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Back to workspace
            </Link>
          </div>

          <button
            onClick={handleLogout}
            className="text-[13px] font-medium text-white border border-white/20 rounded-md px-4 py-2 hover:bg-white/10 transition-colors"
          >
            Sign out
          </button>
        </header>

        <div className="relative max-w-2xl mx-auto px-8 pt-10 pb-12">
          <p className="text-[28px] text-white font-['Space_Grotesk',sans-serif] tracking-tight mb-1">
            Account settings
          </p>
          <p className="text-[13.5px] text-[#A8AEC8]">
            Manage your profile, password, and account preferences.
          </p>
        </div>
      </div>

      {/* Light workspace */}
      <div className="bg-gradient-to-b from-[#EEF0F9] to-[#fafbfb]">
        <main className="max-w-2xl mx-auto px-8 py-12 space-y-8">
          {/* Profile card */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="bg-white rounded-xl border border-[#1B1E29]/8 shadow-[0_1px_2px_rgba(16,25,70,0.04)] p-6"
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 rounded-full bg-[#7C82B8]/15 border border-[#7C82B8]/30 flex items-center justify-center shrink-0">
                <span className="text-[18px] font-semibold text-[#101946] font-['Space_Grotesk',sans-serif]">
                  {initials}
                </span>
              </div>
              <div>
                <SectionLabel>Profile</SectionLabel>
                {profile?.createdAt && (
                  <p className="text-[12px] text-[#6B6558] mt-1">
                    Member since {formatMemberSince(profile.createdAt)}
                  </p>
                )}
              </div>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="block text-[10px] font-medium tracking-[0.15em] text-[#6B6558] uppercase font-['IBM_Plex_Mono',monospace] mb-1.5">
                  Full name
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full border border-[#1B1E29]/10 rounded-md px-3 py-2.5 text-[14px] text-[#1B1E29] bg-[#fafbfb] focus:outline-none focus:border-[#7C82B8] transition-colors"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-medium tracking-[0.15em] text-[#6B6558] uppercase font-['IBM_Plex_Mono',monospace] mb-1.5">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full border border-[#1B1E29]/10 rounded-md px-3 py-2.5 text-[14px] text-[#1B1E29] bg-[#fafbfb] focus:outline-none focus:border-[#7C82B8] transition-colors"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={savingProfile}
                className="rounded-md bg-[#101946] py-2.5 px-6 text-[13px] font-semibold text-[#fafbfb] hover:bg-[#0D1438] transition-colors disabled:opacity-50"
              >
                {savingProfile ? 'Saving…' : 'Save changes'}
              </button>
            </form>
          </motion.div>

          {/* Password card */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: 0.05 }}
            className="bg-white rounded-xl border border-[#1B1E29]/8 shadow-[0_1px_2px_rgba(16,25,70,0.04)] p-6"
          >
            <SectionLabel>Password</SectionLabel>

            <form onSubmit={handleChangePassword} className="mt-4 space-y-4">
              <div>
                <label className="block text-[10px] font-medium tracking-[0.15em] text-[#6B6558] uppercase font-['IBM_Plex_Mono',monospace] mb-1.5">
                  Current password
                </label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full border border-[#1B1E29]/10 rounded-md px-3 py-2.5 text-[14px] text-[#1B1E29] bg-[#fafbfb] focus:outline-none focus:border-[#7C82B8] transition-colors"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-medium tracking-[0.15em] text-[#6B6558] uppercase font-['IBM_Plex_Mono',monospace] mb-1.5">
                    New password
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    minLength={8}
                    className="w-full border border-[#1B1E29]/10 rounded-md px-3 py-2.5 text-[14px] text-[#1B1E29] bg-[#fafbfb] focus:outline-none focus:border-[#7C82B8] transition-colors"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-medium tracking-[0.15em] text-[#6B6558] uppercase font-['IBM_Plex_Mono',monospace] mb-1.5">
                    Confirm new password
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    minLength={8}
                    className="w-full border border-[#1B1E29]/10 rounded-md px-3 py-2.5 text-[14px] text-[#1B1E29] bg-[#fafbfb] focus:outline-none focus:border-[#7C82B8] transition-colors"
                    required
                  />
                </div>
              </div>

              {passwordError && <p className="text-[13px] text-red-600">{passwordError}</p>}

              <button
                type="submit"
                disabled={savingPassword}
                className="rounded-md bg-[#101946] py-2.5 px-6 text-[13px] font-semibold text-[#fafbfb] hover:bg-[#0D1438] transition-colors disabled:opacity-50"
              >
                {savingPassword ? 'Updating…' : 'Update password'}
              </button>
            </form>
          </motion.div>

          {/* Danger zone */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: 0.1 }}
            className="bg-white rounded-xl border border-[#C4544A]/25 shadow-[0_1px_2px_rgba(16,25,70,0.04)] p-6"
          >
            <span className="text-[11px] font-medium tracking-[0.18em] uppercase font-['IBM_Plex_Mono',monospace] text-[#C4544A]">
              Danger zone
            </span>
            <p className="mt-2 text-[13px] text-[#6B6558] leading-relaxed">
              Deleting your account permanently removes your profile and every task you've created. This cannot be undone.
            </p>

            {!deleteConfirming ? (
              <button
                onClick={() => setDeleteConfirming(true)}
                className="mt-4 text-[13px] font-medium text-[#C4544A] border border-[#C4544A]/30 rounded-md px-4 py-2 hover:bg-[#C4544A]/5 transition-colors"
              >
                Delete account
              </button>
            ) : (
              <div className="mt-4 flex items-center gap-3">
                <button
                  onClick={handleDeleteAccount}
                  disabled={deleting}
                  className="text-[13px] font-semibold text-white bg-[#C4544A] rounded-md px-4 py-2 hover:bg-[#A8433A] transition-colors disabled:opacity-50"
                >
                  {deleting ? 'Deleting…' : 'Yes, permanently delete'}
                </button>
                <button
                  onClick={() => setDeleteConfirming(false)}
                  disabled={deleting}
                  className="text-[13px] font-medium text-[#6B6558] hover:text-[#1B1E29] transition-colors"
                >
                  Cancel
                </button>
              </div>
            )}
          </motion.div>
        </main>
      </div>
    </div>
  );
}