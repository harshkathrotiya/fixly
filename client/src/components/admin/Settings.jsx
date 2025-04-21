import React, { useState, useEffect } from 'react';
import AdminLayout from './AdminLayout';
import axios from 'axios';

const Settings = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [activeTab, setActiveTab] = useState('general');

  // General settings
  const [siteName, setSiteName] = useState('');
  const [siteDescription, setSiteDescription] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [logo, setLogo] = useState(null);
  const [currentLogo, setCurrentLogo] = useState('');

  // Commission settings
  const [commissionRate, setCommissionRate] = useState(10);
  const [minimumPayout, setMinimumPayout] = useState(50);
  const [payoutSchedule, setPayoutSchedule] = useState('monthly');

  // Notification settings
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(false);
  const [pushNotifications, setPushNotifications] = useState(true);

  // Security settings
  const [requireEmailVerification, setRequireEmailVerification] = useState(true);
  const [requirePhoneVerification, setRequirePhoneVerification] = useState(false);
  const [requireProviderDocuments, setRequireProviderDocuments] = useState(true);
  const [maintenanceMode, setMaintenanceMode] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/admin/settings', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });

      const settings = response.data.data;

      // General settings
      setSiteName(settings.general?.siteName || 'Fixly');
      setSiteDescription(settings.general?.siteDescription || '');
      setContactEmail(settings.general?.contactEmail || '');
      setContactPhone(settings.general?.contactPhone || '');
      setCurrentLogo(settings.general?.logo || '');

      // Commission settings
      setCommissionRate(settings.commission?.rate || 10);
      setMinimumPayout(settings.commission?.minimumPayout || 50);
      setPayoutSchedule(settings.commission?.payoutSchedule || 'monthly');

      // Notification settings
      setEmailNotifications(settings.notifications?.email || true);
      setSmsNotifications(settings.notifications?.sms || false);
      setPushNotifications(settings.notifications?.push || true);

      // Security settings
      setRequireEmailVerification(settings.security?.requireEmailVerification || true);
      setRequirePhoneVerification(settings.security?.requirePhoneVerification || false);
      setRequireProviderDocuments(settings.security?.requireProviderDocuments || true);
      setMaintenanceMode(settings.security?.maintenanceMode || false);

      setLoading(false);
    } catch (err) {
      console.error('Error fetching settings:', err);
      setError('Failed to load settings');
      setLoading(false);
    }
  };

  const handleLogoChange = (e) => {
    if (e.target.files[0]) {
      setLogo(e.target.files[0]);
    }
  };

  const saveGeneralSettings = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError(null);

      const formData = new FormData();
      formData.append('siteName', siteName);
      formData.append('siteDescription', siteDescription);
      formData.append('contactEmail', contactEmail);
      formData.append('contactPhone', contactPhone);

      if (logo) {
        formData.append('logo', logo);
      }

      await axios.put('/api/admin/settings/general', formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      setSuccess('General settings updated successfully');
      setSaving(false);

      // Refresh settings
      fetchSettings();

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
    } catch (err) {
      console.error('Error saving general settings:', err);
      setError(err.response?.data?.message || 'Failed to update general settings');
      setSaving(false);
    }
  };

  const saveCommissionSettings = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError(null);

      await axios.put('/api/admin/settings/commission', {
        rate: commissionRate,
        minimumPayout,
        payoutSchedule
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });

      setSuccess('Commission settings updated successfully');
      setSaving(false);

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
    } catch (err) {
      console.error('Error saving commission settings:', err);
      setError(err.response?.data?.message || 'Failed to update commission settings');
      setSaving(false);
    }
  };

  const saveNotificationSettings = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError(null);

      await axios.put('/api/admin/settings/notifications', {
        email: emailNotifications,
        sms: smsNotifications,
        push: pushNotifications
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });

      setSuccess('Notification settings updated successfully');
      setSaving(false);

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
    } catch (err) {
      console.error('Error saving notification settings:', err);
      setError(err.response?.data?.message || 'Failed to update notification settings');
      setSaving(false);
    }
  };

  const saveSecuritySettings = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError(null);

      await axios.put('/api/admin/settings/security', {
        requireEmailVerification,
        requirePhoneVerification,
        requireProviderDocuments,
        maintenanceMode
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });

      setSuccess('Security settings updated successfully');
      setSaving(false);

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
    } catch (err) {
      console.error('Error saving security settings:', err);
      setError(err.response?.data?.message || 'Failed to update security settings');
      setSaving(false);
    }
  };

  return (
    <AdminLayout>
      <div>
        <h1 className="text-2xl font-semibold mb-6">System Settings</h1>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-md mb-6">
          <div className="flex overflow-x-auto">
            <button
              onClick={() => setActiveTab('general')}
              className={`px-4 py-3 text-sm font-medium ${
                activeTab === 'general'
                  ? 'border-b-2 border-primary text-primary'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              General
            </button>
            <button
              onClick={() => setActiveTab('commission')}
              className={`px-4 py-3 text-sm font-medium ${
                activeTab === 'commission'
                  ? 'border-b-2 border-primary text-primary'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Commission
            </button>
            <button
              onClick={() => setActiveTab('notifications')}
              className={`px-4 py-3 text-sm font-medium ${
                activeTab === 'notifications'
                  ? 'border-b-2 border-primary text-primary'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Notifications
            </button>
            <button
              onClick={() => setActiveTab('security')}
              className={`px-4 py-3 text-sm font-medium ${
                activeTab === 'security'
                  ? 'border-b-2 border-primary text-primary'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Security
            </button>
          </div>
        </div>

        {/* Settings content */}
        <div className="bg-white rounded-lg shadow-md p-6">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : (
            <>
              {error && (
                <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-md">
                  {error}
                </div>
              )}

              {success && (
                <div className="mb-4 p-4 bg-green-100 text-green-700 rounded-md">
                  {success}
                </div>
              )}

              {/* General Settings */}
              {activeTab === 'general' && (
                <form onSubmit={saveGeneralSettings}>
                  <h2 className="text-lg font-medium mb-4">General Settings</h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Site Name
                      </label>
                      <input
                        type="text"
                        value={siteName}
                        onChange={(e) => setSiteName(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Contact Email
                      </label>
                      <input
                        type="email"
                        value={contactEmail}
                        onChange={(e) => setContactEmail(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Contact Phone
                      </label>
                      <input
                        type="text"
                        value={contactPhone}
                        onChange={(e) => setContactPhone(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Site Logo
                      </label>
                      <div className="flex items-center">
                        {currentLogo && (
                          <div className="mr-4">
                            <img src={currentLogo} alt="Logo" className="h-12 w-auto" />
                          </div>
                        )}
                        <input
                          type="file"
                          onChange={handleLogoChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                          accept="image/*"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Site Description
                    </label>
                    <textarea
                      value={siteDescription}
                      onChange={(e) => setSiteDescription(e.target.value)}
                      rows="4"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    ></textarea>
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={saving}
                      className={`px-4 py-2 rounded-md ${
                        saving
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          : 'bg-primary text-white hover:bg-primary-dark'
                      }`}
                    >
                      {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </form>
              )}

              {/* Commission Settings */}
              {activeTab === 'commission' && (
                <form onSubmit={saveCommissionSettings}>
                  <h2 className="text-lg font-medium mb-4">Commission Settings</h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Commission Rate (%)
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="0.1"
                        value={commissionRate}
                        onChange={(e) => setCommissionRate(parseFloat(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Minimum Payout Amount ($)
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="1"
                        value={minimumPayout}
                        onChange={(e) => setMinimumPayout(parseInt(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Payout Schedule
                      </label>
                      <select
                        value={payoutSchedule}
                        onChange={(e) => setPayoutSchedule(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                      >
                        <option value="weekly">Weekly</option>
                        <option value="biweekly">Bi-weekly</option>
                        <option value="monthly">Monthly</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={saving}
                      className={`px-4 py-2 rounded-md ${
                        saving
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          : 'bg-primary text-white hover:bg-primary-dark'
                      }`}
                    >
                      {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </form>
              )}

              {/* Notification Settings */}
              {activeTab === 'notifications' && (
                <form onSubmit={saveNotificationSettings}>
                  <h2 className="text-lg font-medium mb-4">Notification Settings</h2>

                  <div className="space-y-4 mb-6">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="emailNotifications"
                        checked={emailNotifications}
                        onChange={(e) => setEmailNotifications(e.target.checked)}
                        className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                      />
                      <label htmlFor="emailNotifications" className="ml-2 block text-sm text-gray-700">
                        Enable Email Notifications
                      </label>
                    </div>

                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="smsNotifications"
                        checked={smsNotifications}
                        onChange={(e) => setSmsNotifications(e.target.checked)}
                        className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                      />
                      <label htmlFor="smsNotifications" className="ml-2 block text-sm text-gray-700">
                        Enable SMS Notifications
                      </label>
                    </div>

                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="pushNotifications"
                        checked={pushNotifications}
                        onChange={(e) => setPushNotifications(e.target.checked)}
                        className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                      />
                      <label htmlFor="pushNotifications" className="ml-2 block text-sm text-gray-700">
                        Enable Push Notifications
                      </label>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={saving}
                      className={`px-4 py-2 rounded-md ${
                        saving
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          : 'bg-primary text-white hover:bg-primary-dark'
                      }`}
                    >
                      {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </form>
              )}

              {/* Security Settings */}
              {activeTab === 'security' && (
                <form onSubmit={saveSecuritySettings}>
                  <h2 className="text-lg font-medium mb-4">Security Settings</h2>

                  <div className="space-y-4 mb-6">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="requireEmailVerification"
                        checked={requireEmailVerification}
                        onChange={(e) => setRequireEmailVerification(e.target.checked)}
                        className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                      />
                      <label htmlFor="requireEmailVerification" className="ml-2 block text-sm text-gray-700">
                        Require Email Verification for New Users
                      </label>
                    </div>

                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="requirePhoneVerification"
                        checked={requirePhoneVerification}
                        onChange={(e) => setRequirePhoneVerification(e.target.checked)}
                        className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                      />
                      <label htmlFor="requirePhoneVerification" className="ml-2 block text-sm text-gray-700">
                        Require Phone Verification for New Users
                      </label>
                    </div>

                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="requireProviderDocuments"
                        checked={requireProviderDocuments}
                        onChange={(e) => setRequireProviderDocuments(e.target.checked)}
                        className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                      />
                      <label htmlFor="requireProviderDocuments" className="ml-2 block text-sm text-gray-700">
                        Require Document Verification for Service Providers
                      </label>
                    </div>

                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="maintenanceMode"
                        checked={maintenanceMode}
                        onChange={(e) => setMaintenanceMode(e.target.checked)}
                        className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                      />
                      <label htmlFor="maintenanceMode" className="ml-2 block text-sm text-gray-700">
                        Enable Maintenance Mode
                      </label>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={saving}
                      className={`px-4 py-2 rounded-md ${
                        saving
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          : 'bg-primary text-white hover:bg-primary-dark'
                      }`}
                    >
                      {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </form>
              )}
            </>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default Settings;