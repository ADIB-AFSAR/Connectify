import React from 'react';
import { useNavigate } from 'react-router-dom';

const ProfileReminder = ({ user }) => {
  const navigate = useNavigate();

  // Check if the user details or title are empty
  const isProfileIncomplete = !user?.about || !user?.headline;

  // Redirect to the profile edit page
  const redirectToEditProfile = () => {
    navigate(`/profile/modify`);
  };

  // Conditionally render if the profile is incomplete
  if (!isProfileIncomplete) {
    return null;
  }

  return (
    <div
      className="profile-reminder"
      onClick={redirectToEditProfile}
      style={{
        padding: '10px',
        backgroundColor: '#ffeb3b',
        cursor: 'pointer',
        textAlign: 'center',
        borderRadius: '5px',
        margin: '10px 0',
      }}
    >
      <p style={{ margin: 0 }}>
        Your profile is incomplete.Click here to update your details.
      </p>
    </div>
  );
};

export default ProfileReminder;
