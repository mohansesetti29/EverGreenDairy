import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import "../components/Header.css";
import "./Notifications.css";

const Notifications = () => {
  const [notificationList, setNotificationList] = useState([]);
  let api = "https://cube-backend-service.onrender.com/api/franchise";
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await fetch(api + '/getRequests', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({}),
        });
        if (!response.ok) {
          throw new Error('Failed to fetch');
        }
        const data = await response.json();
        setNotificationList(data);
      } catch (error) {
        console.error('Error fetching franchise requests:', error);
        setNotificationList([]);
      }
    };

    fetchNotifications();
  }, []);


  const acceptFranchise = async (phone) => {
    try {
      const response = await fetch(api + '/accept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      });
      const result = await response.json();
      alert(result.message || 'Accepted');
      setNotificationList(notificationList.filter(f => f.phone !== phone));
    } catch {
      alert('Error accepting franchise');
    }
  };

  const rejectFranchise = async (phone) => {
    try {
      const response = await fetch(api + '/reject', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      });
      const result = await response.json();
      alert(result.message || 'Rejected');
      setNotificationList(notificationList.filter(f => f.phone !== phone));
    } catch {
      alert('Error rejecting franchise');
    }
  };


  return (
    <div>
      <div className="notification-container">
        <Header />
        <main className="notification-main">
          <div className="notification-content">
            <div className='notification-head'>New Franchise Application</div>
            <div className='notification-data'>
              <table className="notification-table">
                <thead>
                  <tr>
                    <th>S.No</th>
                    <th>Applicant Name</th>
                    <th>Number</th>
                    <th>Location</th>
                    <th>Accept</th>
                    <th>Reject</th>
                  </tr>
                </thead>
                <tbody>
                  {notificationList.map((f, i) => (
                    <tr key={i}>
                      <td>{i + 1}</td>
                      <td>{f.name}</td>
                      <td>{f.phone}</td>
                      <td>{f.location}</td>
                      <td>
                        <button className="noti-view-btn" onClick={() => acceptFranchise(f.phone)}>
                          Accept
                        </button>
                      </td>
                      <td>
                        <button className="noti-view-btn1" onClick={() => rejectFranchise(f.phone)}>
                          Reject
                        </button>
                      </td>
                    </tr>
                  ))}
                  {notificationList.length === 0 && (
                    <tr>
                      <td colSpan="6" style={{ textAlign: 'center' }}>No new franchise requests</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Notifications;
