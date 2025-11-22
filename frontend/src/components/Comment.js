import React, { useState } from 'react';
import { commentAPI } from '../services/api';

const Comment = ({ comment, postId, onUpdate, currentUser, isReply = false }) => {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [showLikes, setShowLikes] = useState(false);

  const handleLike = async () => {
    try {
      await commentAPI.toggleLike(comment.id);
      onUpdate();
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const handleReply = async (e) => {
    e.preventDefault();
    if (!replyContent.trim()) return;

    try {
      await commentAPI.createComment(postId, replyContent, comment.id);
      setReplyContent('');
      setShowReplyForm(false);
      onUpdate();
    } catch (error) {
      console.error('Error creating reply:', error);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now - date;
    const diffInMins = Math.floor(diffInMs / 60000);

    if (diffInMins < 1) return 'Just now';
    if (diffInMins < 60) return `${diffInMins}m`;

    const diffInHours = Math.floor(diffInMins / 60);
    if (diffInHours < 24) return `${diffInHours}h`;

    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d`;
  };

  return (
    <div className="_comment_main" style={{ marginLeft: isReply ? '40px' : '0' }}>
      <div className="_comment_area">
        <div className="_comment_details">
          <div className="_comment_details_top">
            <div className="_comment_name">
              <h4 className="_comment_name_title">{comment.author.full_name}</h4>
            </div>
          </div>
          <div className="_comment_status">
            <p className="_comment_status_text">
              <span>{comment.content}</span>
            </p>
          </div>
          <div className="_total_reactions">
            <div className="_total_react">
              {comment.likes_count > 0 && (
                <span
                  className="_total"
                  style={{ cursor: 'pointer' }}
                  onClick={() => setShowLikes(!showLikes)}
                >
                  {comment.likes_count} {comment.likes_count === 1 ? 'Like' : 'Likes'}
                </span>
              )}
            </div>
          </div>

          {showLikes && comment.likes && comment.likes.length > 0 && (
            <div style={{ marginTop: '5px', fontSize: '11px', color: '#666' }}>
              Liked by: {comment.likes.map(like => like.user.full_name).join(', ')}
            </div>
          )}

          <div className="_comment_reply">
            <div className="_comment_reply_num">
              <ul className="_comment_reply_list">
                <li>
                  <span
                    style={{ cursor: 'pointer', color: comment.is_liked ? '#1890FF' : '#666' }}
                    onClick={handleLike}
                  >
                    {comment.is_liked ? 'Liked' : 'Like'}
                  </span>
                </li>
                {!isReply && (
                  <li>
                    <span
                      style={{ cursor: 'pointer' }}
                      onClick={() => setShowReplyForm(!showReplyForm)}
                    >
                      Reply
                    </span>
                  </li>
                )}
                <li>
                  <span className="_time_link">{formatDate(comment.created_at)}</span>
                </li>
              </ul>
            </div>
          </div>

          {showReplyForm && (
            <div className="_feed_inner_comment_box" style={{ marginTop: '10px' }}>
              <form onSubmit={handleReply} className="_feed_inner_comment_box_form">
                <div className="_feed_inner_comment_box_content">
                  <div className="_feed_inner_comment_box_content_txt">
                    <textarea
                      className="form-control _comment_textarea"
                      placeholder="Write a reply"
                      value={replyContent}
                      onChange={(e) => setReplyContent(e.target.value)}
                      style={{ minHeight: '60px' }}
                    />
                  </div>
                </div>
                <button type="submit" className="btn btn-primary btn-sm _mar_t8">
                  Post Reply
                </button>
              </form>
            </div>
          )}
        </div>
      </div>

      {/* Render Replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div style={{ marginTop: '10px' }}>
          {comment.replies.map((reply) => (
            <Comment
              key={reply.id}
              comment={reply}
              postId={postId}
              onUpdate={onUpdate}
              currentUser={currentUser}
              isReply={true}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Comment;