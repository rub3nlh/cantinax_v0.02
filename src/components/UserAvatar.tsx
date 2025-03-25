import React, { useEffect, useState } from 'react';
import { useAvatar } from '../hooks/useAvatar';
import { User } from 'lucide-react';

interface UserAvatarProps {
  name: string;
  size?: number;
  className?: string;
}

export const UserAvatar: React.FC<UserAvatarProps> = ({ 
  name, 
  size = 40,
  className = ''
}) => {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [error, setError] = useState<boolean>(false);
  const { generateAvatar } = useAvatar();

  useEffect(() => {
    const loadAvatar = async () => {
      try {
        if (name) {
          const firstName = name.split(' ')[0];
          const url = await generateAvatar(firstName);
          setAvatarUrl(url);
          setError(false);
        }
      } catch (err) {
        console.error('Error loading avatar:', err);
        setError(true);
      }
    };

    loadAvatar();
  }, [name]);

  if (!avatarUrl || error) {
    return (
      <div 
        className={`bg-gray-200 rounded-full flex items-center justify-center ${className}`}
        style={{ width: size, height: size }}
      >
        <User className="w-5 h-5 text-gray-500" />
      </div>
    );
  }

  return (
    <img
      src={avatarUrl}
      alt={`${name}'s avatar`}
      className={`rounded-full object-cover ${className}`}
      style={{ width: size, height: size }}
      onError={() => setError(true)}
    />
  );
};