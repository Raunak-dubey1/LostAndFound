  import React, { useState, useEffect } from 'react';
import axios from 'axios';

function ClaimItem({ refreshTrigger, user }) {
  const [lostItems, setLostItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  const [formData, setFormData] = useState({
    description: '',
    contactDetails: ''
  });

  useEffect(() => {
    fetchLostItems();
  }, [refreshTrigger]);

  const fetchLostItems = async () => {
    try {
      setFetchLoading(true);
      const response = await axios.get('/api/items/lost');
      const activeItems = response.data.filter(item => item.status === 'active');
      setLostItems(activeItems);
    } catch (error) {
      console.error('Error fetching items:', error);
      setLostItems([]);
    } finally {
      setFetchLoading(false);
    }
  };

  const handleSelectItem = (item) => {
    setSelectedItem(item);
    setFormData({
      description: '',
      contactDetails: ''
    });
    setMessage('');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmitClaim = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const claimData = {
        userId: user.id,
        name: user.name,
        email: user.email,
        lostItemId: selectedItem.id,
        description: formData.description,
        contactDetails: formData.contactDetails
      };

      await axios.post('/api/items/claim', claimData);

      setMessageType('success');
      setMessage('✓ Claim submitted successfully! The item owner will contact you soon.');

      setTimeout(() => {
        setSelectedItem(null);
        setFormData({
          description: '',
          contactDetails: ''
        });
        setMessage('');
        fetchLostItems();
      }, 2000);
    } catch (error) {
      setMessageType('error');
      setMessage('✗ ' + (error.response?.data?.message || 'Error submitting claim. Please try again.'));
      setTimeout(() => setMessage(''), 4000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-container">
      <div className="claim-section">
        <h2>Claim a Lost Item</h2>
        <p className="section-description">Found an item that belongs to someone else? Help return it to them.</p>

        {!selectedItem ? (
          <>
            {fetchLoading ? (
              <div className="loading">Loading available items...</div>
            ) : lostItems.length === 0 ? (
              <div className="no-items">
                <p>No active lost items at the moment. Check back soon!</p>
              </div>
            ) : (
              <div className="items-list">
                <h3>Available Lost Items</h3>
                <div className="items-grid">
                  {lostItems.map(item => (
                    <div key={item.id} className="item-card">
                      {item.image && (
                        <div className="item-image">
                          <img src={item.image} alt={item.itemName} />
                        </div>
                      )}
                      <div className="item-content">
                        <div className="item-main-content">
                          <h4>{item.itemName}</h4>
                          <p className="category-badge">{item.category}</p>
                          <p className="item-location">📍 {item.location}</p>
                          <p className="item-date">📅 {new Date(item.dateOfLoss).toLocaleDateString()}</p>
                          <p className="item-description">{item.description}</p>
                        </div>
                        <div className="item-meta">
                          <p className="item-owner">Posted by: {item.name}</p>
                          <button
                            className="claim-button"
                            onClick={() => handleSelectItem(item)}
                          >
                            Claim Item
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="modal-overlay" onClick={() => setSelectedItem(null)}>
            <div className="modal-content claim-sheet-content" onClick={(e) => e.stopPropagation()}>
              <button
                className="close-modal"
                onClick={() => setSelectedItem(null)}
              >
                ✕
              </button>

              <div className="selected-item-display">
                <h3>Selected Item: {selectedItem.itemName}</h3>
                {selectedItem.image && (
                  <img src={selectedItem.image} alt={selectedItem.itemName} className="selected-image" />
                )}
                <p>{selectedItem.description}</p>
              </div>

              {message && (
                <div className={`message ${messageType}`}>
                  {message}
                </div>
              )}

              <form onSubmit={handleSubmitClaim} className="claim-form">
                <div className="form-progress">Step 1 of 2</div>
                <h4>Your Information (Auto-filled)</h4>
                <p><strong>Name:</strong> {user.name}</p>
                <p><strong>Email:</strong> {user.email}</p>

                <div className="form-group">
                  <label htmlFor="claim-description">How Did You Find It? *</label>
                  <textarea
                    id="claim-description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Describe where and how did you lost it?"
                    rows="3"
                    required
                  ></textarea>
                </div>

                <div className="form-group">
                  <label htmlFor="claim-contact">Contact Details</label>
                  <input
                    type="text"
                    id="claim-contact"
                    name="contactDetails"
                    value={formData.contactDetails}
                    onChange={handleInputChange}
                    placeholder="Phone number or additional contact info"
                  />
                </div>

                <button
                  type="submit"
                  className="submit-button sticky-submit"
                  disabled={loading}
                >
                  {loading ? 'Submitting Claim...' : 'Submit Claim'}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ClaimItem;
