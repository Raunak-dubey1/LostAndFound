// Database Schema Examples for Lost & Found Application
// This file provides example schemas for different database systems

/* ============================================
   MONGODB SCHEMA EXAMPLES
   ============================================ */

// Collections structure for MongoDB

// lost_items collection
db.lost_items.insertOne({
  _id: ObjectId(),
  type: "lost",
  name: "John Doe",
  email: "john@example.com",
  itemName: "Black Wallet",
  description: "Leather black wallet with silver clasp",
  category: "jewelry",
  location: "Central Park",
  dateOfLoss: new Date("2026-04-15"),
  image: "base64_encoded_image_or_url",
  postedDate: new Date(),
  status: "active", // active, claimed, resolved
  createdAt: new Date(),
  updatedAt: new Date()
});

// claims collection
db.claims.insertOne({
  _id: ObjectId(),
  type: "claim",
  name: "Jane Smith",
  email: "jane@example.com",
  lostItemId: ObjectId("..."), // reference to lost_items
  description: "Found near the Central Park entrance",
  contactDetails: "+1-555-123-4567",
  claimDate: new Date(),
  status: "pending", // pending, approved, rejected
  createdAt: new Date(),
  updatedAt: new Date()
});

/* ============================================
   SQL (PostgreSQL/MySQL) SCHEMA
   ============================================ */

/*
CREATE TABLE lost_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type VARCHAR(10) NOT NULL DEFAULT 'lost',
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL,
  item_name VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  category VARCHAR(50) NOT NULL,
  location VARCHAR(200) NOT NULL,
  date_of_loss DATE NOT NULL,
  image BYTEA,
  posted_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE claims (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type VARCHAR(10) NOT NULL DEFAULT 'claim',
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL,
  lost_item_id UUID NOT NULL REFERENCES lost_items(id),
  description TEXT NOT NULL,
  contact_details VARCHAR(200),
  claim_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  status VARCHAR(20) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_lost_items_status ON lost_items(status);
CREATE INDEX idx_lost_items_email ON lost_items(email);
CREATE INDEX idx_claims_lost_item_id ON claims(lost_item_id);
CREATE INDEX idx_claims_email ON claims(email);
*/

/* ============================================
   FIREBASE FIRESTORE SCHEMA
   ============================================ */

/*
Collection: lost_items
Documents:
{
  documentId: "auto-generated",
  type: "lost",
  name: "John Doe",
  email: "john@example.com",
  itemName: "Black Wallet",
  description: "Leather black wallet with silver clasp",
  category: "jewelry",
  location: "Central Park",
  dateOfLoss: Timestamp(2026, 4, 15),
  image: "gs://bucket-name/images/...",
  postedDate: Timestamp.now(),
  status: "active",
  createdAt: Timestamp.now(),
  updatedAt: Timestamp.now()
}

Collection: claims
Documents:
{
  documentId: "auto-generated",
  type: "claim",
  name: "Jane Smith",
  email: "jane@example.com",
  lostItemId: "reference to lost_items doc",
  description: "Found near the Central Park entrance",
  contactDetails: "+1-555-123-4567",
  claimDate: Timestamp.now(),
  status: "pending",
  createdAt: Timestamp.now(),
  updatedAt: Timestamp.now()
}
*/

/* ============================================
   NODE.JS INTEGRATION EXAMPLES
   ============================================ */

// Example 1: MongoDB Integration
/*
const { MongoClient } = require('mongodb');

const client = new MongoClient(process.env.MONGODB_URI);
const db = client.db('lost_found');

// Get all lost items
app.get('/api/items/lost', async (req, res) => {
  try {
    const items = await db.collection('lost_items')
      .find({ status: 'active' })
      .toArray();
    res.json(items);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Post new lost item
app.post('/api/items/lost', async (req, res) => {
  try {
    const { name, email, itemName, description, category, location, dateOfLoss, image } = req.body;
    
    const result = await db.collection('lost_items').insertOne({
      name, email, itemName, description, category, location,
      dateOfLoss: new Date(dateOfLoss),
      image,
      type: 'lost',
      status: 'active',
      postedDate: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    });

    res.status(201).json({ 
      success: true, 
      data: { _id: result.insertedId }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
*/

// Example 2: PostgreSQL Integration (using pg)
/*
const { Pool } = require('pg');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

// Get all lost items
app.get('/api/items/lost', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM lost_items WHERE status = $1 ORDER BY posted_date DESC',
      ['active']
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Post new lost item
app.post('/api/items/lost', async (req, res) => {
  try {
    const { name, email, itemName, description, category, location, dateOfLoss, image } = req.body;
    
    const result = await pool.query(
      `INSERT INTO lost_items 
       (name, email, item_name, description, category, location, date_of_loss, image, type, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [name, email, itemName, description, category, location, dateOfLoss, image, 'lost', 'active']
    );

    res.status(201).json({ 
      success: true, 
      data: result.rows[0]
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
*/

// Example 3: Firebase Firestore Integration
/*
const admin = require('firebase-admin');
const db = admin.firestore();

// Get all lost items
app.get('/api/items/lost', async (req, res) => {
  try {
    const snapshot = await db.collection('lost_items')
      .where('status', '==', 'active')
      .orderBy('postedDate', 'desc')
      .get();

    const items = [];
    snapshot.forEach(doc => {
      items.push({ id: doc.id, ...doc.data() });
    });
    
    res.json(items);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Post new lost item
app.post('/api/items/lost', async (req, res) => {
  try {
    const { name, email, itemName, description, category, location, dateOfLoss, image } = req.body;
    
    const docRef = await db.collection('lost_items').add({
      name, email, itemName, description, category, location,
      dateOfLoss: new Date(dateOfLoss),
      image,
      type: 'lost',
      status: 'active',
      postedDate: admin.firestore.FieldValue.serverTimestamp(),
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    res.status(201).json({ 
      success: true, 
      data: { id: docRef.id }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
*/

module.exports = {
  description: "Database schema examples for Lost & Found application"
};
