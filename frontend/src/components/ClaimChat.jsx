import React, { useCallback, useEffect, useMemo, useState } from 'react';
import axios from 'axios';

function ClaimChat({ claimId, user, onBack }) {
  const [claim, setClaim] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');

  const isReporter = useMemo(() => {
    if (!claim?.lostItem) return false;
    return claim.lostItem.userId === user.id;
  }, [claim, user.id]);

  const normalizedClaimId = claimId || '';

  const loadClaimDetails = useCallback(async () => {
    const response = await axios.get(`/api/items/claims/${normalizedClaimId}`);
    setClaim(response.data);
  }, [normalizedClaimId]);

  const loadMessages = useCallback(async () => {
    const response = await axios.get(`/api/chat/${normalizedClaimId}`);
    setMessages(response.data);
  }, [normalizedClaimId]);

  const loadAll = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      await Promise.all([loadClaimDetails(), loadMessages()]);
    } catch (err) {
      const apiMessage = err.response?.data?.message;
      const statusText = err.response?.status ? ` (${err.response.status})` : '';
      setError(apiMessage ? `${apiMessage}${statusText}` : 'Failed to load claim chat');
    } finally {
      setLoading(false);
    }
  }, [loadClaimDetails, loadMessages]);

  useEffect(() => {
    if (!normalizedClaimId) {
      setLoading(false);
      setError('Missing claim ID');
      return;
    }
    loadAll();
    const timer = setInterval(() => {
      loadMessages().catch(() => {});
      loadClaimDetails().catch(() => {});
    }, 5000);
    return () => clearInterval(timer);
  }, [normalizedClaimId, loadAll, loadClaimDetails, loadMessages]);

  const handleSend = async (e) => {
    e.preventDefault();
    const text = messageText.trim();
    if (!text) return;

    try {
      setSending(true);
      await axios.post(`/api/chat/${normalizedClaimId}`, { text });
      setMessageText('');
      await loadMessages();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const handleClaimStatusUpdate = async (status) => {
    try {
      setActionLoading(true);
      await axios.patch(`/api/items/claims/${normalizedClaimId}/status`, { status });
      await loadClaimDetails();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update claim status');
    } finally {
      setActionLoading(false);
    }
  };

  const renderClaimerBanner = () => {
    if (claim.status === 'approved') {
      return <div className="chat-status-banner success">Your claim was approved! 🎉</div>;
    }
    if (claim.status === 'rejected') {
      return <div className="chat-status-banner error">Your claim was rejected by the owner.</div>;
    }
    return <div className="chat-status-banner pending">Waiting for owner to review your claim.</div>;
  };

  if (loading) {
    return <div className="loading-container">Loading claim conversation...</div>;
  }

  if (error && !claim) {
    return (
      <div className="form-container">
        <button className="back-button" onClick={onBack}>← Back</button>
        <div className="message error">{error}</div>
      </div>
    );
  }

  return (
    <div className="form-container claim-chat-container">
      <div className="claim-chat-top">
        <button className="back-button" onClick={onBack}>← Back to Dashboard</button>
      </div>

      {error && <div className="message error">{error}</div>}

      <div className="claim-chat-header">
        <h2>{claim?.lostItem?.itemName}</h2>
        <span className={`status-badge ${claim?.status}`}>{claim?.status}</span>
      </div>
      <div className="claim-chat-meta">
        <p><strong>Claimer:</strong> {claim?.name}</p>
        <p><strong>Claim:</strong> {claim?.description}</p>
      </div>

      {isReporter ? (
        <div className="claim-chat-actions">
          <button
            className="action-button primary"
            disabled={actionLoading || claim?.status !== 'pending'}
            onClick={() => handleClaimStatusUpdate('approved')}
          >
            ✅ Accept Claim
          </button>
          <button
            className="action-button secondary"
            disabled={actionLoading || claim?.status !== 'pending'}
            onClick={() => handleClaimStatusUpdate('rejected')}
          >
            ❌ Reject Claim
          </button>
        </div>
      ) : (
        renderClaimerBanner()
      )}

      <div className="chat-thread">
        {messages.length === 0 ? (
          <div className="empty-section">No messages yet. Start the conversation below.</div>
        ) : (
          messages.map((msg) => {
            const mine = String(msg.senderId) === String(user.id);
            return (
              <div key={msg.id} className={`chat-message-row ${mine ? 'mine' : 'theirs'}`}>
                <div className={`chat-bubble ${mine ? 'mine' : 'theirs'}`}>
                  {!mine && <p className="chat-sender">{msg.senderName}</p>}
                  <p>{msg.text}</p>
                  <span className="chat-time">{new Date(msg.createdAt).toLocaleString()}</span>
                </div>
              </div>
            );
          })
        )}
      </div>

      <form className="chat-input-row" onSubmit={handleSend}>
        <input
          type="text"
          value={messageText}
          onChange={(e) => setMessageText(e.target.value)}
          placeholder="Type your message..."
          maxLength={1000}
        />
        <button type="submit" className="submit-button" disabled={sending}>
          {sending ? 'Sending...' : 'Send'}
        </button>
      </form>
    </div>
  );
}

export default ClaimChat;
