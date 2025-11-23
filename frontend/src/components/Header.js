import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { friendAPI } from '../services/api';

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [friendRequests, setFriendRequests] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    fetchFriendRequests();
    // Poll for new requests every 30 seconds
    const interval = setInterval(fetchFriendRequests, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchFriendRequests = async () => {
    try {
      const response = await friendAPI.getFriendRequests();
      setFriendRequests(response.data);
    } catch (error) {
      console.error('Error fetching friend requests:', error);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-light _header_nav _padd_t10">
      <div className="container _custom_container">
        <div className="_logo_wrap">
          <Link className="navbar-brand" to="/feed">
            <img src="/assets/images/logo.svg" alt="Logo" className="_nav_logo" />
          </Link>
        </div>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarContent"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarContent">
          {/* Search Bar */}
          <div className="_header_form ms-auto">
            <form
              className="_header_form_grp"
              onSubmit={(e) => {
                e.preventDefault();
                const query = e.target.search.value;
                if (query) navigate(`/find-friends?q=${query}`);
              }}
            >
              <svg className="_header_form_svg" xmlns="http://www.w3.org/2000/svg" width="17" height="17" fill="none" viewBox="0 0 17 17">
                <circle cx="7" cy="7" r="6" stroke="#666" />
                <path stroke="#666" strokeLinecap="round" d="M16 16l-3-3" />
              </svg>
              <input
                className="form-control me-2 _inpt1"
                type="search"
                name="search"
                placeholder="Search people..."
              />
            </form>
          </div>

          {/* Navigation Icons */}
          <ul className="navbar-nav mb-2 mb-lg-0 _header_nav_list ms-auto _mar_r8">
            <li className="nav-item _header_nav_item">
              <Link className="nav-link _header_nav_link_active" to="/feed">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="21" fill="none" viewBox="0 0 18 21">
                  <path className="_home_active" stroke="#000" strokeWidth="1.5" strokeOpacity=".6" d="M1 9.924c0-1.552 0-2.328.314-3.01.313-.682.902-1.187 2.08-2.196l1.143-.98C6.667 1.913 7.732 1 9 1c1.268 0 2.333.913 4.463 2.738l1.142.98c1.179 1.01 1.768 1.514 2.081 2.196.314.682.314 1.458.314 3.01v4.846c0 2.155 0 3.233-.67 3.902-.669.67-1.746.67-3.901.67H5.57c-2.155 0-3.232 0-3.902-.67C1 18.002 1 16.925 1 14.77V9.924z" />
                </svg>
              </Link>
            </li>

            <li className="nav-item _header_nav_item">
              <Link className="nav-link _header_nav_link" to="/friend-requests">
                <svg xmlns="http://www.w3.org/2000/svg" width="26" height="20" fill="none" viewBox="0 0 26 20">
                  <path fill="#000" fillOpacity=".6" fillRule="evenodd" d="M12.79 12.15h.429c2.268.015 7.45.243 7.45 3.732 0 3.466-5.002 3.692-7.415 3.707h-.894c-2.268-.015-7.452-.243-7.452-3.727 0-3.47 5.184-3.697 7.452-3.711l.297-.001h.132z" clipRule="evenodd" />
                </svg>
                {friendRequests.length > 0 && (
                  <span className="_counting">{friendRequests.length}</span>
                )}
              </Link>
            </li>
          </ul>

          {/* Profile Dropdown */}
          <div className="_header_nav_profile">
            <div className="_header_nav_profile_image">
              <img
                src={user?.profile_picture_url || '/assets/images/profile.png'}
                alt="Profile"
                className="_nav_profile_img"
              />
            </div>
            <div className="_header_nav_dropdown">
              <p className="_header_nav_para">{user?.full_name}</p>
              <button
                className="_header_nav_dropdown_btn"
                onClick={() => setShowDropdown(!showDropdown)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="10" height="6" fill="none" viewBox="0 0 10 6">
                  <path fill="#112032" d="M5 5l.354.354L5 5.707l-.354-.353L5 5zm4.354-3.646l-4 4-.708-.708 4-4 .708.708zm-4.708 4l-4-4 .708-.708 4 4-.708.708z" />
                </svg>
              </button>
            </div>

            {/* Dropdown Menu */}
            {showDropdown && (
              <div className="_nav_profile_dropdown _profile_dropdown show">
                <div className="_nav_profile_dropdown_info">
                  <div className="_nav_profile_dropdown_image">
                    <img
                      src={user?.profile_picture_url || '/assets/images/profile.png'}
                      alt="Profile"
                      className="_nav_drop_img"
                    />
                  </div>
                  <div className="_nav_profile_dropdown_info_txt">
                    <h4 className="_nav_dropdown_title">{user?.full_name}</h4>
                    <Link to="/profile" className="_nav_drop_profile">
                      View Profile
                    </Link>
                  </div>
                </div>
                <hr />
                <ul className="_nav_dropdown_list">
                  <li className="_nav_dropdown_list_item">
                    <Link to="/profile/edit" className="_nav_dropdown_link">
                      <div className="_nav_drop_info">
                        <span>⚙️</span>
                        Settings
                      </div>
                    </Link>
                  </li>
                  <li className="_nav_dropdown_list_item">
                    <Link to="/find-friends" className="_nav_dropdown_link">
                      <div className="_nav_drop_info">
                        <span>👥</span>
                        Find Friends
                      </div>
                    </Link>
                  </li>
                  <li className="_nav_dropdown_list_item">
                    <button
                      onClick={handleLogout}
                      className="_nav_dropdown_link"
                      style={{
                        background: 'none',
                        border: 'none',
                        width: '100%',
                        textAlign: 'left',
                        padding: 0
                      }}
                    >
                      <div className="_nav_drop_info">
                        <span>🚪</span>
                        Log Out
                      </div>
                    </button>
                  </li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Header;
