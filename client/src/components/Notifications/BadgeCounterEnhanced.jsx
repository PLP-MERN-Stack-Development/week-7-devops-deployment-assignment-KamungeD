import React from 'react';

const BadgeCounter = ({ count, variant = 'default', size = 'sm', className = '' }) => {
  if (!count || count <= 0) return null;

  const variants = {
    default: 'bg-red-500 text-white',
    success: 'bg-green-500 text-white',
    warning: 'bg-yellow-500 text-white',
    info: 'bg-blue-500 text-white',
    purple: 'bg-purple-500 text-white',
    pink: 'bg-pink-500 text-white',
    gradient: 'bg-gradient-to-r from-red-500 to-pink-500 text-white'
  };

  const sizes = {
    xs: 'w-3 h-3 text-xs',
    sm: 'w-5 h-5 text-xs',
    md: 'w-6 h-6 text-sm',
    lg: 'w-8 h-8 text-base'
  };

  const displayCount = count > 99 ? '99+' : count.toString();

  return (
    <div
      className={`
        ${variants[variant]} 
        ${sizes[size]}
        rounded-full 
        flex 
        items-center 
        justify-center 
        font-bold 
        shadow-lg 
        border-2 
        border-white
        transform 
        transition-all 
        duration-200 
        hover:scale-110
        ${className}
      `}
    >
      <span>
        {displayCount}
      </span>
    </div>
  );
};

// Enhanced variant with pulse animation
export const PulseBadgeCounter = ({ count, variant = 'default', size = 'sm', className = '' }) => {
  if (!count || count <= 0) return null;

  const variants = {
    default: 'bg-red-500 text-white',
    success: 'bg-green-500 text-white',
    warning: 'bg-yellow-500 text-white',
    info: 'bg-blue-500 text-white',
    purple: 'bg-purple-500 text-white',
    pink: 'bg-pink-500 text-white',
    gradient: 'bg-gradient-to-r from-red-500 to-pink-500 text-white'
  };

  const sizes = {
    xs: 'w-3 h-3 text-xs',
    sm: 'w-5 h-5 text-xs',
    md: 'w-6 h-6 text-sm',
    lg: 'w-8 h-8 text-base'
  };

  const displayCount = count > 99 ? '99+' : count.toString();

  return (
    <div className="relative">
      <div
        className={`
          ${variants[variant]} 
          ${sizes[size]}
          rounded-full 
          flex 
          items-center 
          justify-center 
          font-bold 
          shadow-lg 
          border-2 
          border-white
          animate-pulse
          transform 
          transition-all 
          duration-200 
          hover:scale-110
          ${className}
        `}
      >
        <span>
          {displayCount}
        </span>
      </div>
      
      {/* Pulse ring effect */}
      <div 
        className={`
          absolute 
          inset-0 
          rounded-full 
          ${variants[variant]}
          animate-ping 
          opacity-75
        `}
      />
    </div>
  );
};

// Floating badge with bounce animation
export const FloatingBadgeCounter = ({ count, variant = 'default', size = 'sm', className = '' }) => {
  if (!count || count <= 0) return null;

  const variants = {
    default: 'bg-red-500 text-white',
    success: 'bg-green-500 text-white',
    warning: 'bg-yellow-500 text-white',
    info: 'bg-blue-500 text-white',
    purple: 'bg-purple-500 text-white',
    pink: 'bg-pink-500 text-white',
    gradient: 'bg-gradient-to-r from-red-500 to-pink-500 text-white'
  };

  const sizes = {
    xs: 'w-3 h-3 text-xs',
    sm: 'w-5 h-5 text-xs',
    md: 'w-6 h-6 text-sm',
    lg: 'w-8 h-8 text-base'
  };

  const displayCount = count > 99 ? '99+' : count.toString();

  return (
    <div
      className={`
        ${variants[variant]} 
        ${sizes[size]}
        rounded-full 
        flex 
        items-center 
        justify-center 
        font-bold 
        shadow-lg 
        border-2 
        border-white
        cursor-pointer
        transform 
        transition-all 
        duration-200 
        hover:scale-110
        ${className}
      `}
    >
      <span>
        {displayCount}
      </span>
    </div>
  );
};

// Badge with custom icon
export const IconBadgeCounter = ({ 
  count, 
  icon, 
  variant = 'default', 
  size = 'sm', 
  className = '',
  showZero = false 
}) => {
  if (!showZero && (!count || count <= 0)) return null;

  const variants = {
    default: 'bg-red-500 text-white',
    success: 'bg-green-500 text-white',
    warning: 'bg-yellow-500 text-white',
    info: 'bg-blue-500 text-white',
    purple: 'bg-purple-500 text-white',
    pink: 'bg-pink-500 text-white',
    gradient: 'bg-gradient-to-r from-red-500 to-pink-500 text-white'
  };

  const sizes = {
    xs: 'w-4 h-4 text-xs',
    sm: 'w-6 h-6 text-xs',
    md: 'w-8 h-8 text-sm',
    lg: 'w-10 h-10 text-base'
  };

  const displayCount = count > 99 ? '99+' : count.toString();

  return (
    <div className="relative inline-block">
      {icon}
      <div
        className={`
          absolute 
          -top-2 
          -right-2 
          ${variants[variant]} 
          ${sizes[size]}
          rounded-full 
          flex 
          items-center 
          justify-center 
          font-bold 
          shadow-lg 
          border-2 
          border-white
          transform 
          transition-all 
          duration-200 
          hover:scale-110
          ${className}
        `}
      >
        <span>
          {displayCount}
        </span>
      </div>
    </div>
  );
};

export default BadgeCounter;
