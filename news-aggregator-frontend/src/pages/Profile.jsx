import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
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
  ArrowLeftIcon
} from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';

const Profile = () => {
  const { user, logout } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('profile');
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [profileData, setProfileData] = useState({
    name: 'John Doe',
    email: 'john.doe@example.com',
    bio: 'News enthusiast and tech lover',
    location: 'New York, NY',
    joinDate: 'January 2024'
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const categories = ['Technology', 'General', 'Sports', 'Entertainment', 'Business', 'Health', 'Science'];
  const [preferences, setPreferences] = useState(['Technology', 'Sports']);
  
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

  const handleProfileSave = () => {
    setIsEditingProfile(false);
    // Handle profile update logic here
  };

  const handlePasswordChange = (e) => {
    e.preventDefault();
    // Handle password change logic here
    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
  };

  const togglePreference = (category) => {
    setPreferences(prev => 
      prev.includes(category) 
        ? prev.filter(p => p !== category)
        : [...prev, category]
    );
  };

  const removeSavedArticle = (articleId) => {
    // Handle remove saved article logic here
    console.log('Remove article:', articleId);
  };

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
                {profileData.name}
              </h3>
              <p style={{ color: '#64748b', fontSize: '14px', margin: 0 }}>
                {profileData.email}
              </p>
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
                  <button
                    onClick={() => setIsEditingProfile(!isEditingProfile)}
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
                      cursor: 'pointer'
                    }}
                  >
                    {isEditingProfile ? (
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

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
                      Full Name
                    </label>
                    {isEditingProfile ? (
                      <input
                        type="text"
                        value={profileData.name}
                        onChange={(e) => setProfileData({...profileData, name: e.target.value})}
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
                      <p style={{ padding: '0.75rem 0', color: '#1e293b', margin: 0 }}>{profileData.name}</p>
                    )}
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
                      Email Address
                    </label>
                    {isEditingProfile ? (
                      <input
                        type="email"
                        value={profileData.email}
                        onChange={(e) => setProfileData({...profileData, email: e.target.value})}
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
                      <p style={{ padding: '0.75rem 0', color: '#1e293b', margin: 0 }}>{profileData.email}</p>
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
                          defaultChecked={notification.id === 'breaking' || notification.id === 'daily'}
                          style={{ opacity: 0, width: 0, height: 0 }}
                        />
                        <span style={{
                          position: 'absolute',
                          cursor: 'pointer',
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          backgroundColor: '#ccc',
                          transition: '0.4s',
                          borderRadius: '24px'
                        }}></span>
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