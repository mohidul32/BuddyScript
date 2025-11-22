import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { postAPI } from '../services/api';
import CreatePost from '../components/CreatePost';
import Post from '../components/Post';

const Feed = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const { user, logout } = useAuth();

  const fetchPosts = async (pageNum = 1) => {
    try {
      setLoading(true);
      const response = await postAPI.getPosts(pageNum);

      if (pageNum === 1) {
        setPosts(response.data.results);
      } else {
        setPosts(prev => [...prev, ...response.data.results]);
      }

      setHasMore(response.data.next !== null);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts(1);
  }, []);

  const handlePostCreated = () => {
    fetchPosts(1);
  };

  const handlePostUpdate = () => {
    fetchPosts(page);
  };

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchPosts(nextPage);
  };

  return (
    <div className="_layout _layout_main_wrapper">
      <div className="_main_layout">
        {/* Header Navigation */}
        <nav className="navbar navbar-expand-lg navbar-light _header_nav _padd_t10">
          <div className="container _custom_container">
            <div className="_logo_wrap">
              <a className="navbar-brand" href="/feed">
                <img src="/assets/images/logo.svg" alt="Logo" className="_nav_logo" />
              </a>
            </div>
            <div className="collapse navbar-collapse" id="navbarSupportedContent">
              <div className="_header_nav_profile" style={{ marginLeft: 'auto' }}>
                <div className="_header_nav_dropdown">
                  <p className="_header_nav_para">{user?.full_name}</p>
                  <button className="_header_nav_dropdown_btn" onClick={logout}>
                    Logout
                  </button>
                </div>
              </div>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <div className="container _custom_container">
          <div className="_layout_inner_wrap">
            <div className="row">
              {/* Left Sidebar - Empty for now */}
              <div className="col-xl-3 col-lg-3 col-md-12 col-sm-12 d-none d-lg-block">
                <div className="_layout_left_sidebar_wrap">
                  <div className="_left_inner_area_explore _padd_t24 _padd_b6 _padd_r24 _padd_l24 _b_radious6 _feed_inner_area">
                    <h4 className="_left_inner_area_explore_title _title5 _mar_b24">Menu</h4>
                    <ul className="_left_inner_area_explore_list">
                      <li className="_left_inner_area_explore_item">
                        <a href="/feed" className="_left_inner_area_explore_link">
                          🏠 Feed
                        </a>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Middle Content - Feed */}
              <div className="col-xl-6 col-lg-6 col-md-12 col-sm-12">
                <div className="_layout_middle_wrap">
                  <div className="_layout_middle_inner">
                    {/* Create Post */}
                    <CreatePost onPostCreated={handlePostCreated} />

                    {/* Posts Feed */}
                    {loading && page === 1 ? (
                      <div className="text-center _padd_t24 _padd_b24">
                        <div className="spinner-border" role="status">
                          <span className="visually-hidden">Loading...</span>
                        </div>
                      </div>
                    ) : (
                      <>
                        {posts.length === 0 ? (
                          <div className="_feed_inner_timeline_post_area _b_radious6 _padd_b24 _padd_t24 _padd_r24 _padd_l24 _mar_b16 text-center">
                            <p>No posts yet. Be the first to post!</p>
                          </div>
                        ) : (
                          posts.map((post) => (
                            <Post
                              key={post.id}
                              post={post}
                              onUpdate={handlePostUpdate}
                              currentUser={user}
                            />
                          ))
                        )}

                        {hasMore && !loading && (
                          <div className="text-center _mar_b24">
                            <button
                              className="btn btn-primary"
                              onClick={loadMore}
                            >
                              Load More Posts
                            </button>
                          </div>
                        )}

                        {loading && page > 1 && (
                          <div className="text-center _padd_b24">
                            <div className="spinner-border spinner-border-sm" role="status">
                              <span className="visually-hidden">Loading...</span>
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Sidebar - Empty for now */}
              <div className="col-xl-3 col-lg-3 col-md-12 col-sm-12 d-none d-lg-block">
                <div className="_layout_right_sidebar_wrap">
                  <div className="_right_inner_area_info _padd_t24 _padd_b24 _padd_r24 _padd_l24 _b_radious6 _feed_inner_area">
                    <h4 className="_right_inner_area_info_content_title _title5">Welcome!</h4>
                    <p style={{ fontSize: '14px', marginTop: '10px' }}>
                      Start sharing your thoughts with the community.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Feed;
