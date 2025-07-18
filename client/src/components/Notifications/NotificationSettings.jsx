import React, { useState } from 'react';

const NotificationSettings = ({ 
  soundEnabled, 
  notificationsEnabled,
  onToggleSound,
  onToggleNotifications 
}) => {
  const [showSettings, setShowSettings] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState(
    Notification?.permission || 'default'
  );

  const handleNotificationToggle = async () => {
    if (notificationPermission === 'default') {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);
      onToggleNotifications(permission === 'granted');
    } else {
      onToggleNotifications(!notificationsEnabled);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowSettings(!showSettings)}
        className="p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100"
        title="Notification Settings"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM4 19h1a3 3 0 003-3V8a3 3 0 013-3h3m-6 18v-5z" />
        </svg>
      </button>

      {showSettings && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
          <div className="p-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Notification Settings
            </h3>
            
            <div className="space-y-4">
              {/* Sound Toggle */}
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Sound Notifications
                  </label>
                  <p className="text-xs text-gray-500">
                    Play sound when new messages arrive
                  </p>
                </div>
                <button
                  onClick={onToggleSound}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    soundEnabled ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      soundEnabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* Browser Notification Toggle */}
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Browser Notifications
                  </label>
                  <p className="text-xs text-gray-500">
                    Show desktop notifications
                  </p>
                </div>
                <button
                  onClick={handleNotificationToggle}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    notificationsEnabled ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      notificationsEnabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* Permission Status */}
              <div className="pt-2 border-t border-gray-200">
                <p className="text-xs text-gray-500">
                  Permission Status: 
                  <span className={`ml-1 font-medium ${
                    notificationPermission === 'granted' ? 'text-green-600' :
                    notificationPermission === 'denied' ? 'text-red-600' :
                    'text-yellow-600'
                  }`}>
                    {notificationPermission === 'granted' ? 'Granted' :
                     notificationPermission === 'denied' ? 'Denied' :
                     'Not Requested'}
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationSettings;