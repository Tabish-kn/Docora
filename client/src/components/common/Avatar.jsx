import React from 'react';

export const Avatar = ({
  src,
  name = 'User',
  size = 'md',
  status,
  className = '',
}) => {
  const sizeStyles = {
    xs: 'w-6 h-6 text-[10px]',
    sm: 'w-7 h-7 text-xs',
    md: 'w-9 h-9 text-sm',
    lg: 'w-12 h-12 text-base',
  };

  const getInitials = (str) => {
    if (!str) return 'U';
    const parts = str.trim().split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return str.substring(0, 2).toUpperCase();
  };

  return (
    <div className={`relative inline-flex items-center justify-center flex-shrink-0 rounded-full font-semibold select-none ${sizeStyles[size]} ${className}`}>
      {src ? (
        <img
          src={src}
          alt={name}
          className="w-full h-full rounded-full object-cover border border-[#EAE8F0] dark:border-[#282440]"
        />
      ) : (
        <div className="w-full h-full rounded-full bg-[#7657E8]/10 text-[#7657E8] dark:bg-[#7657E8]/30 dark:text-[#A78BFA] border border-[#7657E8]/20 flex items-center justify-center">
          {getInitials(name)}
        </div>
      )}

      {status && (
        <span
          className={`absolute bottom-0 right-0 rounded-full ring-2 ring-white dark:ring-[#191728] ${
            size === 'xs' || size === 'sm' ? 'w-2 h-2' : 'w-2.5 h-2.5'
          } ${
            status === 'online' ? 'bg-emerald-500' : status === 'busy' ? 'bg-amber-500' : 'bg-gray-400'
          }`}
        />
      )}
    </div>
  );
};

export const AvatarGroup = ({ users = [], max = 4, size = 'sm' }) => {
  const visible = users.slice(0, max);
  const remaining = users.length - max;

  return (
    <div className="flex items-center -space-x-2 overflow-hidden">
      {visible.map((u, i) => (
        <Avatar
          key={u.id || u._id || i}
          src={u.avatar}
          name={u.name}
          size={size}
          className="ring-2 ring-white dark:ring-[#191728]"
        />
      ))}
      {remaining > 0 && (
        <div
          className={`flex items-center justify-center rounded-full bg-[#EAE8F0] dark:bg-[#282440] text-[#77738B] dark:text-[#A39EBC] font-semibold text-xs ring-2 ring-white dark:ring-[#191728] ${
            size === 'sm' ? 'w-7 h-7' : 'w-9 h-9'
          }`}
        >
          +{remaining}
        </div>
      )}
    </div>
  );
};

export default Avatar;
