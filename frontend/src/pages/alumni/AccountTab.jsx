import { useState } from 'react';
import { KeyRound, AtSign, CheckCircle2, AlertCircle } from 'lucide-react';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';

export default function AccountTab() {
  const { user, logout } = useAuth();

  const [usernameForm, setUsernameForm] = useState({ username: user?.username || '' });
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [userMsg, setUserMsg] = useState(null);
  const [passMsg, setPassMsg] = useState(null);
  const [userSaving, setUserSaving] = useState(false);
  const [passSaving, setPassSaving] = useState(false);

  async function handleUsernameChange(e) {
    e.preventDefault();
    setUserMsg(null);
    setUserSaving(true);
    try {
      await api.patch('/alumni/me/account/username', usernameForm);
      setUserMsg({ type: 'success', text: 'Username updated. Please log in again.' });
      setTimeout(() => logout(), 1500);
    } catch (err) {
      setUserMsg({ type: 'error', text: err.response?.data?.message || 'Failed to update username.' });
    } finally {
      setUserSaving(false);
    }
  }

  async function handlePasswordChange(e) {
    e.preventDefault();
    setPassMsg(null);
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPassMsg({ type: 'error', text: 'New passwords do not match.' });
      return;
    }
    setPassSaving(true);
    try {
      await api.patch('/alumni/me/account/password', passwordForm);
      setPassMsg({ type: 'success', text: 'Password updated successfully. Please log in again.' });
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => logout(), 1500);
    } catch (err) {
      setPassMsg({ type: 'error', text: err.response?.data?.message || 'Failed to update password.' });
    } finally {
      setPassSaving(false);
    }
  }

  return (
    <div className="space-y-6">

      {/* Change Username */}
      <form onSubmit={handleUsernameChange} className="card space-y-4">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-brand-50 p-2.5 text-brand-700"><AtSign className="h-5 w-5" /></div>
          <div>
            <h3 className="font-semibold text-slate-800">Change Username</h3>
            <p className="text-sm text-slate-500">Update your login username.</p>
          </div>
        </div>

        <Msg msg={userMsg} />

        <div>
          <label className="label-text">New Username</label>
          <input
            className="input-field max-w-sm"
            value={usernameForm.username}
            onChange={(e) => setUsernameForm({ username: e.target.value })}
          />
        </div>
        <button type="submit" disabled={userSaving} className="btn-primary">
          {userSaving ? 'Saving…' : 'Update Username'}
        </button>
      </form>

      {/* Change Password */}
      <form onSubmit={handlePasswordChange} className="card space-y-4">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-brand-50 p-2.5 text-brand-700"><KeyRound className="h-5 w-5" /></div>
          <div>
            <h3 className="font-semibold text-slate-800">Change Password</h3>
            <p className="text-sm text-slate-500">Use a strong password you don't use elsewhere.</p>
          </div>
        </div>

        <Msg msg={passMsg} />

        <div className="grid sm:grid-cols-2 gap-4 max-w-lg">
          <div className="sm:col-span-2">
            <label className="label-text">Current Password</label>
            <input type="password" className="input-field" value={passwordForm.currentPassword} onChange={(e) => setPasswordForm((f) => ({ ...f, currentPassword: e.target.value }))} />
          </div>
          <div>
            <label className="label-text">New Password</label>
            <input type="password" className="input-field" value={passwordForm.newPassword} onChange={(e) => setPasswordForm((f) => ({ ...f, newPassword: e.target.value }))} />
          </div>
          <div>
            <label className="label-text">Confirm New Password</label>
            <input type="password" className="input-field" value={passwordForm.confirmPassword} onChange={(e) => setPasswordForm((f) => ({ ...f, confirmPassword: e.target.value }))} />
          </div>
        </div>
        <button type="submit" disabled={passSaving} className="btn-primary">
          {passSaving ? 'Saving…' : 'Update Password'}
        </button>
      </form>
    </div>
  );
}

function Msg({ msg }) {
  if (!msg) return null;
  return (
    <div className={`flex items-start gap-2 rounded-xl border px-3.5 py-3 text-sm ${
      msg.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-rose-50 border-rose-200 text-rose-700'
    }`}>
      {msg.type === 'success' ? <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0" /> : <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />}
      <span>{msg.text}</span>
    </div>
  );
}
