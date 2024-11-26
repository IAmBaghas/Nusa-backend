# Nusa School Website Backend

A robust Node.js/Express backend service that powers the Nusa School Website, providing comprehensive API endpoints for content management and data handling.

## 🚀 Features

### 🔐 Authentication & Authorization
- JWT-based authentication system
- Role-based access control (Admin, Editor)
- Secure password hashing
- Token refresh mechanism

### 📝 Content Management APIs
- **Website Settings Management**
  - Header/Footer configuration
  - Banner management
  - Logo settings
  - About section content
  - School profile information

- **Posts & News Management**
  - CRUD operations for posts
  - Categories management
  - Comments moderation
  - Rich text content storage
  - Image upload handling

- **Gallery Management**
  - Image upload and storage
  - Album organization
  - Image optimization
  - Metadata management

- **Event Management**
  - Calendar events CRUD
  - Date-based filtering
  - Recurring events support
  - Event categories

### 🗃️ Database Structure
- MySQL/MariaDB with structured schemas
- Optimized queries and indexing
- Relationship management
- Data validation

### 📁 File Management
- Secure file upload system
- Image processing and optimization
- File type validation
- Storage management

## 🛠️ Technical Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MySQL/MariaDB
- **ORM**: Sequelize
- **Authentication**: JWT
- **File Upload**: Multer
- **Image Processing**: Sharp
- **Validation**: Express-validator
- **Documentation**: Swagger/OpenAPI

## 📚 API Documentation

### Main Endpoints

#### Authentication
- POST `/auth/login` - User login
- POST `/auth/refresh` - Refresh token
- POST `/auth/logout` - User logout

#### Website Settings
- GET `/web-settings/component/:name` - Get component settings
- PUT `/web-settings/component/:name` - Update component settings

#### Posts Management
- GET `/posts` - Get all posts
- POST `/posts` - Create new post
- PUT `/posts/:id` - Update post
- DELETE `/posts/:id` - Delete post

#### Gallery Management
- GET `/gallery` - Get all galleries
- POST `/gallery` - Create new gallery
- PUT `/gallery/:id` - Update gallery
- DELETE `/gallery/:id` - Delete gallery

#### Event Management
- GET `/events` - Get all events
- POST `/events` - Create new event
- PUT `/events/:id` - Update event
- DELETE `/events/:id` - Delete event

## 🔒 Security Measures

- CORS configuration
- Rate limiting
- XSS protection
- SQL injection prevention
- Input validation
- File upload restrictions

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.
