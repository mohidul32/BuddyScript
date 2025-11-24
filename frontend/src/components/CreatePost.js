import React, { useState } from 'react';
import { postAPI } from '../services/api';

const CreatePost = ({ onPostCreated }) => {
  const [content, setContent] = useState('');
  const [image, setImage] = useState(null);
  const [visibility, setVisibility] = useState('public');
  const [loading, setLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!content.trim()) {
      alert('Please write something');
      return;
    }

    setLoading(true);

    try {
      await postAPI.createPost({
        content,
        image,
        visibility,
      });

      setContent('');
      setImage(null);
      setPreviewUrl(null);
      setVisibility('public');
      onPostCreated();
    } catch (error) {
      alert('Error creating post');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="_feed_inner_text_area _b_radious6 _padd_b24 _padd_t24 _padd_r24 _padd_l24 _mar_b16">
      <form onSubmit={handleSubmit}>
        <div className="_feed_inner_text_area_box">
          <div className="form-floating _feed_inner_text_area_box_form">
            <textarea
              className="form-control _textarea"
              placeholder="Write something ..."
              id="floatingTextarea"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              style={{ minHeight: '100px' }}
            />
            <label 
              htmlFor="floatingTextarea" 
              style={{ 
                textAlign: 'left', 
                color: '#aaa',  // light gray color
                paddingLeft: '0.75rem' // optional: align with textarea padding
              }}
            >
              Write something ...
            </label>
          </div>
        </div>

        {previewUrl && (
          <div className="_mar_t16 _mar_b16">
            <img
              src={previewUrl}
              alt="Preview"
              style={{ maxWidth: '100%', maxHeight: '300px', borderRadius: '6px' }}
            />
            <button
              type="button"
              className="btn btn-sm btn-danger _mar_t8"
              onClick={() => {
                setImage(null);
                setPreviewUrl(null);
              }}
            >
              Remove Image
            </button>
          </div>
        )}

        <div className="_feed_inner_text_area_bottom _mar_t16">
          <div className="_feed_inner_text_area_item">
            <div className="_feed_inner_text_area_bottom_photo _feed_common">
              <label style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  style={{ display: 'none' }}
                />
                <span style={{ fontSize: '14px' }}>📷 Photo</span>
              </label>
            </div>
            <div className="_feed_inner_text_area_bottom_video _feed_common">
              <select
                className="form-select form-select-sm"
                value={visibility}
                onChange={(e) => setVisibility(e.target.value)}
                style={{ width: 'auto', border: 'none', background: 'transparent' }}
              >
                <option value="public">🌐 Public</option>
                <option value="private">🔒 Private</option>
              </select>
            </div>
          </div>
          <div className="_feed_inner_text_area_btn">
            <button type="submit" className="_feed_inner_text_area_btn_link" disabled={loading}>
              {loading ? 'Posting...' : 'Post'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CreatePost;