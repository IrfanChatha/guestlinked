'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getSupabase } from '@/lib/supabaseClient';

export default function AgentsList() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [agents, setAgents] = useState([]);
  const [agentsLoading, setAgentsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const router = useRouter();

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

      // Only buyers can access this page
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
      fetchAgents(user.id);
    };

    checkUser();
  }, [router]);

  const fetchAgents = async (buyerId) => {
    setAgentsLoading(true);
    try {
      const supabase = getSupabase();
      const { data: agentsData, error } = await supabase
        .from('users_settings_tb')
        .select('*')
        .eq('parent_buyer_id', buyerId)
        .eq('role', 'Agent')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching agents:', error);
        setMessage('Error loading agents');
      } else {
        setAgents(agentsData || []);
      }
    } catch (error) {
      console.error('Error in fetchAgents:', error);
      setMessage('Error loading agents');
    } finally {
      setAgentsLoading(false);
    }
  };

  const handleDeleteAgent = async (agentId, agentName) => {
    if (!confirm(`Are you sure you want to remove agent "${agentName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      // Call API to delete agent
      const response = await fetch('/api/delete-agent', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ agentId }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setMessage('Agent removed successfully');
        fetchAgents(user.id); // Refresh the list
      } else {
        setMessage(result.error || 'Failed to remove agent');
      }
    } catch (error) {
      console.error('Error removing agent:', error);
      setMessage('An error occurred while removing the agent');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <button
                onClick={() => router.back()}
                className="text-blue-400 hover:text-blue-300 transition-colors duration-200 mb-4"
              >
                ← Back
              </button>
              <h1 className="text-3xl font-bold mb-2">My Agents</h1>
              <p className="text-gray-400">
                Manage agents who can access your websites and place orders on your behalf.
              </p>
            </div>
            <button
              onClick={() => router.push('/buyer/add-agent')}
              className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg font-medium transition-colors duration-200"
            >
              Add New Agent
            </button>
          </div>

          {message && (
            <div className={`mb-6 p-4 rounded-lg ${
              message.includes('successfully') 
                ? 'bg-green-900 text-green-300' 
                : 'bg-red-900 text-red-300'
            }`}>
              {message}
            </div>
          )}

          <div className="bg-gray-800 rounded-lg p-6">
            {agentsLoading ? (
              <div className="text-center py-8">
                <div className="text-gray-400">Loading agents...</div>
              </div>
            ) : agents.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">No agents found</div>
                <p className="text-gray-500 mb-6">
                  You haven't added any agents yet. Agents can help you manage your orders and browse websites.
                </p>
                <button
                  onClick={() => router.push('/buyer/add-agent')}
                  className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg font-medium transition-colors duration-200"
                >
                  Add Your First Agent
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">
                    {agents.length} Agent{agents.length !== 1 ? 's' : ''}
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {agents.map((agent) => (
                    <div key={agent.user_id} className="bg-gray-700 rounded-lg p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                            <span className="text-white font-semibold">
                              {agent.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <h3 className="font-semibold">{agent.name}</h3>
                            <p className="text-sm text-gray-400">{agent.email}</p>
                          </div>
                        </div>
                        <span className="bg-green-900 text-green-300 px-2 py-1 rounded text-xs">
                          Active
                        </span>
                      </div>

                      <div className="space-y-2 text-sm text-gray-300 mb-4">
                        <div className="flex justify-between">
                          <span>Role:</span>
                          <span className="text-blue-400">{agent.role}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Added:</span>
                          <span>{formatDate(agent.created_at)}</span>
                        </div>
                      </div>

                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleDeleteAgent(agent.user_id, agent.name)}
                          className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-md transition-colors duration-200 text-sm"
                        >
                          Remove Agent
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="mt-8 bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Agent Permissions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-medium text-green-400 mb-2">What Agents Can Do:</h3>
                <ul className="space-y-1 text-sm text-gray-300">
                  <li>• View all your websites</li>
                  <li>• Browse available websites</li>
                  <li>• Place orders on your behalf</li>
                  <li>• View existing orders</li>
                  <li>• Access buyer dashboard features</li>
                </ul>
              </div>
              <div>
                <h3 className="font-medium text-red-400 mb-2">What Agents Cannot Do:</h3>
                <ul className="space-y-1 text-sm text-gray-300">
                  <li>• Modify account settings</li>
                  <li>• Add or remove other agents</li>
                  <li>• Access billing information</li>
                  <li>• Change passwords</li>
                  <li>• Delete your account</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 