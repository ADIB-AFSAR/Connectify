import React, { useEffect, useState } from 'react';
import { getFirestore, collection, getDocs, doc, updateDoc, arrayUnion, arrayRemove, getDoc } from 'firebase/firestore';
import { useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import Spinner from './Spinner';

const ConnectionsList = ({ toggleConnectionList }) => {
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const currentUser = useSelector((state) => state.userState.user);
  const [following, setFollowing] = useState([]);
  const [followers, setFollowers] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();

  const db = getFirestore();

  useEffect(() => {
    const fetchAllUsers = async () => {
      const profilesCollection = collection(db, 'profiles');
      const profilesSnapshot = await getDocs(profilesCollection);
      const profilesList = profilesSnapshot.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
      }));
      setAllUsers(profilesList);
    };

    const fetchConnections = async () => {
      const userRef = doc(db, 'profiles', currentUser.email);
      const userSnapshot = await getDoc(userRef);
      if (userSnapshot.exists()) {
        const userData = userSnapshot.data();
        setFollowing(userData.connection?.following || []);
        setFollowers(userData.connection?.followers || []);
      }
    };

    fetchAllUsers();
    fetchConnections();
    setLoading(false);
  }, [db, currentUser.email]);

  const handleFollow = async (userEmail) => {
    const userRef = doc(db, 'profiles', currentUser.email);
    const isFollowing = following.includes(userEmail);

    try {
      // Update the current user's following list
      await updateDoc(userRef, {
        'connection.following': isFollowing
          ? arrayRemove(userEmail)
          : arrayUnion(userEmail),
      });

      const targetUserRef = doc(db, 'profiles', userEmail);

      // Update the target user's followers list
      await updateDoc(targetUserRef, {
        'connection.followers': isFollowing
          ? arrayRemove(currentUser.email)
          : arrayUnion(currentUser.email),
      });

      // If the current user is now following the target user, add a follow notification
      if (!isFollowing) {
        const notification = {
          id: new Date().getTime().toString(), // Unique ID for the notification
          type: 'follow',
          content: `${currentUser.name || 'Someone'} started following you.`,
          timestamp: new Date(),
          read: false,
        };

        await updateDoc(targetUserRef, {
          notifications: arrayUnion(notification),
        });
      }

      // Update local state
      setFollowing((prev) =>
        isFollowing
          ? prev.filter((email) => email !== userEmail)
          : [...prev, userEmail]
      );
    } catch (error) {
      console.error('Error updating follow status:', error);
    }
  };

  const handleBackButtonClick = () => {
    if (location.pathname === '/explore-connections') {
      navigate('/feed');
    } else if (location.pathname === '/feed') {
      toggleConnectionList();
    }
  };

  if (loading) {
    return <Spinner />;
  } 

  return (
    <div className="container mt-3">
      <h2 className="text-center mb-4">
        <span
          className="float-left cursor-pointer border-0 btn p-0 m-0"
          onClick={handleBackButtonClick}
        >
          <i className="bi bi-arrow-left"></i>
        </span>
        Explore Connections
      </h2>
      {/* Following List */}
      <div className="mb-4">
        <h4>Following</h4>
        <div className="row">
          {following.length > 0 ? (
            allUsers
              .filter((user) => following.includes(user.email))
              .map((user, index) => (
                <div className="col-md-4 mb-3 mt-2" key={index}>
                  <div className="card effect border-0 text-center" style={{ width: '10rem' }}>
                    <div className="card-body">
                      <img
                        onClick={() => {
                          navigate(`/profile/${user.email}`);
                        }}
                        src={user?.image || '/images/user.svg'}
                        className="rounded-circle mb-1"
                        alt={user.name}
                        style={{ width: '80px', height: '80px', objectFit: 'cover' }}
                      />
                      <h5 className="card-title">{user.name || 'Unnamed User'}</h5>
                      <p className="card-text">{user.headline || 'No headline available'}</p>
                      <button
                        className="btn btn-secondary btn-sm col-12 mt-1"
                        onClick={() => handleFollow(user.email)}
                      >
                        Unfollow
                      </button>
                    </div>
                  </div>
                </div>
              ))
          ) : (
            <div className="text-center col-12">
              <p>No following connections available</p>
            </div>
          )}
        </div>
      </div>

      {/* Followers List */}
      <div className="mb-4">
        <h4>Followers</h4>
        <div className="row">
          {followers.length > 0 ? (
            allUsers
              .filter((user) => followers.includes(user.email))
              .map((user, index) => (
                <div className="col-md-4 mb-3 mt-2" key={index}>
                  <div className="card effect border-0 text-center" style={{ width: '10rem' }}>
                    <div className="card-body">
                      <img
                        onClick={() => {
                          navigate(`/profile/${user.email}`);
                        }}
                        src={user?.image || '/images/user.svg'}
                        className="rounded-circle mb-1"
                        alt={user.name}
                        style={{ width: '80px', height: '80px', objectFit: 'cover' }}
                      />
                      <h5 className="card-title">{user.name || 'Unnamed User'}</h5>
                      <p className="card-text">{user.headline || 'No headline available'}</p>
                      <button
                        className="btn btn-outline-primary btn-sm col-12 mt-1"
                        onClick={() => handleFollow(user.email)}
                      >
                        {following.includes(user.email) ? 'Unfollow' : 'Follow'}
                      </button>
                    </div>
                  </div>
                </div>
              ))
          ) : (
            <div className="text-center col-12">
              <p>No followers available</p>
            </div>
          )}
        </div>
      </div>

      {/* Other Users List */}
      <div className="">
       <h4>Explore Other Users</h4>
       <div className="row">
       {allUsers && allUsers.length > 0 ? (
      allUsers
        .filter(
          (user) =>
            user.email !== currentUser.email &&
            !following.includes(user.email) &&
            !followers.includes(user.email)
        )
        .length > 0 ? (
        allUsers
          .filter(
            (user) =>
              user.email !== currentUser.email &&
              !following.includes(user.email) &&
              !followers.includes(user.email)
          )
          .map((user, index) => (
            <div className="col-md-4 mb-3 mt-2" key={index}>
              <div className="card shadow-lg text-center" style={{ width: '10rem' }}>
                <div className="card-body">
                  <img
                    onClick={() => {
                      navigate(`/profile/${user.email}`);
                    }}
                    src={user?.image || '/images/user.svg'}
                    className="rounded-circle mb-1"
                    alt={user.name}
                    style={{ width: '80px', height: '80px', objectFit: 'cover' }}
                  />
                  <h5 className="card-title">{user.name || 'Unnamed User'}</h5>
                  <p className="card-text">{user.headline || 'No headline available'}</p>
                  <button
                    className="btn btn-primary btn-sm col-12 mt-1"
                    onClick={() => handleFollow(user.email)}
                  >
                    Follow
                  </button>
                </div>
              </div>
            </div>
          ))
            ) : (
              <div className="text-center col-12 mb-3">
                <p className="text-dark">No other user available</p>
              </div>
            )
          ) : (
          <div className="text-center col-12 mb-3">
            <p className="text-dark">No other users available</p>
          </div>
          )}
      </div>
      </div>

    </div>
  );
};

export default ConnectionsList;
