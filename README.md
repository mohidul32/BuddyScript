# Buddy Script

A full-stack social media application built with **Django** (backend), **React** (frontend) and **MySQL** (database) featuring authentication, feeds, posts, comments, likes, and more.

---

## Frontend: Implement Auth, Feed, Post, and Comment functionality

- Added React context for authentication (login, register, logout)  
- Created private route handling for protected pages  
- Implemented Login and Register pages with form validation  
- Developed Feed page with infinite scrolling, post creation, and likes/comments  
- Built reusable Post and Comment components supporting nested replies and likes  
- Integrated API service using Axios with token handling and refresh  
- Added CreatePost component with image upload and visibility settings  
- Added UI components and styles following HTML template  

---

## Authentication & Authorization

- JWT-based secure authentication  
- User registration with first name, last name, email, password  
- Protected routes for logged-in users only  

---

## Feed Page

- Create posts with text and images  
- Public/Private visibility controls  
- Posts sorted by newest first  
- Like/Unlike functionality with visual feedback  
- View who liked each post  

---

## Comments & Replies

- Comment on posts  
- Reply to comments (nested structure)  
- Like/Unlike comments and replies  
- View who liked comments/replies  
- Edit/Delete own comments  

---

## Security & Performance

- Password hashing and validation  
- Database indexing for millions of posts  
- Query optimization to prevent N+1 problems  
- XSS and SQL injection protection  
- CORS configuration  

---

## Quick Start

```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver

cd frontend
npm install
npm start
