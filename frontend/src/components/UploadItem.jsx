import React, { useState } from 'react';
import axios from 'axios';

function UploadItem({ onItemUploaded, user }) {
  const [formData, setFormData] = useState({
    itemName: '',
    description: '',
    category: 'electronics',
    location: '',
    dateOfLoss: '',
    image: null
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          image: reader.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      await axios.post('/api/items/lost', {
        userId: user.id,
        name: user.name,
        email: user.email,
        itemName: formData.itemName,
        description: formData.description,
        category: formData.category,
        location: formData.location,
        dateOfLoss: formData.dateOfLoss,
        image: formData.image
      });
      
      setMessageType('success');
      setMessage('✓ Lost item reported successfully! We will help you find it.');
      
      // Reset form
      setFormData({
        itemName: '',
        description: '',
        category: 'electronics',
        location: '',
        dateOfLoss: '',
        image: null
      });

      onItemUploaded();

      setTimeout(() => setMessage(''), 4000);
    } catch (error) {
      setMessageType('error');
      setMessage('✗ ' + (error.response?.data?.message || 'Error uploading item. Please try again.'));
      setTimeout(() => setMessage(''), 4000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-container">
      <div className="form-section upload-section">
        <h2>Report a Lost Item</h2>
        <p className="section-description">Help us find your lost item by providing detailed information.</p>

        {message && (
          <div className={`message ${messageType}`}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="upload-form">
          <div className="form-progress">Step 1 of 2</div>
          {/* Auto-filled User Information */}
          <div className="user-info-display">
            <h4>Your Information (Auto-filled)</h4>
            <p><strong>Name:</strong> {user.name || 'Not provided'}</p>
            <p><strong>Email:</strong> {user.email || 'Not provided'}</p>
          </div>

          {/* Item Information */}
          <div className="form-group">
            <label htmlFor="itemName">Item Name *</label>
            <input
              type="text"
              id="itemName"
              name="itemName"
              value={formData.itemName}
              onChange={handleInputChange}
              placeholder="e.g., Black Wallet, Silver Watch"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="category">Category *</label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              required
            >
              <option value="electronics">Electronics</option>
              <option value="jewelry">Jewelry</option>
              <option value="clothing">Clothing</option>
              <option value="documents">Documents</option>
              <option value="keys">Keys</option>
              <option value="bags">Bags & Luggage</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="description">Description *</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Describe the item in detail (color, size, distinctive marks, etc.)"
              rows="3"
              required
            ></textarea>
          </div>

          <div className="form-group">
            <label htmlFor="location">Location Lost *</label>
            <input
              type="text"
              id="location"
              name="location"
              value={formData.location}
              onChange={handleInputChange}
              placeholder="e.g., Central Park, Downtown Mall"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="dateOfLoss">Date of Loss *</label>
            <input
              type="date"
              id="dateOfLoss"
              name="dateOfLoss"
              value={formData.dateOfLoss}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="image">Upload Image (Optional)</label>
            <input
              type="file"
              id="image"
              name="image"
              onChange={handleFileChange}
              accept="image/*"
            />
            {formData.image && (
              <div className="image-preview">
                <img src={formData.image} alt="Preview" />
              </div>
            )}
          </div>

          <button
            type="submit"
            className="submit-button sticky-submit"
            disabled={loading}
          >
            {loading ? 'Uploading...' : 'Report Lost Item'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default UploadItem;
