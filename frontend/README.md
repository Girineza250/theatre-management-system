# Theatre Management System - Frontend

A React/Vite frontend application for the Theatre Management System built with modular architecture and DRY principles.

## Project Structure

The project follows a modular structure to promote code reusability and separation of concerns:

```
src/
├── api/                 # API service modules
│   ├── client.js        # Axios instance and interceptors
│   ├── auth.js          # Authentication API
│   ├── movies.js        # Movie-related APIs
│   ├── screenings.js    # Screening-related APIs
│   └── ...
├── assets/              # Static assets (images, icons)
├── components/          # Reusable UI components
│   ├── common/          # Common UI elements (buttons, inputs, etc.)
│   ├── forms/           # Form components
│   ├── layout/          # Layout components
│   └── features/        # Feature-specific components
├── contexts/            # React Context providers
├── hooks/               # Custom React hooks
├── layouts/             # Page layout components 
├── pages/               # Page components
│   ├── public/          # Public pages
│   ├── auth/            # Authentication pages
│   ├── user/            # User pages
│   └── admin/           # Admin pages
├── routes/              # Route configuration
├── services/            # Business logic services
├── utils/               # Utility functions
└── App.jsx              # Main application component
```

## Setup and Installation

1. **Clone the repository**

```bash
git clone <repository-url>
cd theatre-management-system-frontend
```

2. **Install dependencies**

```bash
npm install
```

3. **Start the development server**

```bash
npm run dev
```

4. **Build for production**

```bash
npm run build
```

## Core Tech Stack

- **React**: UI library
- **Vite**: Build tool
- **React Router**: For navigation
- **Axios**: For API requests
- **Tailwind CSS**: For styling
- **React Hook Form**: For form handling
- **Zustand**: For state management
- **React Query**: For data fetching and caching

## Key Features

- Responsive design for all device sizes
- JWT-based authentication
- Role-based access control
- Movie browsing and filtering
- Booking management
- Admin dashboard
- Theatre and screening management

## Development Guidelines

### Component Structure

Each component should:
- Have a single responsibility
- Be reusable where possible
- Include proper prop validation
- Include proper JSDoc comments

### API Calls

All API calls should:
- Use the centralized API client
- Handle loading states
- Handle errors gracefully
- Use React Query for caching

### State Management

- Use React Query for server state
- Use Zustand for global UI state
- Use React Context for theme/auth state
- Use component state for local UI state

## Contributing

1. Create a feature branch from `develop`
2. Implement your changes
3. Submit a pull request to `develop`
4. Ensure CI checks pass

## License

MIT