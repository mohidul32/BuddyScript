import React, { useState } from 'react';
import { postAPI, commentAPI } from '../services/api';
import Comment from './Comment';

const Post = ({ post, onUpdate, currentUser }) => {
  const [showComments, setShowComments] = useState(false);
  const [commentContent, setCommentContent] = useState('');
  const [showLikes, setShowLikes] = useState(false);

  const handleLike = async () => {
    try {
      await postAPI.toggleLike(post.id);
      onUpdate();
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!commentContent.trim()) return;

    try {
      await commentAPI.createComment(post.id, commentContent);
      setCommentContent('');
      onUpdate();
      setShowComments(true);
    } catch (error) {
      console.error('Error creating comment:', error);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now - date;
    const diffInMins = Math.floor(diffInMs / 60000);

    if (diffInMins < 1) return 'Just now';
    if (diffInMins < 60) return `${diffInMins} minute${diffInMins > 1 ? 's' : ''} ago`;

    const diffInHours = Math.floor(diffInMins / 60);
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;

    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
  };

  return (
    <div className="_feed_inner_timeline_post_area _b_radious6 _padd_b24 _padd_t24 _mar_b16">
      <div className="_feed_inner_timeline_content _padd_r24 _padd_l24">
        <div className="_feed_inner_timeline_post_top">
          <div className="_feed_inner_timeline_post_box">
            <div className="_feed_inner_timeline_post_box_txt">
              <h4 className="_feed_inner_timeline_post_box_title">
                {post.author.full_name}
              </h4>
              <p className="_feed_inner_timeline_post_box_para">
                {formatDate(post.created_at)} · {post.visibility === 'public' ? '🌐 Public' : '🔒 Private'}
              </p>
            </div>
          </div>
        </div>

        <h4 className="_feed_inner_timeline_post_title">{post.content}</h4>

        {post.image_url && (
          <div className="_feed_inner_timeline_image">
            <img src={post.image_url} alt="Post" className="_time_img" />
          </div>
        )}
      </div>

      <div className="_feed_inner_timeline_total_reacts _padd_r24 _padd_l24 _mar_b26">
        <div className="_feed_inner_timeline_total_reacts_txt">
          <p className="_feed_inner_timeline_total_reacts_para1" 
           style={{ display: 'inline-block', cursor: 'pointer', padding: '4px 10px', borderRadius: '20px', backgroundColor: '#f0f2f5', color: '#385898', fontWeight: '500', fontSize: '14px' }}
           >
            <span onClick={() => setShowLikes(!showLikes)}>
              {post.likes_count} Like{post.likes_count === 1 ? '' : 's'}
            </span>
          </p>

          {showLikes && post.likes && post.likes.length > 0 && (
            <div style={{ marginTop: '10px', fontSize: '12px', color: '#666' }}>
              Liked by: {post.likes.map(like => like.user.full_name).join(', ')}
            </div>
          )}
        </div>
        <div className="_feed_inner_timeline_total_reacts_txt">
          <p className="_feed_inner_timeline_total_reacts_para1">
            <span style={{ cursor: 'pointer' }} onClick={() => setShowComments(!showComments)}>
              {post.comments_count} Comment{post.comments_count !== 1 ? 's' : ''}
            </span>
          </p>
        </div>
      </div>

      <div className="_feed_inner_timeline_reaction">
        <button
          className={`_feed_inner_timeline_reaction_emoji _feed_reaction ${post.is_liked ? '_feed_reaction_active' : ''}`}
          onClick={handleLike}
        >
          <span className="_feed_inner_timeline_reaction_link">
            {post.is_liked ? '❤️ Liked' : '🤍 Like'}
          </span>
        </button>
        <button
          className="_feed_inner_timeline_reaction_comment _feed_reaction"
          onClick={() => setShowComments(!showComments)}
        >
          <span className="_feed_inner_timeline_reaction_link">💬 Comment</span>
        </button>
      </div>

      {showComments && (
        <div className="_feed_inner_timeline_cooment_area _padd_r24 _padd_l24">
          <div className="_feed_inner_comment_box">
            <form onSubmit={handleComment} className="_feed_inner_comment_box_form">
              <div className="_feed_inner_comment_box_content">
                <div className="_feed_inner_comment_box_content_txt">
                  <textarea
                    className="form-control _comment_textarea"
                    placeholder="Write a comment"
                    value={commentContent}
                    onChange={(e) => setCommentContent(e.target.value)}
                  />
                </div>
              </div>
              <button type="submit" className="btn btn-primary btn-sm _mar_t8">
                Post Comment
              </button>
            </form>
          </div>

          <div className="_timline_comment_main">
            {post.comments && post.comments.map((comment) => (
              <Comment
                key={comment.id}
                comment={comment}
                postId={post.id}
                onUpdate={onUpdate}
                currentUser={currentUser}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Post;