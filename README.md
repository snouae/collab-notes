# 🚀 CollabNotes - Collaborative Note Management Application

A modern web application for collaborative note-taking with authentication, search, filtering, and sharing capabilities.

## ✨ Features

### Core Functionality
- **🔐 JWT Authentication** - Secure user authentication with bcrypt hashing
- **📝 Note Management** - Create, read, update, delete notes with Markdown support
- **🔍 Search & Filtering** - Search by title/content/tags and filter by visibility
- **🤝 Collaborative Sharing** - Share notes with other users (read-only access)
- **🌐 Public Links** - Generate public links for anonymous note access
- **👁️ Visibility Control** - Private, shared, and public notes
- **🏷️ Tag System** - Organize notes with custom tags

### User Experience
- **✨ Smooth Animations** - Framer Motion transitions and animations
- **🎨 Modern Design** - Elegant UI with gradients and glassmorphism effects
- **📱 Responsive Design** - Optimized for desktop, tablet, and mobile
- **🌙 Dark/Light Mode** - Adaptive theme with smooth transitions

## 🚀 Quick Start

### Prerequisites
- Docker and Docker Compose
- Git

### Setup
```bash
# Clone the repository
git clone <repository-url>
cd collab-notes

# Start the application
docker compose up

# Access the application
# Frontend: http://localhost:3000
# Backend API: http://localhost:8000
# API Docs: http://localhost:8000/docs
```

### Test Account
- **Email**: `test@example.com`
- **Password**: `password123`

## 🏗️ Technology Stack

- **Frontend**: Next.js 14, React 18, TypeScript, Tailwind CSS
- **Backend**: FastAPI, Python 3.12, SQLAlchemy, Alembic
- **Database**: PostgreSQL 14
- **Authentication**: JWT, bcrypt
- **Animations**: Framer Motion
- **Containerization**: Docker, Docker Compose

## 📚 API Endpoints

### Authentication
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Notes
- `GET /api/notes/` - List user's notes
- `POST /api/notes/` - Create note
- `GET /api/notes/{id}` - Get note
- `PUT /api/notes/{id}` - Update note
- `DELETE /api/notes/{id}` - Delete note
- `POST /api/notes/{id}/share` - Share note

### Public Links
- `POST /api/notes/{id}/public-link` - Generate public link
- `DELETE /api/notes/{id}/public-link` - Revoke public link
- `GET /api/public/notes/{token}` - Access public note

### User Settings
- `GET /api/users/me` - Get profile
- `PUT /api/users/profile` - Update profile
- `PUT /api/users/password` - Change password
- `DELETE /api/users/account` - Delete account

## 🎯 Key Features Demo

### Note Sharing
1. Login with `test@example.com`
2. Create a new note
3. Click "Share" and enter another user's email
4. User sees the note in their list (read-only)

### Public Links
1. Open an existing note
2. Click "Generate public link"
3. Copy and share the link
4. Accessible without authentication

### Search and Filtering
1. Use search bar to find notes
2. Filter by visibility (Private/Shared/Public)
3. Select tags to refine results
4. Sort by date, title, or visibility

## 🔧 Manual Installation

### Backend Setup
```bash
cd backend
python -m venv env
source env/bin/activate  # Windows: env\Scripts\activate
pip install -r requirements.txt

# Create .env file
DATABASE_URL=postgresql://username:password@localhost:5432/collabnotes
SECRET_KEY=your-secret-key
DEBUG=true

# Initialize database
alembic upgrade head
python main.py
```

### Frontend Setup
```bash
cd frontend
npm install

# Create .env.local
NEXT_PUBLIC_API_URL=http://localhost:8000

# Start application
npm run dev
```

## 📁 Project Structure
```
collab-notes/
├── backend/                 # FastAPI backend
│   ├── app/
│   │   ├── api/            # API routes
│   │   ├── core/           # Configuration
│   │   ├── db/             # Database
│   │   ├── models/         # SQLAlchemy models
│   │   ├── schemas/        # Pydantic schemas
│   │   └── services/       # Business logic
│   ├── alembic/            # Migrations
│   └── requirements.txt    # Dependencies
├── frontend/               # Next.js application
│   ├── app/               # Pages and layouts
│   ├── components/        # React components
│   ├── store/            # State management
│   └── package.json      # Dependencies
└── docker-compose.yml    # Docker configuration
```

## 🔒 Security Features

- **JWT Authentication** - Secure token-based authentication
- **Password Hashing** - Bcrypt hashing for passwords
- **CORS Protection** - Cross-origin request protection
- **Input Validation** - Strict validation with Pydantic
- **SQL Injection Protection** - ORM-based protection

## 🎨 Design Features

- **Responsive Design** - Mobile-first approach
- **Dark/Light Theme** - Adaptive theme switching
- **Smooth Animations** - Framer Motion animations
- **Modern UI** - Glassmorphism and gradient effects
- **Intuitive UX** - Clear navigation and interactions

## 🧪 Testing Instructions

### Quick Test with Docker
```bash
# Start the application
docker compose up -d

# Wait for services to be ready (about 30 seconds)
# Then access: http://localhost:3000
```

### Manual Testing Steps

#### 1. **Authentication Testing**
```bash
# Test Registration
1. Go to http://localhost:3000/register
2. Create a new account with email and password
3. Verify you're redirected to dashboard

# Test Login
1. Go to http://localhost:3000/login
2. Login with test account: test@example.com / password123
3. Verify successful login and dashboard access
```

#### 2. **Note Management Testing**
```bash
# Create Note
1. Click "Nouvelle note" on dashboard
2. Fill in title, content, and tags
3. Select visibility (Private/Shared/Public)
4. Click "Enregistrer"
5. Verify note appears in notes list

# Edit Note
1. Click on any note in the list
2. Click "Modifier" button
3. Update title, content, or tags
4. Save changes
5. Verify updates are reflected

# Delete Note
1. Go to notes list
2. Click "Supprimer" on any note
3. Confirm deletion
4. Verify note is removed from list
```

#### 3. **Search and Filtering Testing**
```bash
# Search Functionality
1. Go to notes list
2. Use search bar to search by title or content
3. Verify relevant notes are displayed

# Filter by Visibility
1. Use visibility filter dropdown
2. Select "Privé", "Partagé", or "Public"
3. Verify only notes with selected visibility are shown

# Filter by Tags
1. Select tags from the tag filter
2. Verify only notes with selected tags are shown

# Sort Notes
1. Use sort dropdown to sort by date, title, or visibility
2. Verify notes are properly sorted
```

#### 4. **Sharing Testing**
```bash
# Share Note with User
1. Open any note
2. Click "Partager" button
3. Enter another user's email
4. Verify success message
5. Login with other user account
6. Verify shared note appears in their list (read-only)

# Test Read-Only Access
1. Login with user who received shared note
2. Try to edit the shared note
3. Verify edit button is not available
4. Verify note content is visible but not editable
```

#### 5. **Public Links Testing**
```bash
# Generate Public Link
1. Open any note
2. Click "Générer un lien public"
3. Copy the generated link
4. Open link in incognito/private browser
5. Verify note is accessible without login

# Revoke Public Link
1. Go back to note in logged-in browser
2. Click "Révoquer le lien public"
3. Try to access the link again
4. Verify access is denied
```

#### 6. **User Settings Testing**
```bash
# Profile Update
1. Go to Settings (Paramètres)
2. Update name, email, or profile picture
3. Save changes
4. Verify updates are reflected

# Password Change
1. Go to Settings > Password tab
2. Enter current password and new password
3. Save changes
4. Logout and login with new password
5. Verify login works

# Account Deletion
1. Go to Settings > Account tab
2. Enter password and confirm deletion
3. Verify account is deleted and redirected to login
```

### API Testing

#### Test with Swagger UI
```bash
# Access API Documentation
1. Go to http://localhost:8000/docs
2. Test endpoints directly from the interface

# Test Authentication Endpoints
1. POST /api/auth/register - Create new user
2. POST /api/auth/login - Login user
3. GET /api/auth/me - Get current user info

# Test Note Endpoints
1. GET /api/notes/ - List notes
2. POST /api/notes/ - Create note
3. PUT /api/notes/{id} - Update note
4. DELETE /api/notes/{id} - Delete note
```

#### Test with curl
```bash
# Register new user
curl -X POST "http://localhost:8000/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test2@example.com","password":"password123"}'

# Login
curl -X POST "http://localhost:8000/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Get notes (use token from login response)
curl -X GET "http://localhost:8000/api/notes/" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Database Testing
```bash
# Connect to PostgreSQL
docker compose exec postgres psql -U collabnotes_user -d collabnotes

# Check tables
\dt

# Check users
SELECT * FROM users;

# Check notes
SELECT * FROM notes;


### Frontend Testing
```bash
# Run frontend tests
cd frontend
npm test

# Check for linting errors
npm run lint

# Build for production
npm run build
```

### Backend Testing
```bash
# Run backend tests
cd backend
pytest

# Check for type errors
mypy app/

# Run linting
flake8 app/
```

## 🔧 Installation & Test Checklist

### ✅ Prerequisites Check
- [ ] Docker and Docker Compose installed
- [ ] Git installed
- [ ] Ports 3000, 8000, and 5433 available

### ✅ Installation Check
- [ ] Repository cloned successfully
- [ ] Docker containers started without errors
- [ ] Frontend accessible at http://localhost:3000
- [ ] Backend API accessible at http://localhost:8000
- [ ] Database connected and migrations applied

### ✅ Functionality Test
- [ ] User registration works
- [ ] User login works
- [ ] Note creation works
- [ ] Note editing works
- [ ] Note deletion works
- [ ] Search functionality works
- [ ] Filtering works
- [ ] Note sharing works
- [ ] Public links work
- [ ] User settings work

### ✅ API Test
- [ ] Swagger UI accessible
- [ ] All endpoints respond correctly
- [ ] Authentication works
- [ ] Data validation works

---

**Built with modern web technologies for collaborative note-taking**

