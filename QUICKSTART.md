# Quick Start Guide - Lost & Found Website

## Prerequisites
- Node.js (v14 or higher)
- npm (comes with Node.js)

## Step-by-Step Setup

### 1. Start the Backend Server

```bash
cd backend
npm install
npm start
```

You should see: `Server is running on http://localhost:5000`

### 2. Start the Frontend Application

In a new terminal:

```bash
cd frontend
npm install
npm start
```

The app will automatically open at `http://localhost:3000`

## How to Use

### Reporting a Lost Item
1. On the home page, click "📤 Report Lost Item"
2. Fill in all required fields:
   - Your name and email
   - Item name and detailed description
   - Category (Electronics, Jewelry, Clothing, etc.)
   - Location where it was lost
   - Date of loss
   - Optional: Upload an image
3. Click "Report Lost Item"
4. You'll see a success message

### Claiming a Lost Item
1. Click "✋ Claim Lost Item"
2. Browse through available lost items
3. Click "I Found This Item" on the item you found
4. Fill in your information:
   - Your name and email
   - How and where you found it
   - Optional: Contact details
5. Click "Submit Claim"
6. The item owner will contact you

## Available Categories
- Electronics
- Jewelry
- Clothing
- Documents
- Keys
- Bags & Luggage
- Other

## API Testing

To test the API directly, you can use tools like Postman or curl:

```bash
# Get all lost items
curl http://localhost:5000/api/items/lost

# Health check
curl http://localhost:5000/api/health
```

## Database Integration

The app is ready for database integration. To connect your database:

1. Open `backend/server.js`
2. Replace the in-memory arrays with database calls
3. Example databases: MongoDB, PostgreSQL, MySQL, Firebase

## Troubleshooting

**Port Already in Use?**
```bash
# Change backend port in .env
PORT=5001

# Change frontend proxy in package.json
"proxy": "http://localhost:5001"
```

**Dependencies Not Installing?**
```bash
npm cache clean --force
npm install
```

**CORS Errors?**
Make sure the backend is running on `http://localhost:5000`

## File Structure Summary

```
frontend/
├── public/index.html          # HTML entry point
├── src/
│   ├── index.js              # React app entry
│   ├── components/
│   │   ├── App.jsx           # Main component
│   │   ├── UploadItem.jsx    # Upload section
│   │   └── ClaimItem.jsx     # Claim section
│   └── styles/App.css        # All styling

backend/
├── server.js                 # Express server
├── .env                      # Environment variables
└── package.json              # Dependencies
```

## Next Steps

1. **Connect Database**: Modify `backend/server.js` to use your database
2. **Add Authentication**: Implement user login/signup
3. **Email Notifications**: Send emails when claims are submitted
4. **Cloud Storage**: Upload images to AWS S3 or Firebase
5. **Deployment**: Deploy to Heroku, Vercel, or any hosting platform

## Need Help?

Refer to the main README.md for more detailed information about:
- API endpoints
- Data models
- Database integration examples
- Future enhancements

Happy Lost & Finding! 🎉
