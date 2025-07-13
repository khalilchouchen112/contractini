# ContractZenith 📋✨

> A modern, full-stack contract management platform built with Next.js, TypeScript, and MongoDB.

[![Next.js](https://img.shields.io/badge/Next.js-15.3.3-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Latest-green)](https://www.mongodb.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-Latest-38bdf8)](https://tailwindcss.com/)

## 🚀 Features

### Core Functionality
- **📝 Contract Management**: Create, edit, delete, and track employment contracts
- **👥 User Management**: Admin and user role-based access control
- **🔄 Automated Status Updates**: Smart contract status calculation with cron jobs
- **📊 Dashboard Analytics**: Real-time contract statistics and insights
- **🔔 Smart Notifications**: Automated alerts for expiring contracts
- **📤 File Upload**: Secure document management with UploadThing integration
- **📈 Export Capabilities**: Excel export with filtering options

### Advanced Features
- **🤖 Automated Contract Status Management**: Daily cron jobs update contract statuses
- **🎯 Smart Filtering**: Filter contracts by status, type, and employee
- **📱 Responsive Design**: Mobile-first design with dark mode support
- **🔐 Secure Authentication**: JWT-based authentication with session management
- **📋 Status History Tracking**: Complete audit trail of status changes
- **⚡ Real-time Updates**: Live contract status updates and notifications

## 🏗️ Tech Stack

### Frontend
- **Framework**: Next.js 15.3.3 with App Router
- **Language**: TypeScript 5.0
- **Styling**: Tailwind CSS + shadcn/ui components
- **Forms**: React Hook Form + Zod validation
- **State Management**: React Context + Custom Hooks
- **Charts**: Recharts for data visualization

### Backend
- **Runtime**: Node.js with Next.js API Routes
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT with secure session management
- **File Upload**: UploadThing integration
- **Scheduling**: Vercel Cron for automated tasks

### DevOps & Tools
- **Deployment**: Vercel (recommended)
- **Package Manager**: npm
- **Development**: Turbopack for fast development
- **Code Quality**: TypeScript strict mode

## 📦 Installation

### Prerequisites
- Node.js 18+ 
- MongoDB database
- UploadThing account (for file uploads)

### 1. Clone the Repository
```bash
git clone https://github.com/khalilchouchen112/contractini.git
cd contractini
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Setup
Create a `.env.local` file in the root directory:

```env
# Database
MONGODB_URI=your_mongodb_connection_string

# Authentication
JWT_SECRET=your_jwt_secret_key

# File Upload (UploadThing)
UPLOADTHING_SECRET=your_uploadthing_secret
UPLOADTHING_APP_ID=your_uploadthing_app_id

# Cron Job Security (for automated contract status updates)
CRON_SECRET_TOKEN=your_secure_random_token

# Optional: Development
NODE_ENV=development
```

### 4. Database Setup
Ensure your MongoDB instance is running and accessible via the `MONGODB_URI`.

### 5. Start Development Server
```bash
npm run dev
```

The application will be available at `http://localhost:9002`

## 🎯 Usage

### For Administrators

1. **Login**: Use admin credentials to access the dashboard
2. **Dashboard**: View contract statistics and system overview
3. **Contract Management**: 
   - Create new contracts with employee assignment
   - Upload contract documents
   - Set contract types (CDD, CDI, Internship)
   - Track contract statuses automatically
4. **User Management**: Add, edit, and manage system users
5. **Automated Features**:
   - Contracts automatically update status based on dates
   - Receive notifications for expiring contracts
   - Export contract data to Excel

### For Employees

1. **Login**: Access personal contract dashboard
2. **View Contract**: See current contract details and status
3. **Update Information**: Modify personal contact details
4. **Download Documents**: Access contract-related files
5. **Request Actions**: Submit renewal or termination requests

## 🔧 Configuration

### Contract Status Automation

The system automatically updates contract statuses based on:
- **Active**: Contracts currently valid and not expiring soon
- **Expiring Soon**: Contracts expiring within 30 days
- **Expired**: Contracts past their end date
- **Terminated**: Manually set status (not changed automatically)

Configure thresholds in `src/lib/contract-status-service.ts`:
```typescript
private static readonly STATUS_THRESHOLDS = {
  EXPIRING_SOON_DAYS: 30, // Change this value
  EXPIRED_GRACE_DAYS: 0,
};
```

### Cron Jobs

Automated status updates run daily at midnight via Vercel Cron.
Configure schedule in `vercel.json`:
```json
{
  "crons": [
    {
      "path": "/api/contracts/cron",
      "schedule": "0 0 * * *"
    }
  ]
}
```

## 📝 API Documentation

### Authentication Endpoints
- `POST /api/users/login` - User login
- `POST /api/users/logout` - User logout
- `GET /api/auth/status` - Check auth status

### Contract Management
- `GET /api/contracts` - Fetch contracts (with filtering)
- `POST /api/contracts` - Create new contract
- `PUT /api/contracts/[id]` - Update contract
- `DELETE /api/contracts/[id]` - Delete contract

### Automated Status Management
- `POST /api/contracts/status` - Manual status update
- `GET /api/contracts/status?days=N` - Get expiring contracts
- `POST /api/contracts/cron` - Automated cron endpoint

### User Management
- `GET /api/users` - Fetch users
- `POST /api/users` - Create user
- `PUT /api/users/[id]` - Update user
- `DELETE /api/users/[id]` - Delete user

## 🚀 Deployment

### Vercel Deployment (Recommended)

1. **Connect Repository**:
   ```bash
   # Install Vercel CLI
   npm i -g vercel
   
   # Deploy
   vercel
   ```

2. **Environment Variables**: Add all environment variables in Vercel dashboard

3. **Automatic Deployments**: Push to main branch for automatic deployments

### Manual Deployment

1. **Build the Application**:
   ```bash
   npm run build
   ```

2. **Start Production Server**:
   ```bash
   npm start
   ```

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Role-based Access**: Admin and user role separation
- **Session Management**: Automatic token cleanup and validation
- **Secure File Upload**: Validated file types and sizes
- **Protected Routes**: Middleware-based route protection
- **CORS Configuration**: Proper cross-origin resource sharing

## 🧪 Testing

```bash
# Run type checking
npm run typecheck

# Run linting
npm run lint

# Manual API testing
# Test automated status updates
curl -X POST http://localhost:9002/api/contracts/status

# Test cron endpoint (requires auth token)
curl -X POST http://localhost:9002/api/contracts/cron \
  -H "Authorization: Bearer your_secret_token"
```

## 📚 Project Structure

```
contractini/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/               # API routes
│   │   ├── dashboard/         # Admin dashboard
│   │   ├── my-contract/       # Employee portal
│   │   └── globals.css        # Global styles
│   ├── components/            # React components
│   │   ├── ui/               # shadcn/ui components
│   │   └── ...               # Custom components
│   ├── contexts/             # React contexts
│   ├── hooks/                # Custom React hooks
│   ├── lib/                  # Utility libraries
│   ├── models/               # MongoDB models
│   └── types/                # TypeScript definitions
├── docs/                     # Documentation
├── public/                   # Static assets
├── vercel.json              # Vercel configuration
├── package.json             # Dependencies
└── README.md               # Project documentation
```

## 🤝 Contributing

1. **Fork the Repository**
2. **Create Feature Branch**: `git checkout -b feature/amazing-feature`
3. **Commit Changes**: `git commit -m 'Add amazing feature'`
4. **Push to Branch**: `git push origin feature/amazing-feature`
5. **Open Pull Request**

### Development Guidelines
- Follow TypeScript strict mode
- Use conventional commit messages
- Ensure components are properly typed
- Add error handling for API calls
- Test features in both light and dark modes

## 📋 Troubleshooting

### Common Issues

#### UploadThing Connection Errors
```bash
# Clear Next.js cache
rm -rf .next
npm run dev

# Check network connectivity
ping sea1.ingest.uploadthing.com
```

#### Database Connection Issues
```bash
# Verify MongoDB URI
echo $MONGODB_URI

# Test connection
mongosh "your_mongodb_uri"
```

#### Build Errors
```bash
# Clear node modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Type check
npm run typecheck
```

## 📖 Documentation

- **[Contract Status Automation Guide](./docs/contract-status-automation.md)**
- **[UploadThing Troubleshooting](./docs/uploadthing-troubleshooting.md)**
- **[API Reference](./docs/api-reference.md)** (Coming soon)
- **[Deployment Guide](./docs/deployment.md)** (Coming soon)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Team

- **Developer**: [Khalil Chouchen](https://github.com/khalilchouchen112)

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - The React framework
- [shadcn/ui](https://ui.shadcn.com/) - Beautiful UI components
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- [Vercel](https://vercel.com/) - Deployment and hosting platform
- [UploadThing](https://uploadthing.com/) - File upload solution

---

<div align="center">
  <p>Built with ❤️ by the ContractZenith Team</p>
  <p>
    <a href="#contractzenith-">⬆️ Back to Top</a>
  </p>
</div>
