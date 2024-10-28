import { doc, updateDoc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import db from '../firebase.config'; 

const Notification = () => {
    const [notifications, setNotifications] = useState([]);
    const currentUser = useSelector((state) => state.userState.user);

    const formatTimestamp = (timestamp) => {
        const date = new Date(timestamp.seconds * 1000);
        return date.toLocaleString();
    };

    const handleNotificationRead = async (notificationId) => {
        const userRef = doc(db, 'profiles', currentUser.email);
        const updatedNotifications = notifications?.map((notification) =>
            notification.id === notificationId
                ? { ...notification, read: true }
                : notification
        );

        try {
            await updateDoc(userRef, {
                notifications: updatedNotifications,
            });

            // Update local state to reflect the changes
            setNotifications(updatedNotifications);
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    };

    const handleDeleteNotification = async (notificationId) => {
        const userRef = doc(db, 'profiles', currentUser.email);
        const updatedNotifications = notifications?.filter(
            (notification) => notification.id !== notificationId
        );

        try {
            await updateDoc(userRef, {
                notifications: updatedNotifications,
            });

            // Update local state to reflect the changes
            setNotifications(updatedNotifications);
        } catch (error) {
            console.error('Error deleting notification:', error);
        }
    };

    useEffect(() => {
        // Initialize notifications from Redux state, ensuring no duplicates
        const uniqueNotifications = Array.from(new Set(currentUser?.notifications.map(n => n.id)))
            .map(id => currentUser.notifications.find(n => n.id === id));
        setNotifications(uniqueNotifications);
    }, [currentUser.notifications]);

    return (
        <div className="container notification mt-3">
            <h4 className="mb-3">Notifications</h4>
            <div className="d-flex flex-column-reverse">
                {notifications?.length > 0 ? (
                    notifications?.map((notification, index) => (
                        <div
                            key={index}
                            className={`list-group-item ${notification.read ? 'text-muted' : 'fw-semibold text-primary'} mb-1 shadow-sm`}
                        >
                            <div className="d-flex justify-content-between align-items-center">
                                <span>{notification.content}</span>
                                <div className='d-flex'>
  <button
    className="btn btn-link btn-sm"
    onClick={() => handleNotificationRead(notification.id)}
  >
    <span className="mark-as-read-text">
      {notification.read ? <i className='bi bi-check2-all text-muted'>Read</i> : "Mark as Read"}
    </span>
    <span className="read-text">
      {notification.read ? <i className='bi bi-check2-all text-muted'>Read</i> : "Read"}
    </span>
  </button>
  <button
    className="btn btn-link btn-sm text-danger"
    onClick={() => handleDeleteNotification(notification.id)}
  >
    <i className='bi bi-trash-fill hover-bg-danger'></i>
  </button>
</div>

                            </div>
                            <small className={`${notification.read ? 'text-muted' : 'text-primary'}`}>{formatTimestamp(notification.timestamp)}</small>
                        </div>
                    ))
                ) : (
                    <p className="text-center">No notifications available</p>
                )}
            </div>
        </div>
    );
};

export default Notification;
