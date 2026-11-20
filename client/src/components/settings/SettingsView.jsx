import React, { useState, useEffect } from 'react';
import {
  User,
  Shield,
  Sliders,
  Users,
  CreditCard,
  Lock,
  Check,
  CheckCircle2,
  HardDrive,
  Sparkles,
  Download,
  Trash2,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useWorkspace } from '../../context/WorkspaceContext';
import { useTheme } from '../../context/ThemeContext';
import { useToast } from '../../context/ToastContext';
import Button from '../common/Button';
import Input from '../common/Input';
import { Badge } from '../common/Badge';
import { Avatar } from '../common/Avatar';
import Modal from '../common/Modal';
import api from '../../services/api';

export const SettingsView = ({ initialTab = 'profile' }) => {
  const [activeTab, setActiveTab] = useState(initialTab);
  const { user, updateProfile } = useAuth();
  const { workspace, refreshData } = useWorkspace();
  const { theme, setTheme } = useTheme();
  const { showToast } = useToast();

  // Profile form
  const [name, setName] = useState(user?.name || 'Alex Vance');
  const [bio, setBio] = useState(user?.bio || 'VP of Product & Lead Architect at Docora');
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Security form
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [twoFactor, setTwoFactor] = useState(false);

  // Workspace form
  const [wsName, setWsName] = useState(workspace?.name || 'Acme Product Workspace');
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('editor');

  // Billing & Plans
  const [billingData, setBillingData] = useState(null);
  const [billingCycle, setBillingCycle] = useState('monthly'); // 'monthly' | 'yearly'
  const [selectedPlanId, setSelectedPlanId] = useState(workspace?.plan || 'pro');

  useEffect(() => {
    api.getBilling().then((res) => {
      setBillingData(res);
      setSelectedPlanId(res.currentPlan?.id || 'pro');
    });
  }, []);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setIsSavingProfile(true);
    try {
      await updateProfile({ name, bio });
      showToast('Profile updated successfully', 'success');
    } catch (err) {
      showToast('Failed to update profile', 'error');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      showToast('New passwords do not match', 'error');
      return;
    }
    setIsSavingPassword(true);
    try {
      await api.changePassword({ currentPassword, newPassword });
      showToast('Password updated successfully', 'success');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      showToast(err.message || 'Failed to update password', 'error');
    } finally {
      setIsSavingPassword(false);
    }
  };

  const handleInviteSubmit = async (e) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;
    try {
      await api.inviteMember({ email: inviteEmail.trim(), role: inviteRole });
      showToast(`Invitation sent to ${inviteEmail}`, 'success');
      setInviteEmail('');
      setInviteModalOpen(false);
      refreshData();
    } catch (err) {
      showToast(err.message || 'Failed to send invite', 'error');
    }
  };

  const handlePlanUpgrade = async (planId) => {
    try {
      await api.updatePlan(planId);
      setSelectedPlanId(planId);
      showToast(`Workspace plan updated to ${planId.toUpperCase()}`, 'success');
      refreshData();
    } catch (err) {
      showToast('Failed to update plan', 'error');
    }
  };

  const tabs = [
    { id: 'profile', label: 'My Profile', icon: <User className="w-4 h-4" /> },
    { id: 'security', label: 'Security & 2FA', icon: <Shield className="w-4 h-4" /> },
    { id: 'preferences', label: 'Preferences', icon: <Sliders className="w-4 h-4" /> },
    { id: 'workspace', label: 'Workspace & Team', icon: <Users className="w-4 h-4" /> },
    { id: 'billing', label: 'SaaS Billing & Plans', icon: <CreditCard className="w-4 h-4" /> },
  ];

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-xl font-bold text-[#242039] dark:text-[#F1EFFF]">
          Workspace Settings
        </h1>
        <p className="text-xs text-[#77738B] dark:text-[#A39EBC] mt-0.5">
          Manage your account profile, workspace security, team members, and billing subscription.
        </p>
      </div>

      {/* Tabs Row */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-[#EAE8F0] dark:border-[#282440]">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === tab.id
                ? 'bg-[#F0EDFF] text-[#7657E8] dark:bg-[#7657E8]/20 dark:text-[#A78BFA]'
                : 'text-[#77738B] hover:text-[#242039] dark:hover:text-[#F1EFFF] hover:bg-[#F8F7FF] dark:hover:bg-[#1E1B2E]'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab 1: Profile */}
      {activeTab === 'profile' && (
        <form onSubmit={handleProfileSubmit} className="space-y-6 max-w-xl">
          <div className="p-6 rounded-2xl bg-white dark:bg-[#191728] border border-[#EAE8F0] dark:border-[#282440] shadow-subtle space-y-4">
            <div className="flex items-center gap-4">
              <Avatar src={user?.avatar} name={name} size="lg" />
              <div>
                <h3 className="font-semibold text-sm text-[#242039] dark:text-[#F1EFFF]">
                  {user?.name || 'Alex Vance'}
                </h3>
                <p className="text-xs text-[#77738B] dark:text-[#A39EBC]">{user?.email}</p>
              </div>
            </div>

            <Input
              label="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />

            <div>
              <label className="text-xs font-semibold text-[#77738B] dark:text-[#A39EBC] uppercase tracking-wider block mb-1.5">
                Bio / Role
              </label>
              <textarea
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full rounded-lg border border-[#EAE8F0] dark:border-[#282440] bg-white dark:bg-[#191728] text-xs p-3 text-[#242039] dark:text-[#F1EFFF] focus:outline-none focus:border-[#7657E8]"
              />
            </div>

            <div className="pt-2 flex justify-end">
              <Button type="submit" variant="primary" isLoading={isSavingProfile}>
                Save Changes
              </Button>
            </div>
          </div>
        </form>
      )}

      {/* Tab 2: Security */}
      {activeTab === 'security' && (
        <div className="space-y-6 max-w-xl">
          {/* Password update */}
          <form
            onSubmit={handlePasswordSubmit}
            className="p-6 rounded-2xl bg-white dark:bg-[#191728] border border-[#EAE8F0] dark:border-[#282440] shadow-subtle space-y-4"
          >
            <h3 className="font-semibold text-sm text-[#242039] dark:text-[#F1EFFF]">
              Change Password
            </h3>
            <Input
              type="password"
              label="Current Password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
            />
            <Input
              type="password"
              label="New Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
            <Input
              type="password"
              label="Confirm New Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            <div className="flex justify-end pt-2">
              <Button type="submit" variant="primary" isLoading={isSavingPassword}>
                Update Password
              </Button>
            </div>
          </form>

          {/* 2FA Card */}
          <div className="p-6 rounded-2xl bg-white dark:bg-[#191728] border border-[#EAE8F0] dark:border-[#282440] shadow-subtle flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-sm text-[#242039] dark:text-[#F1EFFF]">
                Two-Factor Authentication (2FA)
              </h3>
              <p className="text-xs text-[#77738B] dark:text-[#A39EBC] mt-0.5">
                Protect your document workspace with multi-factor authentication.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setTwoFactor(!twoFactor);
                showToast(twoFactor ? '2FA disabled' : '2FA activated', 'info');
              }}
              className={`w-11 h-6 rounded-full transition-colors relative ${
                twoFactor ? 'bg-[#7657E8]' : 'bg-gray-300 dark:bg-[#282440]'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform transform ${
                  twoFactor ? 'translate-x-5' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>
        </div>
      )}

      {/* Tab 3: Preferences */}
      {activeTab === 'preferences' && (
        <div className="p-6 rounded-2xl bg-white dark:bg-[#191728] border border-[#EAE8F0] dark:border-[#282440] shadow-subtle max-w-xl space-y-6">
          <h3 className="font-semibold text-sm text-[#242039] dark:text-[#F1EFFF]">
            Appearance & Workspace Preferences
          </h3>

          <div>
            <label className="text-xs font-semibold text-[#77738B] dark:text-[#A39EBC] uppercase tracking-wider block mb-2">
              Application Theme
            </label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { id: 'light', label: 'Light Theme' },
                { id: 'dark', label: 'Dark Studio' },
                { id: 'system', label: 'System Sync' },
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => {
                    setTheme(t.id);
                    showToast(`Theme switched to ${t.label}`, 'info');
                  }}
                  className={`p-3 rounded-xl border text-xs font-semibold text-center transition-all ${
                    theme === t.id
                      ? 'border-[#7657E8] bg-[#F0EDFF] text-[#7657E8] dark:bg-[#7657E8]/20 dark:text-[#A78BFA] shadow-subtle'
                      : 'border-[#EAE8F0] dark:border-[#282440] text-[#77738B]'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Workspace Members */}
      {activeTab === 'workspace' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-[#191728] border border-[#EAE8F0] dark:border-[#282440] shadow-subtle space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-sm text-[#242039] dark:text-[#F1EFFF]">
                  {workspace?.name || 'Acme Product Workspace'}
                </h3>
                <p className="text-xs text-[#77738B] dark:text-[#A39EBC] mt-0.5">
                  Plan: <span className="capitalize font-semibold text-[#7657E8]">{workspace?.plan || 'Pro'}</span> • {(workspace?.members || []).length} active collaborators
                </p>
              </div>
              <Button
                variant="primary"
                size="sm"
                onClick={() => setInviteModalOpen(true)}
              >
                Invite Member
              </Button>
            </div>

            {/* Members table */}
            <div className="divide-y divide-[#EAE8F0] dark:divide-[#282440] pt-2">
              {(workspace?.members || []).map((member) => (
                <div key={member.userId} className="py-3 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <Avatar src={member.avatar} name={member.name} size="sm" />
                    <div>
                      <div className="font-semibold text-[#242039] dark:text-[#F1EFFF]">
                        {member.name}
                      </div>
                      <div className="text-[11px] text-[#77738B]">{member.email}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <select
                      value={member.role}
                      onChange={(e) => {
                        api.updateMemberRole(member.userId, e.target.value);
                        showToast(`Role updated to ${e.target.value}`, 'success');
                        refreshData();
                      }}
                      className="py-1 px-2.5 rounded-lg border border-[#EAE8F0] dark:border-[#282440] bg-[#F8F7FF] dark:bg-[#1C1A2E] text-xs capitalize"
                    >
                      <option value="owner">Owner</option>
                      <option value="admin">Admin</option>
                      <option value="editor">Editor</option>
                      <option value="commenter">Commenter</option>
                      <option value="viewer">Viewer</option>
                    </select>

                    {member.role !== 'owner' && (
                      <button
                        onClick={async () => {
                          if (window.confirm(`Remove ${member.name}?`)) {
                            await api.removeMember(member.userId);
                            showToast('Member removed', 'info');
                            refreshData();
                          }
                        }}
                        className="text-gray-400 hover:text-rose-500 p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 5: SaaS Billing & Plans */}
      {activeTab === 'billing' && (
        <div className="space-y-6">
          {/* Billing Cycle Switcher */}
          <div className="flex items-center justify-center gap-3">
            <span className={`text-xs font-semibold ${billingCycle === 'monthly' ? 'text-[#7657E8]' : 'text-[#77738B]'}`}>
              Billed Monthly
            </span>
            <button
              onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly')}
              className={`w-11 h-6 rounded-full transition-colors relative ${
                billingCycle === 'yearly' ? 'bg-[#7657E8]' : 'bg-gray-300 dark:bg-[#282440]'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform transform ${
                  billingCycle === 'yearly' ? 'translate-x-5' : 'translate-x-0.5'
                }`}
              />
            </button>
            <span className={`text-xs font-semibold ${billingCycle === 'yearly' ? 'text-[#7657E8]' : 'text-[#77738B]'}`}>
              Billed Annually <Badge variant="success" size="xs">Save 20%</Badge>
            </span>
          </div>

          {/* Plans Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Free */}
            <div
              className={`p-6 rounded-2xl bg-white dark:bg-[#191728] border transition-all flex flex-col justify-between ${
                selectedPlanId === 'free'
                  ? 'border-[#7657E8] ring-2 ring-[#7657E8]/20 shadow-premium'
                  : 'border-[#EAE8F0] dark:border-[#282440]'
              }`}
            >
              <div>
                <h3 className="font-bold text-base text-[#242039] dark:text-[#F1EFFF]">Starter</h3>
                <div className="text-2xl font-bold mt-2 text-[#242039] dark:text-[#F1EFFF]">$0</div>
                <p className="text-xs text-[#77738B] mt-1">Free forever for individuals</p>
                <ul className="space-y-2 mt-6 text-xs text-[#5B5675] dark:text-[#B6B1CE]">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#7657E8]" /> Up to 3 workspace members
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#7657E8]" /> 2 GB cloud storage
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#7657E8]" /> Real-time collaborative editor
                  </li>
                </ul>
              </div>

              <Button
                variant={selectedPlanId === 'free' ? 'secondary' : 'outline'}
                size="sm"
                className="mt-6 w-full"
                onClick={() => handlePlanUpgrade('free')}
                disabled={selectedPlanId === 'free'}
              >
                {selectedPlanId === 'free' ? 'Current Plan' : 'Downgrade to Starter'}
              </Button>
            </div>

            {/* Pro */}
            <div
              className={`p-6 rounded-2xl bg-white dark:bg-[#191728] border relative transition-all flex flex-col justify-between ${
                selectedPlanId === 'pro'
                  ? 'border-[#7657E8] ring-2 ring-[#7657E8]/30 shadow-premium'
                  : 'border-[#EAE8F0] dark:border-[#282440]'
              }`}
            >
              <div className="absolute -top-3 right-6">
                <Badge variant="default" size="xs">
                  Most Popular
                </Badge>
              </div>
              <div>
                <h3 className="font-bold text-base text-[#7657E8]">Pro Collaborator</h3>
                <div className="text-2xl font-bold mt-2 text-[#242039] dark:text-[#F1EFFF]">
                  ${billingCycle === 'monthly' ? '12' : '10'}
                  <span className="text-xs text-[#77738B] font-normal"> / user / month</span>
                </div>
                <p className="text-xs text-[#77738B] mt-1">For high-velocity product teams</p>
                <ul className="space-y-2 mt-6 text-xs text-[#5B5675] dark:text-[#B6B1CE]">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#7657E8]" /> Up to 15 workspace members
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#7657E8]" /> 20 GB cloud storage
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#7657E8]" /> Integrated AI writing & chat suite
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#7657E8]" /> Version history rollback
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#7657E8]" /> Password-protected sharing links
                  </li>
                </ul>
              </div>

              <Button
                variant={selectedPlanId === 'pro' ? 'secondary' : 'primary'}
                size="sm"
                className="mt-6 w-full"
                onClick={() => handlePlanUpgrade('pro')}
                disabled={selectedPlanId === 'pro'}
              >
                {selectedPlanId === 'pro' ? 'Current Plan' : 'Upgrade to Pro'}
              </Button>
            </div>

            {/* Business */}
            <div
              className={`p-6 rounded-2xl bg-white dark:bg-[#191728] border transition-all flex flex-col justify-between ${
                selectedPlanId === 'business'
                  ? 'border-[#7657E8] ring-2 ring-[#7657E8]/20 shadow-premium'
                  : 'border-[#EAE8F0] dark:border-[#282440]'
              }`}
            >
              <div>
                <h3 className="font-bold text-base text-[#242039] dark:text-[#F1EFFF]">Enterprise</h3>
                <div className="text-2xl font-bold mt-2 text-[#242039] dark:text-[#F1EFFF]">
                  ${billingCycle === 'monthly' ? '39' : '32'}
                  <span className="text-xs text-[#77738B] font-normal"> / user / month</span>
                </div>
                <p className="text-xs text-[#77738B] mt-1">Scale with dedicated governance</p>
                <ul className="space-y-2 mt-6 text-xs text-[#5B5675] dark:text-[#B6B1CE]">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#7657E8]" /> Unlimited team members
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#7657E8]" /> 100 GB cloud storage
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#7657E8]" /> Unlimited AI assistant usage
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#7657E8]" /> SAML SSO & custom RBAC
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#7657E8]" /> 99.9% Uptime SLA
                  </li>
                </ul>
              </div>

              <Button
                variant={selectedPlanId === 'business' ? 'secondary' : 'outline'}
                size="sm"
                className="mt-6 w-full"
                onClick={() => handlePlanUpgrade('business')}
                disabled={selectedPlanId === 'business'}
              >
                {selectedPlanId === 'business' ? 'Current Plan' : 'Upgrade to Enterprise'}
              </Button>
            </div>
          </div>

          {/* Invoices History */}
          <div className="p-6 rounded-2xl bg-white dark:bg-[#191728] border border-[#EAE8F0] dark:border-[#282440] shadow-subtle space-y-3">
            <h3 className="font-semibold text-sm text-[#242039] dark:text-[#F1EFFF]">
              Invoice History
            </h3>
            <div className="divide-y divide-[#EAE8F0] dark:divide-[#282440]">
              {(billingData?.invoices || []).map((inv) => (
                <div key={inv.id} className="py-2.5 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-semibold text-[#242039] dark:text-[#F1EFFF]">
                      {inv.plan}
                    </span>
                    <span className="text-[11px] text-[#77738B] block">{inv.date}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-semibold">{inv.amount}</span>
                    <Badge variant="success" size="xs">
                      {inv.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Invite Member Modal */}
      <Modal
        isOpen={inviteModalOpen}
        onClose={() => setInviteModalOpen(false)}
        title="Invite New Collaborator"
        description="Collaborators will receive access to your team workspace."
      >
        <form onSubmit={handleInviteSubmit} className="space-y-4">
          <Input
            type="email"
            label="Email Address"
            placeholder="colleague@acme.inc"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            required
            autoFocus
          />

          <div>
            <label className="text-xs font-semibold text-[#77738B] dark:text-[#A39EBC] uppercase tracking-wider block mb-1.5">
              Workspace Role
            </label>
            <select
              value={inviteRole}
              onChange={(e) => setInviteRole(e.target.value)}
              className="w-full py-2 px-3 rounded-lg border border-[#EAE8F0] dark:border-[#282440] bg-white dark:bg-[#191728] text-xs text-[#242039] dark:text-[#F1EFFF] focus:outline-none"
            >
              <option value="editor">Editor — Can edit and create documents</option>
              <option value="commenter">Commenter — Can review and leave comments</option>
              <option value="viewer">Viewer — Read-only access</option>
              <option value="admin">Admin — Full workspace management</option>
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-[#EAE8F0] dark:border-[#282440]">
            <Button variant="ghost" onClick={() => setInviteModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Send Invitation
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default SettingsView;
