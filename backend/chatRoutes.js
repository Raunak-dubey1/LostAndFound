const express = require('express');
const router = express.Router();
const Claim = require('./Claim');
const LostItem = require('./LostItem');
const Message = require('./Message');
const { protect } = require('./authMiddleware');

async function getAuthorizedClaim(claimId, userId) {
  const claim = await Claim.findById(claimId);
  if (!claim) return { error: 'Claim not found', status: 404 };

  const item = await LostItem.findById(claim.lostItemId);
  if (!item) return { error: 'Lost item not found', status: 404 };

  const isClaimer = claim.userId.toString() === userId.toString();
  const isReporter = item.userId.toString() === userId.toString();

  if (!isClaimer && !isReporter) {
    return { error: 'Not authorized to access this chat', status: 403 };
  }

  return { claim, item, isClaimer, isReporter };
}

router.get('/:claimId', protect, async (req, res) => {
  try {
    const access = await getAuthorizedClaim(req.params.claimId, req.user._id);
    if (access.error) {
      return res.status(access.status).json({ success: false, message: access.error });
    }

    const messages = await Message.find({ claimId: req.params.claimId }).sort({ createdAt: 1 });

    res.json(
      messages.map((message) => ({
        ...message.toObject(),
        id: message._id,
        senderId: message.senderId?.toString(),
        claimId: message.claimId?.toString(),
      }))
    );
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching messages', error: error.message });
  }
});

router.post('/:claimId', protect, async (req, res) => {
  try {
    const access = await getAuthorizedClaim(req.params.claimId, req.user._id);
    if (access.error) {
      return res.status(access.status).json({ success: false, message: access.error });
    }

    const text = req.body.text?.trim();
    if (!text) {
      return res.status(400).json({ success: false, message: 'Message text is required' });
    }

    const message = await Message.create({
      claimId: req.params.claimId,
      senderId: req.user._id,
      senderName: req.user.name,
      text,
    });

    res.status(201).json({
      success: true,
      message: 'Message sent successfully',
      data: {
        ...message.toObject(),
        id: message._id,
        senderId: message.senderId?.toString(),
        claimId: message.claimId?.toString(),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error sending message', error: error.message });
  }
});

module.exports = router;
