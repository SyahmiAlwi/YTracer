# YTracer Backend API

A comprehensive REST API backend for the YTracer YouTube Premium Family Tracker application, built with Node.js, Express, and MongoDB.

## 🚀 Features

- **Complete CRUD Operations** for Members, Transactions, and Cards
- **MongoDB Integration** with Mongoose ODM
- **RESTful API Design** with proper HTTP status codes
- **Data Validation** and error handling
- **Security Features** including CORS, Helmet, and rate limiting
- **Comprehensive Statistics** and analytics endpoints
- **Malaysian Ringgit (RM)** currency support
- **Real-time Balance Tracking** for cards
- **Payment Status Management** with automatic due date calculations

## 📋 Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or cloud)
- npm or yarn

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   cd ytracer/backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp env.example .env
   ```
   
   Edit `.env` file with your configuration:
   ```env
   PORT=5000
   NODE_ENV=development
   MONGODB_URI=mongodb://localhost:27017/ytracer
   CORS_ORIGIN=http://localhost:3000
   ```

4. **Start MongoDB** (if using local MongoDB)
   ```bash
   mongod
   ```

5. **Seed the database** (optional)
   ```bash
   node src/utils/seedData.js
   ```

6. **Start the server**
   ```bash
   npm run dev
   ```

## 📚 API Endpoints

### Members API

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/members` | Get all members with filtering |
| GET | `/api/members/stats` | Get member statistics |
| GET | `/api/members/overdue` | Get overdue members |
| GET | `/api/members/upcoming` | Get upcoming payments |
| POST | `/api/members` | Create new member |
| GET | `/api/members/:id` | Get single member |
| PUT | `/api/members/:id` | Update member |
| PATCH | `/api/members/:id/mark-paid` | Mark member as paid |
| DELETE | `/api/members/:id` | Delete member |

### Transactions API

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/transactions` | Get all transactions with filtering |
| GET | `/api/transactions/stats` | Get transaction statistics |
| GET | `/api/transactions/category/:category` | Get transactions by category |
| POST | `/api/transactions` | Create new transaction |
| GET | `/api/transactions/:id` | Get single transaction |
| PUT | `/api/transactions/:id` | Update transaction |
| DELETE | `/api/transactions/:id` | Delete transaction |
| GET | `/api/transactions/member/:memberId` | Get transactions by member |

### Cards API

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/cards` | Get all cards |
| GET | `/api/cards/expiring` | Get expiring cards |
| POST | `/api/cards` | Create new card |
| GET | `/api/cards/:id` | Get single card |
| PUT | `/api/cards/:id` | Update card |
| DELETE | `/api/cards/:id` | Delete card |
| GET | `/api/cards/:id/stats` | Get card statistics |
| GET | `/api/cards/:id/transactions` | Get card transactions |
| POST | `/api/cards/:id/transactions` | Create card transaction |

### Dashboard API

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/dashboard` | Get comprehensive dashboard data |

### Health Check

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | API health check |

## 🔧 Configuration

### Environment Variables

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/ytracer
MONGODB_URI_PROD=mongodb+srv://username:password@cluster.mongodb.net/ytracer

# CORS Configuration
CORS_ORIGIN=http://localhost:3000

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

## 📊 Data Models

### Member Schema
```javascript
{
  name: String (required),
  paymentType: 'Monthly' | 'Yearly' (required),
  paymentStatus: 'Paid' | 'Unpaid' (required),
  lastPaymentDate: Date (required),
  nextDueDate: Date (required),
  notes: String,
  isOwner: Boolean,
  monthlyAmount: Number,
  yearlyAmount: Number
}
```

### Transaction Schema
```javascript
{
  date: Date (required),
  amount: Number (required),
  memberId: ObjectId (ref: 'Member'),
  description: String (required),
  type: 'Incoming' | 'Outgoing' (required),
  category: String,
  paymentMethod: String,
  status: String,
  receiptNumber: String,
  notes: String
}
```

### CardDetail Schema
```javascript
{
  cardName: String (required),
  lastFourDigits: String (required),
  expiryDate: String (required),
  cardType: String,
  bankName: String,
  cardHolderName: String,
  isActive: Boolean,
  notes: String,
  monthlyLimit: Number,
  currentBalance: Number
}
```

### CardTransaction Schema
```javascript
{
  cardId: ObjectId (ref: 'CardDetail', required),
  date: Date (required),
  amount: Number (required),
  description: String (required),
  type: 'Deposit' | 'Withdrawal' (required),
  category: String,
  status: String,
  referenceNumber: String,
  notes: String,
  balanceAfter: Number (required)
}
```

## 🚀 Scripts

```bash
# Development
npm run dev          # Start development server with nodemon

# Production
npm start           # Start production server
npm run build       # Build for production

# Database
node src/utils/seedData.js  # Seed database with sample data
```

## 🔒 Security Features

- **Helmet.js** for security headers
- **CORS** configuration for cross-origin requests
- **Rate limiting** to prevent abuse
- **Input validation** and sanitization
- **Error handling** with proper HTTP status codes
- **Compression** for response optimization

## 📈 Performance Features

- **Database indexing** for optimal query performance
- **Pagination** support for large datasets
- **Response compression** to reduce bandwidth
- **Efficient aggregation** queries for statistics
- **Connection pooling** for MongoDB

## 🧪 Testing

```bash
npm test            # Run tests
npm run test:watch  # Run tests in watch mode
```

## 📝 API Response Format

### Success Response
```json
{
  "success": true,
  "data": { ... },
  "count": 5,
  "pagination": {
    "page": 1,
    "limit": 10,
    "pages": 3
  }
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error message"
}
```

## 🔗 Integration with Frontend

The backend is designed to work seamlessly with the YTracer frontend. Update your frontend API calls to use these endpoints:

```javascript
// Example API call
const response = await fetch('http://localhost:5000/api/members');
const data = await response.json();
```

## 🚀 Deployment

### Local Development
```bash
npm run dev
```

### Production Deployment
1. Set `NODE_ENV=production`
2. Configure production MongoDB URI
3. Set up environment variables
4. Run `npm start`

### Docker Deployment
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
```

## 📞 Support

For issues and questions:
- Check the API documentation
- Review error logs
- Test endpoints with Postman or similar tools

## 📄 License

MIT License - see LICENSE file for details 