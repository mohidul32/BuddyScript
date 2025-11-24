import React, { useState } from 'react';
import { authAPI, friendAPI } from '../services/api';
import { Link } from 'react-router-dom';

const FindFriends = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [friendStatuses, setFriendStatuses] = useState({});

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setLoading(true);
    try {
      const response = await authAPI.searchUsers(searchQuery);

      // Ensure searchResults is always an array
      const results = Array.isArray(response.data) ? response.data : [];
      setSearchResults(results);

      // Initialize friend statuses
      const statuses = {};
      results.forEach(user => {
        statuses[user.id] = user.friendship_status;
      });
      setFriendStatuses(statuses);
    } catch (error) {
      console.error('Error searching users:', error);
      setSearchResults([]); // fallback to empty array
    } finally {
      setLoading(false);
    }
  };

  const handleSendRequest = async (userId) => {
    try {
      await friendAPI.sendFriendRequest(userId);
      setFriendStatuses({
        ...friendStatuses,
        [userId]: 'pending_sent'
      });
    } catch (error) {
      console.error('Error sending friend request:', error);
    }
  };

  const renderActionButton = (user) => {
    const status = friendStatuses[user.id];

    switch (status) {
      case 'friends':
        return (
          <Link to={`/profile/${user.id}`} className="btn btn-success">
            View Profile
          </Link>
        );
      case 'pending_sent':
        return (
          <button className="btn btn-secondary" disabled>
            Request Sent
          </button>
        );
      case 'pending_received':
        return (
          <Link to="/friend-requests" className="btn btn-info">
            Respond
          </Link>
        );
      default:
        return (
          <button
            className="btn btn-primary"
            onClick={() => handleSendRequest(user.id)}
          >
            Add Friend
          </button>
        );
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
                  <h2 style={{ marginBottom: '30px' }}>Find Friends</h2>

                  {/* Search Form */}
                  <form onSubmit={handleSearch} style={{ marginBottom: '30px' }}>
                    <div className="input-group">
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Search by name or email..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                      <button className="btn btn-primary" type="submit">
                        Search
                      </button>
                    </div>
                  </form>

                  {/* Search Results */}
                  {loading ? (
                    <div className="text-center">
                      <div className="spinner-border" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                    </div>
                  ) : searchResults.length === 0 ? (
                    <div className="text-center" style={{ padding: '40px' }}>
                      <p style={{ color: '#666' }}>
                        {searchQuery ? 'No users found' : 'Search for friends by name or email'}
                      </p>
                    </div>
                  ) : (
                    <div>
                      {searchResults.map((user) => (
                        <div
                          key={user.id}
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
                                src={user.profile_picture_url || '/assets/images/profile.png'}
                                alt={user.full_name}
                                style={{
                                  width: '80px',
                                  height: '80px',
                                  borderRadius: '50%',
                                  objectFit: 'cover'
                                }}
                              />
                            </div>
                            <div className="col-md-7">
                              <Link
                                to={`/profile/${user.id}`}
                                style={{ textDecoration: 'none', color: 'inherit' }}
                              >
                                <h5>{user.full_name}</h5>
                              </Link>
                              <p style={{ color: '#666', marginBottom: '5px' }}>
                                {user.email}
                              </p>
                              {user.bio && (
                                <p style={{ color: '#999', fontSize: '14px' }}>
                                  {user.bio.substring(0, 100)}
                                  {user.bio.length > 100 && '...'}
                                </p>
                              )}
                              {user.location && (
                                <small style={{ color: '#999' }}>
                                  📍 {user.location}
                                </small>
                              )}
                            </div>
                            <div className="col-md-3 text-end">
                              {renderActionButton(user)}
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

export default FindFriends;