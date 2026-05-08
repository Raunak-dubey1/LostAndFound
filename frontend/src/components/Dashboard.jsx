import React, { useState, useEffect } from 'react';
import axios from 'axios';

function Dashboard({ onViewUpload, onViewClaim, onOpenChat, user }) {
  const [lostItems, setLostItems] = useState([]);
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);
  const [claimFormData, setClaimFormData] = useState({
    description: '',
    contactDetails: ''
  });
  const [activeTab, setActiveTab] = useState('all-items');

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      const [itemsRes, claimsRes] = await Promise.all([
        axios.get('/api/items/lost'),
        axios.get('/api/items/claims')
      ]);
      setLostItems(itemsRes.data);
      setClaims(claimsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClaimClick = (item) => {
    setSelectedItem(item);
    setClaimFormData({
      description: '',
      contactDetails: ''
    });
  };

  const handleClaimSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/items/claim', {
        userId: user.id,
        name: user.name,
        email: user.email,
        lostItemId: selectedItem.id,
        description: claimFormData.description,
        contactDetails: claimFormData.contactDetails
      });

      alert('✓ Claim submitted successfully!');
      setSelectedItem(null);
      fetchAllData();
    } catch (error) {
      alert('Error submitting claim: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleClaimFormChange = (e) => {
    const { name, value } = e.target;
    setClaimFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Filter data
  const activeItems = lostItems.filter(item => item.status === 'active');
  const myPostedItems = lostItems.filter(item => item.userId === user.id);
  const myClaimedItems = claims.filter(claim => claim.userId === user.id);
  const claimsOnMyItems = claims.filter(claim => {
    const item = lostItems.find(i => i.id === claim.lostItemId);
    return item && item.userId === user.id;
  });
  const pendingClaimsOnMyItems = claimsOnMyItems.filter((claim) => claim.status === 'pending');

  if (loading) {
    return <div className="loading-container">Loading dashboard...</div>;
  }

  const renderAllItemsSection = () => (
    <div className="dashboard-section lost-items-section">
      <div className="section-header">
        <h3>📋 All Lost Items</h3>
        <span className="item-count">{activeItems.length}</span>
      </div>
      {activeItems.length === 0 ? (
        <div className="empty-section">
          <span className="empty-icon">🔍</span>
          <p>No items yet</p>
          <button onClick={onViewClaim} className="action-btn">Browse Items</button>
        </div>
      ) : (
        <div className="items-container">
          {activeItems.map(item => (
            <div key={item.id} className="item-card compact">
              {item.image && (
                <div className="item-image-small">
                  <img src={item.image} alt={item.itemName} />
                </div>
              )}
              <div className="item-info">
                <div className="item-main-content">
                  <h4>{item.itemName}</h4>
                  <p className="category-badge">{item.category}</p>
                  <p className="location">📍 {item.location}</p>
                  <p className="description-short">{item.description}</p>
                </div>
                <div className="item-meta">
                  <p className="owner">Posted by: {item.name}</p>
                  <button
                    className="claim-btn"
                    onClick={() => handleClaimClick(item)}
                  >
                    Claim Item
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderMyPostsSection = () => (
    <div className="dashboard-section my-items-section">
      <div className="section-header">
        <h3>📤 My Posted Items</h3>
        <span className="item-count">{myPostedItems.length}</span>
      </div>
      {myPostedItems.length === 0 ? (
        <div className="empty-section">
          <span className="empty-icon">📭</span>
          <p>You haven't posted any items</p>
          <button onClick={onViewUpload} className="action-btn">Post Lost Item</button>
        </div>
      ) : (
        <div className="items-container">
          {myPostedItems.map(item => (
            <div key={item.id} className="item-card my-card">
              <div className="item-status">
                <span className={`status-badge ${item.status}`}>{item.status}</span>
              </div>
              {item.image && (
                <div className="item-image-small">
                  <img src={item.image} alt={item.itemName} />
                </div>
              )}
              <div className="item-info">
                <div className="item-main-content">
                  <h4>{item.itemName}</h4>
                  <p className="category-badge">{item.category}</p>
                  <p className="location">📍 {item.location}</p>
                  <p className="description-short">{item.description}</p>
                </div>
                <div className="item-meta">
                  <p className="date">📅 {new Date(item.dateOfLoss).toLocaleDateString()}</p>
                  <p className="owner">Posted by: {item.name}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderClaimsSection = () => (
    <div className="dashboard-section pending-section">
      <div className="section-header">
        <h3>⏳ Pending Claims on My Items</h3>
        <div className="section-header-right">
          <span className="pending-notification-badge">{pendingClaimsOnMyItems.length}</span>
          <span className="item-count">{claimsOnMyItems.length}</span>
        </div>
      </div>
      {claimsOnMyItems.length === 0 ? (
        <div className="empty-section">
          <span className="empty-icon">💬</span>
          <p>No claims yet</p>
          <button onClick={onViewUpload} className="action-btn">Post Lost Item</button>
        </div>
      ) : (
        <div className="claims-container">
          {claimsOnMyItems.map(claim => {
            const item = lostItems.find(i => i.id === claim.lostItemId);
            return (
              <div key={claim.id} className="claim-card pending" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div className="claim-card-top" style={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                  <div className="claim-header">
                    <h5>{item?.itemName}</h5>
                    <span className="status-badge pending">Pending</span>
                  </div>
                  <div className="claim-details" style={{ flex: 'none', marginBottom: '12px' }}>
                    <p><strong>Claimer:</strong> {claim.name}</p>
                    <p><strong>Email:</strong> {claim.email}</p>
                    <p><strong>Found:</strong> {claim.description}</p>
                    {claim.contactDetails && (
                      <p><strong>Contact:</strong> {claim.contactDetails}</p>
                    )}
                    <p className="claim-date">📅 {new Date(claim.claimDate).toLocaleDateString()}</p>
                  </div>
                </div>
                <button className="claim-btn" onClick={() => onOpenChat(claim.id || claim._id)}>
                  Open Chat →
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  const renderMyClaimsSection = () => (
    <div className="dashboard-section my-claims-section">
      <div className="section-header">
        <h3>🙋 My Claims</h3>
        <span className="item-count">{myClaimedItems.length}</span>
      </div>
      {myClaimedItems.length === 0 ? (
        <div className="empty-section">
          <span className="empty-icon">🙋</span>
          <p>You haven't claimed any items</p>
          <button onClick={onViewClaim} className="action-btn">Browse Items</button>
        </div>
      ) : (
        <div className="claims-container">
          {myClaimedItems.map(claim => {
            const item = lostItems.find(i => i.id === claim.lostItemId);
            return (
              <div key={claim.id} className="claim-card my-claim" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div className="claim-card-top" style={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                  <div className="claim-header">
                    <h5>{item?.itemName}</h5>
                    <span className={`status-badge ${claim.status}`}>{claim.status}</span>
                  </div>
                  <div className="claim-details" style={{ flex: 'none', marginBottom: '12px' }}>
                    <p><strong>Item Owner:</strong> {item?.name}</p>
                    <p><strong>Owner Email:</strong> {item?.email}</p>
                    <p><strong>Your Description:</strong> {claim.description}</p>
                    <p className="claim-date">📅 {new Date(claim.claimDate).toLocaleDateString()}</p>
                  </div>
                </div>
                <button className="claim-btn" onClick={() => onOpenChat(claim.id || claim._id)}>
                  Open Chat →
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h2>Dashboard</h2>
        <p>Manage your lost items and claims</p>
      </div>

      {selectedItem ? (
        <div className="modal-overlay" onClick={() => setSelectedItem(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-modal" onClick={() => setSelectedItem(null)}>✕</button>
            
            <div className="modal-item-details">
              <h3>{selectedItem.itemName}</h3>
              {selectedItem.image && (
                <img src={selectedItem.image} alt={selectedItem.itemName} className="modal-image" />
              )}
              <p><strong>Category:</strong> {selectedItem.category}</p>
              <p><strong>Location:</strong> {selectedItem.location}</p>
              <p><strong>Description:</strong> {selectedItem.description}</p>
              <p><strong>Posted by:</strong> {selectedItem.name} ({selectedItem.email})</p>
            </div>

            <form onSubmit={handleClaimSubmit} className="claim-modal-form">
              <h4>Your Information (Auto-filled)</h4>
              <p><strong>Name:</strong> {user.name}</p>
              <p><strong>Email:</strong> {user.email}</p>

              <div className="form-group">
                <label htmlFor="modal-description">How Did You Find It? *</label>
                <textarea
                  id="modal-description"
                  name="description"
                  value={claimFormData.description}
                  onChange={handleClaimFormChange}
                  placeholder="Describe where and how you found it"
                  rows="3"
                  required
                ></textarea>
              </div>

              <div className="form-group">
                <label htmlFor="modal-contact">Contact Details</label>
                <input
                  type="text"
                  id="modal-contact"
                  name="contactDetails"
                  value={claimFormData.contactDetails}
                  onChange={handleClaimFormChange}
                  placeholder="Phone or other contact info"
                />
              </div>

              <button type="submit" className="submit-button">Submit Claim</button>
            </form>
          </div>
        </div>
      ) : null}

      <div className="tab-bar">
        <button className={`tab-btn ${activeTab === 'all-items' ? 'active' : ''}`} onClick={() => setActiveTab('all-items')}>
          All Items
        </button>
        <button className={`tab-btn ${activeTab === 'my-posts' ? 'active' : ''}`} onClick={() => setActiveTab('my-posts')}>
          My Posts
        </button>
        <button className={`tab-btn ${activeTab === 'claims' ? 'active' : ''}`} onClick={() => setActiveTab('claims')}>
          Claims
          {pendingClaimsOnMyItems.length > 0 && <span className="tab-badge">{pendingClaimsOnMyItems.length}</span>}
        </button>
        <button className={`tab-btn ${activeTab === 'my-claims' ? 'active' : ''}`} onClick={() => setActiveTab('my-claims')}>
          My Claims
        </button>
      </div>

      <div className="tab-content">
        {activeTab === 'all-items' && renderAllItemsSection()}
        {activeTab === 'my-posts' && renderMyPostsSection()}
        {activeTab === 'claims' && renderClaimsSection()}
        {activeTab === 'my-claims' && renderMyClaimsSection()}
      </div>

      <div className="dashboard-actions">
        <button onClick={onViewUpload} className="action-button primary">
          + Report Lost Item
        </button>
        <button onClick={onViewClaim} className="action-button secondary">
          Browse & Claim Items
        </button>
      </div>
      <button className="mobile-fab" onClick={onViewUpload} aria-label="Report lost item">+</button>
    </div>
  );
}

export default Dashboard;
