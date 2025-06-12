import React from 'react';

export default function ProfilePreview({ profile }: { profile: { profile_picture_url: string | null, username: string, account_type: string } }) {
  return (
    <div className="flex items-center space-x-3 p-2 bg-gray-100 rounded-lg">
      {profile.profile_picture_url ? (
        <img src={profile.profile_picture_url} alt={profile.username} className="w-10 h-10 rounded-full object-cover" />
      ) : (
        <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-lg font-bold">
          {profile.username.charAt(0).toUpperCase()}
        </div>
      )}
      <div>
        <div className="font-semibold">{profile.username}</div>
        <div className="text-xs text-gray-500 capitalize">{profile.account_type}</div>
      </div>
    </div>
  );
}
