# ContractZenith 📋✨

> A modern, full-stack contract management platform built with Next.js, TypeScript, and MongoDB featuring automated contract status management, secure file uploads, and comprehensive admin dashboard.

[![Next.js](https://img.shields.io/badge/Next.js-15.3.3-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Latest-green)](https://www.mongodb.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-Latest-38bdf8)](https://tailwindcss.com/)
[![UploadThing](https://img.shields.io/badge/UploadThing-Enabled-orange)](https://uploadthing.com/)

## 🚀 Features

### Core Functionality
- **📝 Contract Management**: Create, edit, delete, and track employment contracts with full CRUD operations
- **👥 User Management**: Role-based access control with separate Admin and User interfaces
- **🔄 Automated Status Updates**: Intelligent contract status calculation with automated daily updates via Vercel Cron
- **📊 Dashboard Analytics**: Real-time contract statistics, charts, and insights with filtering capabilities
- **🔔 Smart Notifications**: Automated alerts for expiring contracts and status changes
- **📤 File Upload System**: Secure document management with UploadThing integration and fallback handling
- **📈 Export Capabilities**: Excel export with custom filtering and column formatting

### Advanced Features
- **🤖 Automated Contract Status Management**: Daily cron jobs automatically update contract statuses based on remaining time
- **🎯 Smart Filtering & Search**: Filter contracts by status, type, employee with URL-based state management
- **📱 Responsive Design**: Mobile-first design with complete dark mode support
- **🔐 Secure Authentication**: JWT-based authentication with automatic session management and cleanup
- **📋 Status History Tracking**: Complete audit trail of all contract status changes with timestamps
- **⚡ Real-time Updates**: Live contract status updates and manual refresh capabilities
- **🔗 Shareable URLs**: Generate direct links to specific user contracts for easy access
- **⚠️ Error Handling**: Comprehensive error handling with retry mechanisms and user feedback

## 🏗️ Tech Stack

### Frontend
- **Framework**: Next.js 15.3.3 with App Router and React 18 Suspense boundaries
- **Language**: TypeScript 5.0 with strict mode enabled
- **Styling**: Tailwind CSS + shadcn/ui component library
- **Forms**: React Hook Form + Zod validation for type-safe form handling
- **State Management**: React Context + Custom Hooks pattern
- **Charts**: Recharts for interactive dashboard visualizations
- **Date Handling**: date-fns for robust date formatting and calculations

### Backend
- **Runtime**: Node.js with Next.js API Routes
- **Database**: MongoDB with Mongoose ODM for schema validation
- **Authentication**: JWT with httpOnly cookies and secure session management
- **File Upload**: UploadThing integration with retry logic and fallback handling
- **Scheduling**: Vercel Cron for automated daily contract status updates
- **Validation**: Zod schemas for runtime type checking

### DevOps & Tools
- **Deployment**: Vercel with automatic deployments (recommended)
- **Package Manager**: npm with lockfile integrity
- **Development**: Turbopack for ultra-fast development server
- **Code Quality**: TypeScript strict mode + ESLint configuration
- **Environment**: Multi-environment support with .env.local

## 📦 Installation

### Prerequisites
- **Node.js** 18+ (LTS recommended)
- **MongoDB** database (local or cloud instance)
- **UploadThing account** for file upload functionality

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
# Database Configuration
MONGODB_URI=your_mongodb_connection_string

# Authentication & Security
JWT_SECRET=your_secure_jwt_secret_key_minimum_32_characters

# File Upload Service (UploadThing)
UPLOADTHING_SECRET=your_uploadthing_secret_key
UPLOADTHING_APP_ID=your_uploadthing_app_id

# Cron Job Security (for automated contract status updates)
CRON_SECRET_TOKEN=your_secure_random_token_for_cron_endpoints

# Optional: Development Configuration
NODE_ENV=development
NEXTAUTH_URL=http://localhost:9002
```

### 4. Database Setup
Ensure your MongoDB instance is running and accessible via the `MONGODB_URI`. The application will automatically create the necessary collections on first run.

### 5. Start Development Server
```bash
npm run dev
```

The application will be available at `http://localhost:9002`

## 🎯 Usage

### For Administrators

#### Dashboard Overview
1. **Login**: Access the admin dashboard with administrator credentials
2. **Analytics Dashboard**: View real-time contract statistics, charts, and system health
3. **Contract Insights**: Monitor contract distribution, expiring contracts, and status trends

#### Contract Management
1. **Create Contracts**: 
   - Assign contracts to employees with role-based selection
   - Upload supporting documents with drag-and-drop interface
   - Set contract types: CDD (Fixed-term), CDI (Permanent), Internship, Terminated
   - Automatic status calculation based on dates
2. **Track & Monitor**:
   - Real-time status updates (Active, Expiring Soon, Expired, Terminated)
   - Filter by status, type, or specific employee
   - Generate shareable URLs for employee access
3. **Document Management**:
   - Secure file upload with UploadThing integration
   - Multiple document support per contract
   - Download and manage contract documents
4. **Export & Reporting**:
   - Export filtered contract data to Excel
   - Custom column formatting and styling
   - Generate reports with current filters applied

#### User Management
1. **Employee Administration**: Add, edit, and manage system users
2. **Role Assignment**: Set user roles (Admin/User) with appropriate permissions
3. **Access Control**: Manage user access to contracts and system features

#### Automated Features
1. **Status Automation**: Contracts automatically update based on remaining time:
   - **Active**: Valid contracts not expiring soon
   - **Expiring Soon**: Contracts expiring within 30 days
   - **Expired**: Contracts past their end date
   - **Terminated**: Manually set status (not changed automatically)
2. **Notifications**: Receive alerts for expiring contracts and status changes
3. **Scheduled Updates**: Daily automated status updates via Vercel Cron

### For Employees

#### Personal Contract Portal
1. **Secure Login**: Access personal contract dashboard with employee credentials
2. **Contract Overview**: View current contract details, status, and remaining time
3. **Document Access**: Download contract-related documents and files
4. **Profile Management**: Update personal contact information and details
5. **Status Tracking**: Monitor contract status changes and history

#### Self-Service Features
1. **Information Updates**: Modify personal contact details independently
2. **Document Downloads**: Access all contract-related files
3. **Status Visibility**: View contract status and important dates
4. **Request Management**: Submit requests for contract actions (coming soon)

## 🔧 Configuration

### Contract Status Automation

The system automatically updates contract statuses based on configurable thresholds:

- **Active**: Contracts currently valid and not expiring soon
- **Expiring Soon**: Contracts expiring within 30 days (configurable)
- **Expired**: Contracts past their end date
- **Terminated**: Manually set status (not changed automatically)

Configure thresholds in `src/lib/contract-status-service.ts`:
```typescript
private static readonly STATUS_THRESHOLDS = {
  EXPIRING_SOON_DAYS: 30, // Days before expiration to mark as "Expiring Soon"
  EXPIRED_GRACE_DAYS: 0,  // Grace period after expiration
};
```

### Cron Jobs Configuration

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

### UploadThing Configuration

File upload settings in `src/lib/uploadthing.ts`:
```typescript
const f = createUploadthing();

export const ourFileRouter = {
  contractUploader: f({ pdf: { maxFileSize: "16MB", maxFileCount: 5 } })
    .middleware(async ({ req }) => {
      // Authentication middleware
      return { userId: "user" };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      // Post-upload processing
      console.log("Upload complete for userId:", metadata.userId);
      console.log("File URL:", file.url);
      return { uploadedBy: metadata.userId };
    }),
};
```

## 📝 API Documentation

### Authentication Endpoints
- `POST /api/users/login` - User login with email/password
- `POST /api/users/logout` - User logout and session cleanup
- `GET /api/auth/status` - Check current authentication status
- `POST /api/auth/refresh` - Refresh JWT token
- `POST /api/auth/cleanup` - Clean expired tokens

### Contract Management API
- `GET /api/contracts` - Fetch contracts with optional filtering
  - Query params: `status`, `type`, `userId`
  - Returns: Paginated contract list with populated employee data
- `POST /api/contracts` - Create new contract
  - Body: Contract data with employee ID, type, dates, documents
- `PUT /api/contracts` - Update existing contract
  - Body: Contract ID and updated fields
- `DELETE /api/contracts` - Delete contract
  - Body: Contract ID

### Automated Status Management
- `POST /api/contracts/status` - Manual status update trigger
  - Returns: Number of contracts updated and change details
- `GET /api/contracts/status?days=N` - Get contracts expiring in N days
  - Returns: List of expiring contracts with employee details
- `POST /api/contracts/cron` - Automated cron endpoint (secured)
  - Headers: `Authorization: Bearer {CRON_SECRET_TOKEN}`
  - Returns: Update summary and execution metrics

### User Management API
- `GET /api/users` - Fetch all users (admin only)
- `POST /api/users` - Create new user
- `PUT /api/users/[id]` - Update user details
- `DELETE /api/users/[id]` - Delete user
- `GET /api/users/me` - Get current user profile
- `PUT /api/users/[id]/password` - Update user password

### Company Management
- `GET /api/company` - Fetch company information
- `POST /api/company` - Create company profile
- `PUT /api/company` - Update company details
- `DELETE /api/company` - Delete company profile

## 🚀 Deployment

### Vercel Deployment (Recommended)

1. **Install Vercel CLI**:
   ```bash
   npm i -g vercel
   ```

2. **Deploy to Vercel**:
   ```bash
   vercel
   ```

3. **Environment Variables**: 
   - Add all environment variables in Vercel dashboard
   - Ensure `CRON_SECRET_TOKEN` is set for automated features
   - Configure `UPLOADTHING_SECRET` and `UPLOADTHING_APP_ID`

4. **Automatic Deployments**: 
   - Connect GitHub repository for automatic deployments
   - Push to main branch triggers production deployment

### Manual Deployment

1. **Build the Application**:
   ```bash
   npm run build
   ```

2. **Start Production Server**:
   ```bash
   npm start
   ```

### Docker Deployment (Optional)

```dockerfile
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000
CMD ["npm", "start"]
```

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication with httpOnly cookies
- **Role-based Access Control**: Separate Admin and User permissions
- **Session Management**: Automatic token cleanup and expiration handling
- **Secure File Upload**: Validated file types, sizes, and secure storage
- **Protected API Routes**: Middleware-based route protection
- **CORS Configuration**: Proper cross-origin resource sharing setup
- **Environment Security**: Secure environment variable handling
- **SQL Injection Prevention**: MongoDB injection protection via Mongoose
- **XSS Protection**: Input sanitization and output encoding

## 🧪 Testing

### Development Testing
```bash
# Type checking
npm run typecheck

# Linting
npm run lint

# Build verification
npm run build
```

### API Testing
```bash
# Test automated status updates
curl -X POST http://localhost:9002/api/contracts/status

# Test cron endpoint (requires auth token)
curl -X POST http://localhost:9002/api/contracts/cron \
  -H "Authorization: Bearer your_secret_token"

# Test contract creation
curl -X POST http://localhost:9002/api/contracts \
  -H "Content-Type: application/json" \
  -d '{"employee": "user_id", "type": "CDI", "startDate": "2024-01-01"}'
```

### Manual Testing Checklist
- [ ] User authentication and authorization
- [ ] Contract CRUD operations
- [ ] File upload and download
- [ ] Automated status updates
- [ ] Dashboard analytics and filtering
- [ ] Mobile responsiveness
- [ ] Dark mode functionality

## 📚 Project Structure

```
contractini/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/               # API routes
│   │   │   ├── auth/          # Authentication endpoints
│   │   │   ├── contracts/     # Contract management API
│   │   │   │   ├── cron/      # Automated status updates
│   │   │   │   └── status/    # Status management
│   │   │   ├── users/         # User management API
│   │   │   ├── company/       # Company profile API
│   │   │   └── uploadthing/   # File upload API
│   │   ├── dashboard/         # Admin dashboard
│   │   │   ├── contracts/     # Contract management UI
│   │   │   ├── users/         # User management UI
│   │   │   └── settings/      # System settings
│   │   ├── my-contract/       # Employee portal
│   │   ├── signup/            # User registration
│   │   ├── layout.tsx         # Root layout
│   │   ├── page.tsx           # Home page
│   │   └── globals.css        # Global styles
│   ├── components/            # React components
│   │   ├── ui/               # shadcn/ui components
│   │   │   ├── button.tsx    # Button component
│   │   │   ├── form.tsx      # Form components
│   │   │   ├── table.tsx     # Table components
│   │   │   └── file-upload.tsx # File upload component
│   │   ├── login-form.tsx    # Login form component
│   │   ├── theme-provider.tsx # Theme management
│   │   └── top-progress-bar.tsx # Progress indicator
│   ├── contexts/             # React contexts
│   │   └── auth-context.tsx  # Authentication context
│   ├── hooks/                # Custom React hooks
│   │   ├── use-contracts.ts  # Contract management hook
│   │   ├── use-user.ts       # User management hook
│   │   ├── use-company.ts    # Company management hook
│   │   └── use-toast.ts      # Toast notification hook
│   ├── lib/                  # Utility libraries
│   │   ├── auth.ts           # Authentication utilities
│   │   ├── dbConnect.ts      # Database connection
│   │   ├── contract-status-service.ts # Contract automation
│   │   ├── uploadthing.ts    # File upload configuration
│   │   └── utils.ts          # General utilities
│   ├── models/               # MongoDB models
│   │   ├── User.ts           # User schema
│   │   ├── Contract.ts       # Contract schema
│   │   ├── Company.ts        # Company schema
│   │   └── auth-token.ts     # Authentication token schema
│   └── types/                # TypeScript definitions
│       └── globals.d.ts      # Global type definitions
├── docs/                     # Documentation
│   └── blueprint.md          # Project blueprint
├── public/                   # Static assets
│   ├── favicon.ico           # Site favicon
│   └── ...                   # Other static files
├── .env.local               # Environment variables (create this)
├── .env.example             # Environment template
├── .gitignore               # Git ignore rules
├── .eslintrc.json           # ESLint configuration
├── components.json          # shadcn/ui configuration
├── next.config.ts           # Next.js configuration
├── tailwind.config.ts       # Tailwind CSS configuration
├── tsconfig.json            # TypeScript configuration
├── vercel.json              # Vercel deployment configuration
├── package.json             # Dependencies and scripts
└── README.md               # Project documentation
```

## 🤝 Contributing

### Development Guidelines
- Follow TypeScript strict mode conventions
- Use conventional commit messages format
- Ensure all components are properly typed
- Add comprehensive error handling for API calls
- Test features in both light and dark modes
- Write meaningful JSDoc comments for complex functions

### Contribution Process
1. **Fork the Repository**
2. **Create Feature Branch**: `git checkout -b feature/amazing-feature`
3. **Make Changes**: Follow coding standards and add tests
4. **Commit Changes**: `git commit -m 'feat: add amazing feature'`
5. **Push to Branch**: `git push origin feature/amazing-feature`
6. **Open Pull Request**: Provide detailed description of changes

### Code Style
- Use TypeScript for all new code
- Follow ESLint configuration
- Use Prettier for code formatting
- Follow React Hook patterns
- Use proper error boundaries

## 📋 Troubleshooting

### Common Issues

#### UploadThing Connection Errors
```bash
# Clear Next.js cache
rm -rf .next
npm run dev

# Check network connectivity
ping sea1.ingest.uploadthing.com

# Verify environment variables
echo $UPLOADTHING_SECRET
```

#### Database Connection Issues
```bash
# Verify MongoDB URI
echo $MONGODB_URI

# Test MongoDB connection
mongosh "your_mongodb_uri"

# Check MongoDB logs
tail -f /var/log/mongodb/mongod.log
```

#### Build Errors
```bash
# Clear node modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear Next.js cache
rm -rf .next

# Type check
npm run typecheck

# Check for disk space issues
df -h
```

#### Authentication Issues
```bash
# Clear browser cookies and local storage
# Check JWT_SECRET environment variable
# Verify token expiration settings
```

### Performance Optimization
- Enable Next.js image optimization
- Use dynamic imports for large components
- Implement proper caching strategies
- Monitor bundle size with `npm run analyze`

## 📖 Documentation

- **[Contract Status Automation Guide](./docs/contract-status-automation.md)** (Coming soon)
- **[UploadThing Integration Guide](./docs/uploadthing-setup.md)** (Coming soon)
- **[API Reference Documentation](./docs/api-reference.md)** (Coming soon)
- **[Deployment Guide](./docs/deployment.md)** (Coming soon)
- **[Contributing Guidelines](./docs/contributing.md)** (Coming soon)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Team

- **Lead Developer**: [Khalil Chouchen](https://github.com/khalilchouchen112)
- **Project Type**: Full-stack contract management platform
- **Development Period**: 2024

## 🙏 Acknowledgments

- **[Next.js](https://nextjs.org/)** - The React framework for production
- **[shadcn/ui](https://ui.shadcn.com/)** - Beautiful and accessible UI components
- **[Tailwind CSS](https://tailwindcss.com/)** - Utility-first CSS framework
- **[Vercel](https://vercel.com/)** - Deployment and hosting platform
- **[UploadThing](https://uploadthing.com/)** - File upload solution
- **[MongoDB](https://www.mongodb.com/)** - Database platform
- **[TypeScript](https://www.typescriptlang.org/)** - Type-safe JavaScript

## 🌟 Key Features Showcase

### Automated Contract Management
- **Smart Status Updates**: Contracts automatically transition between Active → Expiring Soon → Expired
- **Cron Integration**: Daily automated updates via Vercel Cron at midnight
- **Audit Trail**: Complete history of all status changes with timestamps and reasons

### Advanced UI/UX
- **Responsive Design**: Mobile-first approach with tablet and desktop optimization
- **Dark Mode Support**: Complete theme switching with persistent preference
- **Real-time Filtering**: URL-based state management for shareable filtered views
- **Excel Export**: Custom formatted exports with filtered data

### Security & Performance
- **JWT Authentication**: Secure session management with automatic cleanup
- **Role-based Access**: Granular permissions for Admin and User roles
- **File Upload Security**: Type validation, size limits, and secure storage
- **Error Handling**: Comprehensive error boundaries and user feedback

---

<div align="center">
  <p>Built with ❤️ using modern web technologies</p>
  <p>
    <a href="#contractzenith-">⬆️ Back to Top</a>
  </p>
</div>
