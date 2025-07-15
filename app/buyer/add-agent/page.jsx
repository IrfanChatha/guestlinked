'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getSupabase } from '@/lib/supabaseClient';

export default function AddAgent() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const router = useRouter();

  const [formData, setFormData] = useState({
    agentName: '',
    agentEmail: '',
    tempPassword: ''
  });

  useEffect(() => {
    const checkUser = async () => {
      const supabase = getSupabase();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push('/');
        return;
      }

      // Fetch user settings to verify role
      const { data: settings, error: settingsError } = await supabase
        .from('users_settings_tb')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (settingsError || !settings) {
        console.error('Error fetching user settings:', settingsError);
        router.push('/');
        return;
      }

      // Only buyers can add agents
      if (settings.role !== 'Buyer') {
        if (settings.role === 'Seller') {
          router.push('/seller/seller-dashboard');
        } else if (settings.role === 'Agent') {
          router.push('/agent/dashboard');
        } else {
          router.push('/dashboard');
        }
        return;
      }

      setUser(user);
      setLoading(false);
    };

    checkUser();
  }, [router]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const generateTempPassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData(prev => ({
      ...prev,
      tempPassword: password
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.agentName.trim()) {
      setMessage('Agent name is required');
      return;
    }

    if (!formData.agentEmail.trim()) {
      setMessage('Agent email is required');
      return;
    }

    if (!formData.tempPassword.trim()) {
      setMessage('Please generate a temporary password');
      return;
    }

    setSubmitting(true);
    setMessage('');

    try {
      // Call the invite agent API
      const response = await fetch('/api/invite-agent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          agentName: formData.agentName,
          agentEmail: formData.agentEmail,
          tempPassword: formData.tempPassword,
          buyerUserId: user.id
        }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setMessage('Agent invitation sent successfully! They can now log in with the provided credentials.');
        setFormData({
          agentName: '',
          agentEmail: '',
          tempPassword: ''
        });
        
        // Redirect to agents list after 3 seconds
        setTimeout(() => {
          router.push('/buyer/agents');
        }, 3000);
      } else {
        setMessage(result.error || 'Failed to send agent invitation');
      }
    } catch (error) {
      console.error('Error inviting agent:', error);
      setMessage('An error occurred while sending the invitation');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <button
              onClick={() => router.back()}
              className="text-blue-400 hover:text-blue-300 transition-colors duration-200 mb-4"
            >
              ← Back
            </button>
            <h1 className="text-3xl font-bold mb-2">Add New Agent</h1>
            <p className="text-gray-400">
              Create a new agent account that will have access to your websites and orders.
            </p>
          </div>

          <div className="bg-gray-800 rounded-lg p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="agentName" className="block text-sm font-medium text-gray-300 mb-2">
                  Agent Name *
                </label>
                <input
                  type="text"
                  id="agentName"
                  name="agentName"
                  value={formData.agentName}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter agent's full name"
                  required
                />
              </div>

              <div>
                <label htmlFor="agentEmail" className="block text-sm font-medium text-gray-300 mb-2">
                  Agent Email *
                </label>
                <input
                  type="email"
                  id="agentEmail"
                  name="agentEmail"
                  value={formData.agentEmail}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter agent's email address"
                  required
                />
              </div>

              <div>
                <label htmlFor="tempPassword" className="block text-sm font-medium text-gray-300 mb-2">
                  Temporary Password *
                </label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    id="tempPassword"
                    name="tempPassword"
                    value={formData.tempPassword}
                    onChange={handleInputChange}
                    className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Generate or enter temporary password"
                    required
                  />
                  <button
                    type="button"
                    onClick={generateTempPassword}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors duration-200"
                  >
                    Generate
                  </button>
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  The agent will need to change this password on first login
                </p>
              </div>

              {message && (
                <div className={`p-3 rounded-md ${
                  message.includes('successfully') || message.includes('sent') 
                    ? 'bg-green-900 text-green-300' 
                    : 'bg-red-900 text-red-300'
                }`}>
                  {message}
                </div>
              )}

              <div className="flex space-x-4">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white py-2 px-4 rounded-md transition-colors duration-200"
                >
                  {submitting ? 'Sending Invitation...' : 'Send Agent Invitation'}
                </button>
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md transition-colors duration-200"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>

          <div className="mt-8 bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Agent Access</h2>
            <div className="space-y-2 text-gray-300">
              <p>• Agents will have access to all your websites and orders</p>
              <p>• They can browse and place orders on your behalf</p>
              <p>• They cannot modify your account settings or add other agents</p>
              <p>• You can revoke agent access at any time</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 