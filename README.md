# Lost & Found Website

A full-stack web application for reporting and claiming lost items. Users can upload lost items with details and others can claim items they've found.

## Features

### 📤 Upload Lost Item Section
- Report a lost item with your name and email
- Provide detailed information (item name, description, category)
- Specify the location and date of loss
- Upload an image of the lost item
- Real-time feedback on submission

### ✋ Claim Lost Item Section
- Browse all active lost items
- View item details, images, and owner information
- Submit a claim with your details
- Explain where and how you found the item
- Direct contact information for coordination

## Tech Stack

- **Frontend**: React, JSX, HTML, CSS, JavaScript
- **Backend**: Node.js, Express.js
- **API Communication**: Axios
- **Database**: (To be implemented by user - ready for integration)

## Project Structure

```
LOST_FOUND/
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/
│   │   │   ├── App.jsx
│   │   │   ├── UploadItem.jsx
│   │   │   └── ClaimItem.jsx
│   │   ├── styles/
│   │   │   └── App.css
│   │   └── index.js
│   └── package.json
├── backend/
│   ├── server.js
│   ├── .env
│   └── package.json
└── README.md
```

## Setup Instructions

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Start the server:
```bash
npm start
```
or for development with auto-reload:
```bash
npm run dev
```

The server will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

The app will run on `http://localhost:3000`

### 🔐 Email Configuration (OTP Authentication)

To enable OTP-based email authentication:

1. **Copy `.env.example` to `.env`:**
```bash
cd backend
cp .env.example .env
```

2. **Configure Email Service (Gmail Example):**
   - Go to [Google Account Settings](https://myaccount.google.com/)
   - Enable "2-Step Verification"
   - Go to [App Passwords](https://myaccount.google.com/apppasswords)
   - Select "Mail" and "Windows Computer"
   - Copy the generated 16-character password
   - Update your `.env` file:
     ```
     MAIL_SERVICE=gmail
     MAIL_USER=your-email@gmail.com
     MAIL_PASSWORD=xxxxxxxxxxxxxxxx
     MAIL_FROM=your-email@gmail.com
     ```

3. **For Other Email Providers:**
   - **Outlook**: Set `MAIL_SERVICE=outlook`
   - **Custom SMTP**: Configure `MAIL_HOST`, `MAIL_PORT`, `MAIL_SECURE`

### 📧 Authentication Flow

1. User enters their NIE email (`@nie.ac.in`)
2. Server sends OTP via email (valid for 10 minutes)
3. User enters OTP in the verification form
4. Upon successful verification, user receives JWT token and is logged in

**API Endpoints:**
- `POST /api/auth/send-otp` - Request OTP (email required)
- `POST /api/auth/verify-otp` - Verify OTP and login (email + OTP required)

## API Endpoints

### Lost Items

- **GET** `/api/items/lost` - Get all lost items
- **POST** `/api/items/lost` - Upload a new lost item
- **GET** `/api/items/lost/:id` - Get specific lost item
- **PUT** `/api/items/lost/:id` - Update item status
- **GET** `/api/items/lost/:id/claims` - Get claims for an item

### Claims

- **GET** `/api/items/claims` - Get all claims
- **POST** `/api/items/claim` - Submit a claim for a lost item

## Data Models

### Lost Item
```javascript
{
  id: string (UUID),
  type: 'lost',
  name: string,
  email: string,
  itemName: string,
  description: string,
  category: string,
  location: string,
  dateOfLoss: date,
  image: base64 or null,
  postedDate: date,
  status: 'active' | 'claimed' | 'resolved'
}
```

### Claim
```javascript
{
  id: string (UUID),
  type: 'claim',
  name: string,
  email: string,
  lostItemId: string,
  description: string,
  contactDetails: string,
  claimDate: date,
  status: 'pending' | 'approved' | 'rejected'
}
```

## Features Implementation

### User Input Validation
- All required fields are validated on both frontend and backend
- Email format validation
- Date validation for lost items

### Error Handling
- User-friendly error messages
- Success notifications
- Loading states during API calls

### Responsive Design
- Mobile-friendly interface
- Adaptive grid layout
- Touch-friendly buttons and forms

## Database Integration

Currently, the backend uses in-memory storage. To integrate a database:

1. **Replace in-memory arrays** in `backend/server.js`:
   - `lostItems` array → Database collection
   - `claimedItems` array → Database collection

2. **Modify API endpoints** to use database queries instead of array operations

3. **Supported databases**: MongoDB, PostgreSQL, MySQL, Firebase, etc.

Example database integration points:
```javascript
// Replace this:
const item = lostItems.find(i => i.id === req.params.id);

// With this (MongoDB example):
const item = await LostItem.findById(req.params.id);
```

## Future Enhancements

- User authentication and profiles
- Email notifications when claims are submitted
- Image upload to cloud storage (AWS S3, Firebase Storage)
- Admin dashboard for moderation
- Search and filter functionality
- Messaging system between users
- Success stories and testimonials
- Mobile app using React Native

## Usage Example

1. **Report a Lost Item**:
   - Click "Report Lost Item"
   - Fill in your details and item information
   - Upload an image if available
   - Submit to make it visible to others

2. **Claim a Lost Item**:
   - Click "Claim Lost Item"
   - Browse available lost items
   - Click "I Found This Item" on any item
   - Submit your information and how you found it
   - Wait for the item owner to contact you

## Support

For issues or questions, contact the development team or refer to the API documentation above.

## License

MIT License - Feel free to modify and use as needed.

---

**Created**: April 2026
**Last Updated**: April 2026
