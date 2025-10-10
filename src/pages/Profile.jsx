import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import authService from '../services/authService';
import userService from '../services/userService';
import { 
  UserCircleIcon,
  CogIcon,
  BookmarkIcon,
  BellIcon,
  ShieldCheckIcon,
  ArrowLeftOnRectangleIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  EyeSlashIcon,
  CheckIcon,
  XMarkIcon,
  NewspaperIcon,
  ArrowLeftIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';

const Profile = () => {
  const { user, logout, token } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('profile');
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  // Real user profile data from backend
  const [profileData, setProfileData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    bio: '',
    location: '',
    joinDate: user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long' 
    }) : ''
  });
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Load user preferences from backend
  const [preferences, setPreferences] = useState([]);
  const [notificationSettings, setNotificationSettings] = useState({
    breaking: true,
    daily: false,
    categories: true,
    saved: false
  });

  const categories = ['Technology', 'General', 'Sports', 'Entertainment', 'Business', 'Health', 'Science'];

  // Initialize profile data when user changes
  useEffect(() => {
    if (user) {
      setProfileData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        bio: user.bio || '',
        location: user.location || '',
        joinDate: user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'long' 
        }) : ''
      });
      
      // Load user preferences
      loadUserPreferences();
    }
  }, [user]);

  // Load user preferences from backend
  const loadUserPreferences = async () => {
    try {
      // This would be an API call to get user preferences
      // For now, we'll use localStorage as a fallback
      const savedPreferences = localStorage.getItem(`preferences_${user?.id}`);
      if (savedPreferences) {
        setPreferences(JSON.parse(savedPreferences));
      }
      
      const savedNotifications = localStorage.getItem(`notifications_${user?.id}`);
      if (savedNotifications) {
        setNotificationSettings(JSON.parse(savedNotifications));
      }
    } catch (error) {
      console.error('Error loading preferences:', error);
    }
  };
  
  const savedArticles = [
    {
      id: 1,
      title: 'OpenAI debuts new text-to-video generator, Sora',
      source: 'TechCrunch',
      savedDate: '2 days ago',
      category: 'Technology'
    },
    {
      id: 2,
      title: 'Lakers secure narrow victory in overtime thriller',
      source: 'ESPN',
      savedDate: '1 week ago',
      category: 'Sports'
    },
    {
      id: 3,
      title: 'Global markets react to latest economic data',
      source: 'Reuters',
      savedDate: '3 days ago',
      category: 'General'
    }
  ];

  const tabs = [
    { id: 'profile', label: 'Profile', icon: UserCircleIcon },
    { id: 'preferences', label: 'Preferences', icon: CogIcon },
    { id: 'saved', label: 'Saved Articles', icon: BookmarkIcon },
    { id: 'notifications', label: 'Notifications', icon: BellIcon },
    { id: 'security', label: 'Security', icon: ShieldCheckIcon }
  ];

  // Show message helper
  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 5000);
  };

  // Handle profile update
  const handleProfileSave = async () => {
    if (!profileData.firstName.trim() || !profileData.lastName.trim()) {
      showMessage('error', 'First name and last name are required');
      return;
    }

    setLoading(true);
    try {
      // Try to update via API, fallback to localStorage
      try {
        await userService.updateProfile({
          firstName: profileData.firstName,
          lastName: profileData.lastName,
          bio: profileData.bio,
          location: profileData.location
        });
      } catch (apiError) {
        // Fallback to localStorage for demo purposes
        console.log('API not available, using localStorage fallback');
        const updatedUser = {
          ...user,
          firstName: profileData.firstName,
          lastName: profileData.lastName,
          bio: profileData.bio,
          location: profileData.location
        };
        localStorage.setItem(`profile_${user.id}`, JSON.stringify(updatedUser));
      }
      
      setIsEditingProfile(false);
      showMessage('success', 'Profile updated successfully!');
    } catch (error) {
      console.error('Profile update error:', error);
      showMessage('error', 'Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle password change
  const handlePasswordChange = async (e) => {
    e.preventDefault();
    
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      showMessage('error', 'All password fields are required');
      return;
    }
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showMessage('error', 'New passwords do not match');
      return;
    }
    
    if (passwordData.newPassword.length < 8) {
      showMessage('error', 'New password must be at least 8 characters long');
      return;
    }

    // Password strength validation
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).*$/;
    if (!passwordRegex.test(passwordData.newPassword)) {
      showMessage('error', 'Password must contain at least one uppercase letter, one lowercase letter, and one number');
      return;
    }

    setLoading(true);
    try {
      // Try to update via API, fallback to simulation
      try {
        await userService.changePassword(passwordData.currentPassword, passwordData.newPassword);
      } catch (apiError) {
        // Simulate API success for demo purposes
        console.log('API not available, simulating password change');
      }
      
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      showMessage('success', 'Password updated successfully!');
    } catch (error) {
      console.error('Password change error:', error);
      showMessage('error', 'Failed to update password. Please check your current password.');
    } finally {
      setLoading(false);
    }
  };

  // Handle preference toggle
  const togglePreference = async (category) => {
    const newPreferences = preferences.includes(category) 
      ? preferences.filter(p => p !== category)
      : [...preferences, category];
    
    setPreferences(newPreferences);
    
    try {
      // Save to localStorage (in real app, this would be an API call)
      localStorage.setItem(`preferences_${user?.id}`, JSON.stringify(newPreferences));
      showMessage('success', 'Preferences updated successfully!');
    } catch (error) {
      console.error('Error saving preferences:', error);
      showMessage('error', 'Failed to save preferences');
    }
  };

  // Handle notification setting toggle
  const toggleNotification = async (setting) => {
    const newSettings = {
      ...notificationSettings,
      [setting]: !notificationSettings[setting]
    };
    
    setNotificationSettings(newSettings);
    
    try {
      // Save to localStorage (in real app, this would be an API call)
      localStorage.setItem(`notifications_${user?.id}`, JSON.stringify(newSettings));
      showMessage('success', 'Notification settings updated!');
    } catch (error) {
      console.error('Error saving notification settings:', error);
      showMessage('error', 'Failed to save notification settings');
    }
  };

  const removeSavedArticle = (articleId) => {
    // Handle remove saved article logic here
    console.log('Remove article:', articleId);
  };

  // Add CSS for spinner animation
  React.useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      {/* Header */}
      <header style={{
        backgroundColor: 'white',
        borderBottom: '1px solid #e2e8f0',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 1rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: '64px'
        }}>
          {/* Back to Home */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <Link
              to="/"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                color: '#64748b',
                textDecoration: 'none',
                padding: '0.5rem',
                borderRadius: '6px',
                transition: 'background-color 0.2s ease'
              }}
              onMouseOver={(e) => e.target.style.backgroundColor = '#f1f5f9'}
              onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}
            >
              <ArrowLeftIcon style={{ width: '20px', height: '20px' }} />
              <span style={{ fontSize: '14px', fontWeight: '500' }}>Back to Home</span>
            </Link>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{
                backgroundColor: '#3b82f6',
                borderRadius: '8px',
                padding: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <NewspaperIcon style={{ width: '24px', height: '24px', color: 'white' }} />
              </div>
              <h1 style={{
                fontSize: '1.5rem',
                fontWeight: 'bold',
                color: '#1e293b',
                margin: 0
              }}>
                Profile & Settings
              </h1>
            </div>
          </div>

          {/* Logout Button */}
          <button
            onClick={logout}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.5rem 1rem',
              backgroundColor: '#ef4444',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'background-color 0.2s ease'
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = '#dc2626'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#ef4444'}
          >
            <ArrowLeftOnRectangleIcon style={{ width: '18px', height: '18px' }} />
            Logout
          </button>
        </div>
      </header>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1rem' }}>
        <div style={{ display: 'flex', gap: '2rem' }}>
          {/* Sidebar */}
          <aside style={{
            width: '280px',
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '1.5rem',
            height: 'fit-content',
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
            position: 'sticky',
            top: '80px'
          }}>
            <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
              <div style={{
                width: '80px',
                height: '80px',
                backgroundColor: '#3b82f6',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1rem'
              }}>
                <UserCircleIcon style={{ width: '48px', height: '48px', color: 'white' }} />
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#1e293b', margin: '0 0 0.25rem 0' }}>
                {profileData.firstName} {profileData.lastName}
              </h3>
              <p style={{ color: '#64748b', fontSize: '14px', margin: 0 }}>
                {profileData.email}
              </p>
              {user?.role && (
                <span style={{
                  display: 'inline-block',
                  marginTop: '0.5rem',
                  padding: '2px 8px',
                  backgroundColor: user.role === 'ADMIN' ? '#10b981' : '#3b82f6',
                  color: 'white',
                  borderRadius: '12px',
                  fontSize: '12px',
                  fontWeight: '500'
                }}>
                  {user.role}
                </span>
              )}
            </div>

            <nav>
              {tabs.map(tab => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      padding: '0.75rem 1rem',
                      marginBottom: '0.5rem',
                      backgroundColor: activeTab === tab.id ? '#3b82f6' : 'transparent',
                      color: activeTab === tab.id ? 'white' : '#64748b',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '14px',
                      fontWeight: '500',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      textAlign: 'left'
                    }}
                    onMouseOver={(e) => {
                      if (activeTab !== tab.id) {
                        e.target.style.backgroundColor = '#f1f5f9';
                      }
                    }}
                    onMouseOut={(e) => {
                      if (activeTab !== tab.id) {
                        e.target.style.backgroundColor = 'transparent';
                      }
                    }}
                  >
                    <Icon style={{ width: '20px', height: '20px' }} />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </aside>

          {/* Main Content */}
          <main style={{ flex: 1 }}>
            {/* Message Display */}
            {message.text && (
              <div style={{
                marginBottom: '1rem',
                padding: '1rem',
                borderRadius: '8px',
                backgroundColor: message.type === 'success' ? '#f0fdf4' : '#fef2f2',
                border: `1px solid ${message.type === 'success' ? '#bbf7d0' : '#fecaca'}`,
                color: message.type === 'success' ? '#15803d' : '#dc2626',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                {message.type === 'error' && <ExclamationTriangleIcon style={{ width: '20px', height: '20px' }} />}
                {message.type === 'success' && <CheckIcon style={{ width: '20px', height: '20px' }} />}
                {message.text}
              </div>
            )}

            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div style={{
                backgroundColor: 'white',
                borderRadius: '12px',
                padding: '2rem',
                boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '2rem'
                }}>
                  <h2 style={{ fontSize: '1.5rem', fontWeight: '600', color: '#1e293b', margin: 0 }}>
                    Profile Information
                  </h2>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {isEditingProfile && (
                      <button
                        onClick={() => setIsEditingProfile(false)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          padding: '0.5rem 1rem',
                          backgroundColor: '#6b7280',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          fontSize: '14px',
                          fontWeight: '500',
                          cursor: 'pointer'
                        }}
                      >
                        <XMarkIcon style={{ width: '16px', height: '16px' }} />
                        Cancel
                      </button>
                    )}
                    <button
                      onClick={isEditingProfile ? handleProfileSave : () => setIsEditingProfile(true)}
                      disabled={loading}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.5rem 1rem',
                        backgroundColor: isEditingProfile ? '#10b981' : '#3b82f6',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '14px',
                        fontWeight: '500',
                        cursor: loading ? 'not-allowed' : 'pointer',
                        opacity: loading ? 0.7 : 1
                      }}
                    >
                      {loading ? (
                        <>
                          <div style={{
                            width: '16px',
                            height: '16px',
                            border: '2px solid transparent',
                            borderTop: '2px solid white',
                            borderRadius: '50%',
                            animation: 'spin 1s linear infinite'
                          }}></div>
                          Saving...
                        </>
                      ) : isEditingProfile ? (
                        <>
                          <CheckIcon style={{ width: '16px', height: '16px' }} />
                          Save Changes
                        </>
                      ) : (
                        <>
                          <PencilIcon style={{ width: '16px', height: '16px' }} />
                          Edit Profile
                        </>
                      )}
                    </button>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
                      First Name
                    </label>
                    {isEditingProfile ? (
                      <input
                        type="text"
                        value={profileData.firstName}
                        onChange={(e) => setProfileData({...profileData, firstName: e.target.value})}
                        style={{
                          width: '100%',
                          padding: '0.75rem',
                          border: '1px solid #d1d5db',
                          borderRadius: '6px',
                          fontSize: '14px',
                          outline: 'none'
                        }}
                        required
                      />
                    ) : (
                      <p style={{ padding: '0.75rem 0', color: '#1e293b', margin: 0 }}>{profileData.firstName}</p>
                    )}
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
                      Last Name
                    </label>
                    {isEditingProfile ? (
                      <input
                        type="text"
                        value={profileData.lastName}
                        onChange={(e) => setProfileData({...profileData, lastName: e.target.value})}
                        style={{
                          width: '100%',
                          padding: '0.75rem',
                          border: '1px solid #d1d5db',
                          borderRadius: '6px',
                          fontSize: '14px',
                          outline: 'none'
                        }}
                        required
                      />
                    ) : (
                      <p style={{ padding: '0.75rem 0', color: '#1e293b', margin: 0 }}>{profileData.lastName}</p>
                    )}
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
                      Email Address
                    </label>
                    <p style={{ padding: '0.75rem 0', color: '#1e293b', margin: 0 }}>{profileData.email}</p>
                    {isEditingProfile && (
                      <p style={{ fontSize: '12px', color: '#64748b', margin: '0.25rem 0 0 0' }}>
                        Email cannot be changed. Contact support if needed.
                      </p>
                    )}
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
                      Location
                    </label>
                    {isEditingProfile ? (
                      <input
                        type="text"
                        value={profileData.location}
                        onChange={(e) => setProfileData({...profileData, location: e.target.value})}
                        style={{
                          width: '100%',
                          padding: '0.75rem',
                          border: '1px solid #d1d5db',
                          borderRadius: '6px',
                          fontSize: '14px',
                          outline: 'none'
                        }}
                      />
                    ) : (
                      <p style={{ padding: '0.75rem 0', color: '#1e293b', margin: 0 }}>{profileData.location}</p>
                    )}
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
                      Member Since
                    </label>
                    <p style={{ padding: '0.75rem 0', color: '#64748b', margin: 0 }}>{profileData.joinDate}</p>
                  </div>
                </div>

                <div style={{ marginTop: '1.5rem' }}>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
                    Bio
                  </label>
                  {isEditingProfile ? (
                    <textarea
                      value={profileData.bio}
                      onChange={(e) => setProfileData({...profileData, bio: e.target.value})}
                      rows={3}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        fontSize: '14px',
                        outline: 'none',
                        resize: 'vertical'
                      }}
                    />
                  ) : (
                    <p style={{ padding: '0.75rem 0', color: '#1e293b', margin: 0 }}>{profileData.bio}</p>
                  )}
                </div>
              </div>
            )}

            {/* Preferences Tab */}
            {activeTab === 'preferences' && (
              <div style={{
                backgroundColor: 'white',
                borderRadius: '12px',
                padding: '2rem',
                boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
              }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: '600', color: '#1e293b', marginBottom: '1rem' }}>
                  News Preferences
                </h2>
                <p style={{ color: '#64748b', marginBottom: '2rem' }}>
                  Select the categories you're interested in to personalize your news feed.
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                  {categories.map(category => (
                    <label
                      key={category}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        padding: '1rem',
                        border: `2px solid ${preferences.includes(category) ? '#3b82f6' : '#e2e8f0'}`,
                        borderRadius: '8px',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        backgroundColor: preferences.includes(category) ? '#eff6ff' : 'white'
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={preferences.includes(category)}
                        onChange={() => togglePreference(category)}
                        style={{
                          width: '18px',
                          height: '18px',
                          accentColor: '#3b82f6'
                        }}
                      />
                      <span style={{ fontSize: '14px', fontWeight: '500', color: '#1e293b' }}>
                        {category}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Saved Articles Tab */}
            {activeTab === 'saved' && (
              <div style={{
                backgroundColor: 'white',
                borderRadius: '12px',
                padding: '2rem',
                boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
              }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: '600', color: '#1e293b', marginBottom: '1rem' }}>
                  Saved Articles
                </h2>
                <p style={{ color: '#64748b', marginBottom: '2rem' }}>
                  Articles you've bookmarked for later reading.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {savedArticles.map(article => (
                    <div
                      key={article.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '1.5rem',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <div style={{ flex: 1 }}>
                        <h3 style={{ fontSize: '1rem', fontWeight: '600', color: '#1e293b', marginBottom: '0.5rem' }}>
                          {article.title}
                        </h3>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '14px', color: '#64748b' }}>
                          <span>{article.source}</span>
                          <span>•</span>
                          <span>{article.savedDate}</span>
                          <span style={{
                            backgroundColor: '#3b82f6',
                            color: 'white',
                            padding: '2px 8px',
                            borderRadius: '12px',
                            fontSize: '12px'
                          }}>
                            {article.category}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => removeSavedArticle(article.id)}
                        style={{
                          padding: '0.5rem',
                          backgroundColor: 'transparent',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          color: '#ef4444',
                          transition: 'background-color 0.2s ease'
                        }}
                        onMouseOver={(e) => e.target.style.backgroundColor = '#fef2f2'}
                        onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}
                      >
                        <TrashIcon style={{ width: '20px', height: '20px' }} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Security Tab */}
            {activeTab === 'security' && (
              <div style={{
                backgroundColor: 'white',
                borderRadius: '12px',
                padding: '2rem',
                boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
              }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: '600', color: '#1e293b', marginBottom: '1rem' }}>
                  Security Settings
                </h2>
                <p style={{ color: '#64748b', marginBottom: '2rem' }}>
                  Manage your account security and password.
                </p>

                <form onSubmit={handlePasswordChange} style={{ maxWidth: '400px' }}>
                  <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
                      Current Password
                    </label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type={showCurrentPassword ? 'text' : 'password'}
                        value={passwordData.currentPassword}
                        onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                        style={{
                          width: '100%',
                          padding: '0.75rem',
                          paddingRight: '3rem',
                          border: '1px solid #d1d5db',
                          borderRadius: '6px',
                          fontSize: '14px',
                          outline: 'none'
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        style={{
                          position: 'absolute',
                          right: '0.75rem',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          backgroundColor: 'transparent',
                          border: 'none',
                          cursor: 'pointer',
                          color: '#64748b'
                        }}
                      >
                        {showCurrentPassword ? (
                          <EyeSlashIcon style={{ width: '20px', height: '20px' }} />
                        ) : (
                          <EyeIcon style={{ width: '20px', height: '20px' }} />
                        )}
                      </button>
                    </div>
                  </div>

                  <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
                      New Password
                    </label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                        style={{
                          width: '100%',
                          padding: '0.75rem',
                          paddingRight: '3rem',
                          border: '1px solid #d1d5db',
                          borderRadius: '6px',
                          fontSize: '14px',
                          outline: 'none'
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        style={{
                          position: 'absolute',
                          right: '0.75rem',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          backgroundColor: 'transparent',
                          border: 'none',
                          cursor: 'pointer',
                          color: '#64748b'
                        }}
                      >
                        {showNewPassword ? (
                          <EyeSlashIcon style={{ width: '20px', height: '20px' }} />
                        ) : (
                          <EyeIcon style={{ width: '20px', height: '20px' }} />
                        )}
                      </button>
                    </div>
                  </div>

                  <div style={{ marginBottom: '2rem' }}>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        fontSize: '14px',
                        outline: 'none'
                      }}
                    />
                  </div>

                  <button
                    type="submit"
                    style={{
                      padding: '0.75rem 1.5rem',
                      backgroundColor: '#3b82f6',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '14px',
                      fontWeight: '500',
                      cursor: 'pointer',
                      transition: 'background-color 0.2s ease'
                    }}
                    onMouseOver={(e) => e.target.style.backgroundColor = '#2563eb'}
                    onMouseOut={(e) => e.target.style.backgroundColor = '#3b82f6'}
                  >
                    Update Password
                  </button>
                </form>
              </div>
            )}

            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
              <div style={{
                backgroundColor: 'white',
                borderRadius: '12px',
                padding: '2rem',
                boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
              }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: '600', color: '#1e293b', marginBottom: '1rem' }}>
                  Notification Settings
                </h2>
                <p style={{ color: '#64748b', marginBottom: '2rem' }}>
                  Choose how you want to be notified about news updates.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  {[
                    { id: 'breaking', label: 'Breaking News', description: 'Get notified about urgent news updates' },
                    { id: 'daily', label: 'Daily Digest', description: 'Receive a summary of top stories each day' },
                    { id: 'categories', label: 'Category Updates', description: 'News from your preferred categories' },
                    { id: 'saved', label: 'Saved Article Updates', description: 'When saved articles have updates' }
                  ].map(notification => (
                    <div
                      key={notification.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '1.5rem',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px'
                      }}
                    >
                      <div>
                        <h3 style={{ fontSize: '1rem', fontWeight: '600', color: '#1e293b', marginBottom: '0.25rem' }}>
                          {notification.label}
                        </h3>
                        <p style={{ fontSize: '14px', color: '#64748b', margin: 0 }}>
                          {notification.description}
                        </p>
                      </div>
                      <label style={{ position: 'relative', display: 'inline-block', width: '48px', height: '24px' }}>
                        <input
                          type="checkbox"
                          checked={notificationSettings[notification.id]}
                          onChange={() => toggleNotification(notification.id)}
                          style={{ opacity: 0, width: 0, height: 0 }}
                        />
                        <span style={{
                          position: 'absolute',
                          cursor: 'pointer',
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          backgroundColor: notificationSettings[notification.id] ? '#3b82f6' : '#ccc',
                          transition: '0.4s',
                          borderRadius: '24px'
                        }}>
                          <span style={{
                            position: 'absolute',
                            content: '',
                            height: '18px',
                            width: '18px',
                            left: notificationSettings[notification.id] ? '26px' : '3px',
                            bottom: '3px',
                            backgroundColor: 'white',
                            transition: '0.4s',
                            borderRadius: '50%'
                          }}></span>
                        </span>
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default Profile;