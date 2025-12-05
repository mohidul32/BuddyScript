import React, { useState } from 'react';
import { commentAPI } from '../services/api';

const Comment = ({ comment, postId, currentUser, isReply = false }) => {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [showLikes, setShowLikes] = useState(false);
  const [localComment, setLocalComment] = useState(comment);

  const handleLike = async () => {
    try {
      // Optimistic UI update
      const newLiked = !localComment.is_liked;
      const newLikesCount = newLiked
        ? localComment.likes_count + 1
        : localComment.likes_count - 1;

      setLocalComment({
        ...localComment,
        is_liked: newLiked,
        likes_count: newLikesCount,
      });

      // Sync with backend
      await commentAPI.toggleLike(localComment.id);
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const handleReply = async (e) => {
    e.preventDefault();
    if (!replyContent.trim()) return;

    try {
      const res = await commentAPI.createComment(postId, replyContent, localComment.id);

      // Add new reply locally
      setLocalComment({
        ...localComment,
        replies: [res.data, ...(localComment.replies || [])],
      });

      setReplyContent('');
      setShowReplyForm(false);
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
    <div
      style={{
        marginLeft: isReply ? '40px' : '0',
        marginBottom: '12px',
      }}
    >
      <div
        style={{
          padding: '10px 14px',
          borderRadius: '18px',
          backgroundColor: isReply ? '#f0f2f5' : '#fff',
          border: '1px solid #e0e0e0',
        }}
      >
        {/* Comment Author */}
        <div style={{ marginBottom: '4px' }}>
          <h4 style={{ margin: 0, fontSize: '14px', fontWeight: '600', color: '#050505' }}>
            {localComment.author.full_name}
          </h4>
        </div>

        {/* Comment Text */}
        <div style={{ marginBottom: '6px', fontSize: '14px', color: '#050505' }}>
          {localComment.content}
        </div>

        {/* Like count pill */}
        {localComment.likes_count > 0 && (
          <div
            onClick={() => setShowLikes(!showLikes)}
            style={{
              display: 'inline-block',
              padding: '2px 8px',
              borderRadius: '12px',
              backgroundColor: '#e4e6eb',
              color: '#385898',
              fontSize: '12px',
              cursor: 'pointer',
              marginBottom: '6px',
            }}
          >
            {localComment.likes_count} {localComment.likes_count === 1 ? 'Like' : 'Likes'}
          </div>
        )}

        {showLikes && localComment.likes && localComment.likes.length > 0 && (
          <div
            style={{
              fontSize: '12px',
              color: '#65676b',
              marginTop: '2px',
              marginBottom: '6px',
            }}
          >
            Liked by:{' '}
            {localComment.likes.map((like) => like.user.full_name).join(', ')}
          </div>
        )}

        {/* Actions: Like, Reply, Timestamp */}
        <div
          style={{
            display: 'flex',
            gap: '16px',
            fontSize: '12px',
            color: '#65676b',
          }}
        >
          <span
            style={{
              cursor: 'pointer',
              color: localComment.is_liked ? '#1877f2' : '#65676b',
            }}
            onClick={handleLike}
          >
            {localComment.is_liked ? 'Liked' : 'Like'}
          </span>

          {!isReply && (
            <span
              style={{ cursor: 'pointer' }}
              onClick={() => setShowReplyForm(!showReplyForm)}
            >
              Reply
            </span>
          )}

          <span>{formatDate(localComment.created_at)}</span>
        </div>

        {/* Reply form */}
        {showReplyForm && (
          <div style={{ marginTop: '8px' }}>
            <textarea
              className="form-control"
              placeholder="Write a reply..."
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              style={{ minHeight: '50px', resize: 'none', marginBottom: '4px' }}
            />
            <button
              type="submit"
              className="btn btn-primary btn-sm"
              onClick={handleReply}
            >
              Post Reply
            </button>
          </div>
        )}
      </div>

      {/* Replies */}
      {localComment.replies && localComment.replies.length > 0 && (
        <div style={{ marginTop: '8px' }}>
          {localComment.replies.map((reply) => (
            <Comment
              key={reply.id}
              comment={reply}
              postId={postId}
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
