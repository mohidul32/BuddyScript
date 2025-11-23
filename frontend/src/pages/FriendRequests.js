import React, { useState, useEffect } from 'react';
import { friendAPI } from '../services/api';
import { Link } from 'react-router-dom';

const FriendRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFriendRequests();
  }, []);

  const fetchFriendRequests = async () => {
    try {
      const response = await friendAPI.getFriendRequests();
      setRequests(response.data);
    } catch (error) {
      console.error('Error fetching friend requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRespond = async (friendshipId, action) => {
    try {
      await friendAPI.respondToRequest(friendshipId, action);
      fetchFriendRequests(); // Refresh list
    } catch (error) {
      console.error('Error responding to request:', error);
    }
  };

  return (
    <div className="_layout _layout_main_wrapper">
      <div className="_main_layout">
        <nav className="navbar navbar-expand-lg navbar-light _header_nav _padd_t10">
          <div className="container _custom_container">
            <div className="_logo_wrap">
              <a className="navbar-brand" href="/feed">
                <img src="/assets/images/logo.svg" alt="Logo" className="_nav_logo" />
              </a>
            </div>
          </div>
        </nav>

        <div className="container _custom_container" style={{ marginTop: '30px' }}>
          <div className="row">
            <div className="col-xl-8 offset-xl-2">
              <div className="card _b_radious6">
                <div className="card-body" style={{ padding: '30px' }}>
                  <h2 style={{ marginBottom: '30px' }}>Friend Requests</h2>

                  {loading ? (
                    <div className="text-center">
                      <div className="spinner-border" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                    </div>
                  ) : requests.length === 0 ? (
                    <div className="text-center" style={{ padding: '40px' }}>
                      <p style={{ color: '#666' }}>No pending friend requests</p>
                      <Link to="/find-friends" className="btn btn-primary" style={{ marginTop: '20px' }}>
                        Find Friends
                      </Link>
                    </div>
                  ) : (
                    <div>
                      {requests.map((request) => (
                        <div
                          key={request.id}
                          className="card"
                          style={{
                            marginBottom: '15px',
                            padding: '20px',
                            border: '1px solid #e0e0e0'
                          }}
                        >
                          <div className="row align-items-center">
                            <div className="col-md-2">
                              <img
                                src={request.from_user.profile_picture_url || '/assets/images/profile.png'}
                                alt={request.from_user.full_name}
                                style={{
                                  width: '80px',
                                  height: '80px',
                                  borderRadius: '50%',
                                  objectFit: 'cover'
                                }}
                              />
                            </div>
                            <div className="col-md-6">
                              <Link
                                to={`/profile/${request.from_user.id}`}
                                style={{ textDecoration: 'none', color: 'inherit' }}
                              >
                                <h5>{request.from_user.full_name}</h5>
                              </Link>
                              <p style={{ color: '#666', marginBottom: '5px' }}>
                                {request.from_user.email}
                              </p>
                              {request.from_user.bio && (
                                <p style={{ color: '#999', fontSize: '14px' }}>
                                  {request.from_user.bio.substring(0, 100)}
                                  {request.from_user.bio.length > 100 && '...'}
                                </p>
                              )}
                              <small style={{ color: '#999' }}>
                                Sent {new Date(request.created_at).toLocaleDateString()}
                              </small>
                            </div>
                            <div className="col-md-4 text-end">
                              <button
                                className="btn btn-success"
                                style={{ marginRight: '10px' }}
                                onClick={() => handleRespond(request.id, 'accept')}
                              >
                                Accept
                              </button>
                              <button
                                className="btn btn-danger"
                                onClick={() => handleRespond(request.id, 'reject')}
                              >
                                Reject
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FriendRequests;