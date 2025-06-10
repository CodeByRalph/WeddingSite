'use client'

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaUsers, FaUserFriends, FaCalendarCheck, FaPhone, FaSync, FaChevronDown, FaChevronUp } from 'react-icons/fa';

interface RSVPData {
  inviteCode: string;
  primaryGuest: {
    name: string;
    phone: string;
  };
  additionalGuests: string[];
  submittedAt: string;
  totalGuests: number;
}

interface Summary {
  totalFamilies: number;
  totalGuests: number;
  lastUpdated: string;
}

interface APIResponse {
  success: boolean;
  data: RSVPData[];
  summary: Summary;
  error?: string;
}

export default function Dashboard() {
  const [rsvpData, setRsvpData] = useState<RSVPData[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [expandedFamilies, setExpandedFamilies] = useState<Set<string>>(new Set());

  const fetchRSVPData = async (showRefreshing = false) => {
    try {
      if (showRefreshing) setRefreshing(true);
      setError(null);
      
      const response = await fetch('/api/rsvp-data', {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: APIResponse = await response.json();

      if (data.success) {
        setRsvpData(data.data);
        setSummary(data.summary);
      } else {
        throw new Error(data.error || 'Failed to fetch RSVP data');
      }
    } catch (err) {
      console.error('Failed to fetch RSVP data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load RSVP data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchRSVPData();
  }, []);

  const handleRefresh = () => {
    fetchRSVPData(true);
  };

  const toggleFamilyExpansion = (inviteCode: string) => {
    setExpandedFamilies(prev => {
      const newSet = new Set(prev);
      if (newSet.has(inviteCode)) {
        newSet.delete(inviteCode);
      } else {
        newSet.add(inviteCode);
      }
      return newSet;
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatPhone = (phone: string) => {
    const cleaned = phone.replace(/\D/g, '');
    const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
    if (match) {
      return '(' + match[1] + ') ' + match[2] + '-' + match[3];
    }
    return phone;
  };

  if (loading) {
    return (
      <div className="min-h-[100svh] bg-gradient-to-br from-sky-50 via-white to-sky-50 flex items-center justify-center">
        <motion.div 
          className="text-center"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <motion.div
            className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-sky-400 to-sky-500 rounded-full flex items-center justify-center"
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          >
            <FaUsers className="text-white text-2xl" />
          </motion.div>
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">Loading Dashboard...</h2>
          <p className="text-gray-600">Fetching RSVP data</p>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[100svh] bg-gradient-to-br from-sky-50 via-white to-sky-50 flex items-center justify-center p-6">
        <motion.div 
          className="text-center max-w-md mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
            <FaUsers className="text-red-500 text-2xl" />
          </div>
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">Unable to Load Data</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={handleRefresh}
            className="bg-gradient-to-r from-sky-400 to-sky-500 text-white px-6 py-3 rounded-xl font-semibold hover:from-sky-500 hover:to-sky-600 transition-all duration-200 flex items-center gap-2 mx-auto"
          >
            <FaSync className="text-sm" />
            Try Again
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-[100svh] bg-gradient-to-br from-sky-50 via-white to-sky-50 relative">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div 
          className="absolute -top-8 -right-8 w-40 h-40 bg-gradient-to-br from-sky-200/30 to-sky-300/30 rounded-full blur-3xl"
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.6, 0.3]
          }}
          transition={{ 
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div 
          className="absolute -bottom-8 -left-8 w-48 h-48 bg-gradient-to-tr from-blue-200/30 to-blue-300/30 rounded-full blur-3xl"
          animate={{ 
            scale: [1, 1.3, 1],
            opacity: [0.3, 0.5, 0.3]
          }}
          transition={{ 
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12 relative">
        {/* Header */}
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <motion.h1 
            className="text-5xl sm:text-6xl font-bold mb-6 bg-gradient-to-r from-sky-600 to-blue-600 bg-clip-text text-transparent font-serif"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            Wedding Dashboard
          </motion.h1>
          
          <motion.div 
            className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-600 mb-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            {summary && (
              <>
                <span>Last updated: {formatDate(summary.lastUpdated)}</span>
                <button
                  onClick={handleRefresh}
                  disabled={refreshing}
                  className="flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-lg border border-gray-200 hover:bg-white transition-all duration-200 disabled:opacity-50"
                >
                  <FaSync className={`text-xs ${refreshing ? 'animate-spin' : ''}`} />
                  {refreshing ? 'Refreshing...' : 'Refresh'}
                </button>
              </>
            )}
          </motion.div>
        </motion.div>

        {/* Summary Cards */}
        {summary && (
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg p-6 text-center">
              <div className="w-12 h-12 mx-auto mb-4 bg-gradient-to-r from-green-400 to-green-500 rounded-xl flex items-center justify-center">
                <FaCalendarCheck className="text-white text-xl" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-1">{summary.totalFamilies}</h3>
              <p className="text-gray-600">Families RSVPed</p>
            </div>

            <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg p-6 text-center">
              <div className="w-12 h-12 mx-auto mb-4 bg-gradient-to-r from-blue-400 to-blue-500 rounded-xl flex items-center justify-center">
                <FaUsers className="text-white text-xl" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-1">{summary.totalGuests}</h3>
              <p className="text-gray-600">Total Guests</p>
            </div>

            <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg p-6 text-center">
              <div className="w-12 h-12 mx-auto mb-4 bg-gradient-to-r from-purple-400 to-purple-500 rounded-xl flex items-center justify-center">
                <FaUserFriends className="text-white text-xl" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-1">
                {summary.totalGuests > 0 ? (summary.totalGuests / summary.totalFamilies).toFixed(1) : '0'}
              </h3>
              <p className="text-gray-600">Avg. Party Size</p>
            </div>
          </motion.div>
        )}

        {/* RSVP List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Guest Families</h2>
          
          {rsvpData.length === 0 ? (
            <div className="text-center py-20 bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <FaUsers className="text-gray-400 text-2xl" />
              </div>
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No RSVPs Yet</h3>
              <p className="text-gray-500">Waiting for guests to respond to invitations.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {rsvpData.map((family, index) => (
                <motion.div
                  key={family.inviteCode}
                  className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg overflow-hidden"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <div 
                    className="p-6 cursor-pointer hover:bg-white/90 transition-colors duration-200"
                    onClick={() => toggleFamilyExpansion(family.inviteCode)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-sky-400 to-sky-500 rounded-xl flex items-center justify-center text-white font-bold">
                          {family.totalGuests}
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-800">
                            {family.primaryGuest.name}
                          </h3>
                          <p className="text-gray-500 text-sm">
                            Code: {family.inviteCode} • {formatDate(family.submittedAt)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-gray-600 text-sm">
                          {family.totalGuests} guest{family.totalGuests !== 1 ? 's' : ''}
                        </span>
                        {expandedFamilies.has(family.inviteCode) ? (
                          <FaChevronUp className="text-gray-400" />
                        ) : (
                          <FaChevronDown className="text-gray-400" />
                        )}
                      </div>
                    </div>
                  </div>

                  {expandedFamilies.has(family.inviteCode) && (
                    <motion.div
                      className="border-t border-gray-200 p-6 bg-gray-50/50"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                    >
                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <h4 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                            <FaUsers className="text-sky-500" />
                            Primary Guest
                          </h4>
                          <div className="space-y-2">
                            <p className="text-gray-800">{family.primaryGuest.name}</p>
                            <p className="text-gray-600 flex items-center gap-2">
                              <FaPhone className="text-xs" />
                              {formatPhone(family.primaryGuest.phone)}
                            </p>
                          </div>
                        </div>

                        {family.additionalGuests.length > 0 && (
                          <div>
                            <h4 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                              <FaUserFriends className="text-blue-500" />
                              Additional Guests ({family.additionalGuests.length})
                            </h4>
                            <div className="space-y-1">
                              {family.additionalGuests.map((guest, guestIndex) => (
                                <p key={guestIndex} className="text-gray-600">
                                  {guest}
                                </p>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
} 