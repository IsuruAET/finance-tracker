# Finance Tracker

A full-stack personal finance management application built with React, TypeScript, and Node.js. Track your income and expenses, visualize your financial data with interactive charts, and manage your finances with ease.

## 🌐 Live Demo

**🔗 [View Live Application](https://finance-tracker-frontend-kappa.vercel.app)**

## ✨ Features

- 🔐 **User Authentication** - Secure login and registration with JWT
- 💰 **Income Management** - Add, view, and delete income transactions
- 💸 **Expense Tracking** - Track and categorize your expenses
- 📊 **Dashboard Analytics** - Visualize your financial data with interactive charts
- 📈 **Financial Overview** - View total income, expenses, and balance
- 📅 **Transaction History** - Browse recent income and expense transactions
- 📥 **Excel Export** - Download your income and expense data as Excel files
- 🖼️ **Profile Management** - Upload and manage your profile picture
- 📱 **Responsive Design** - Works seamlessly on desktop and mobile devices

## 🛠️ Tech Stack

### Frontend

- **React 19** - Modern React with latest features
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool and dev server
- **TailwindCSS** - Utility-first CSS framework
- **Recharts** - Beautiful charts and data visualization
- **React Router** - Client-side routing
- **Axios** - HTTP client for API requests
- **React Hot Toast** - Elegant notifications

### Backend

- **Node.js** - JavaScript runtime
- **Express** - Web framework
- **TypeScript** - Type-safe backend development
- **MongoDB** - NoSQL database with Mongoose ODM
- **JWT** - JSON Web Tokens for authentication
- **Bcrypt** - Password hashing
- **AWS S3** - Image storage (via multer-s3)
- **ExcelJS** - Excel file generation

### DevOps

- **Turborepo** - Monorepo build system
- **Nodemon** - Development server auto-reload

## 📁 Project Structure

```
finance-tracker/
├── frontend/          # React frontend application
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Page components
│   │   ├── context/       # React context providers
│   │   ├── hooks/         # Custom React hooks
│   │   ├── utils/         # Utility functions
│   │   └── types/         # TypeScript type definitions
│   └── package.json
├── backend/           # Node.js backend API
│   ├── src/
│   │   ├── config/        # Database configuration
│   │   ├── controllers/   # Route controllers
│   │   ├── models/        # Mongoose models
│   │   ├── routes/        # API routes
│   │   └── middleware/    # Express middleware
│   └── package.json
└── package.json       # Root package.json (monorepo)
```

## 🚀 Getting Started

### Prerequisites

- **Node.js** >= 18.0.0
- **npm** >= 10.0.0
- **MongoDB** database (local or cloud instance)
- **AWS S3** account (for image uploads)

### Installation

1. **Clone the repository**

```bash
git clone https://github.com/IsuruAET/finance-tracker.git
cd finance-tracker
```

2. **Install dependencies**

```bash
npm install
```

3. **Set up environment variables**

Create a `.env` file in the `backend` directory:

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
CLIENT_URL=http://localhost:5173
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_BUCKET_NAME=your_s3_bucket_name
AWS_REGION=your_aws_region
```

Create a `.env` file in the `frontend` directory:

```env
VITE_API_URL=http://localhost:5000
```

4. **Run the development servers**

From the root directory:

```bash
npm run dev
```

This will start both frontend and backend servers:

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:5000`

### Build for Production

```bash
npm run build
```

This builds both frontend and backend for production.

### Run Production Build

```bash
npm start
```

## 📝 Available Scripts

### Root Level (Monorepo)

- `npm run dev` - Start both frontend and backend in development mode
- `npm run build` - Build both frontend and backend for production
- `npm start` - Start production servers
- `npm run lint` - Run linting on all packages
- `npm run clean` - Clean build artifacts

### Frontend

- `npm run dev` - Start Vite dev server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Backend

- `npm run dev` - Start development server with nodemon
- `npm run build` - Compile TypeScript to JavaScript
- `npm start` - Start production server
- `npm run clean` - Remove dist directory

## 🔌 API Endpoints

### Authentication

- `POST /api/v1/auth/register` - Register a new user
- `POST /api/v1/auth/login` - Login user
- `GET /api/v1/auth/getUser` - Get current user info
- `POST /api/v1/auth/uploadImage` - Upload profile picture

### Income

- `POST /api/v1/income/add` - Add income transaction
- `GET /api/v1/income/get` - Get all income transactions
- `DELETE /api/v1/income/:id` - Delete income transaction
- `GET /api/v1/income/downloadExcel` - Download income as Excel

### Expense

- `POST /api/v1/expense/add` - Add expense transaction
- `GET /api/v1/expense/get` - Get all expense transactions
- `DELETE /api/v1/expense/:id` - Delete expense transaction
- `GET /api/v1/expense/downloadExcel` - Download expenses as Excel

### Dashboard

- `GET /api/v1/dashboard` - Get dashboard statistics and data

## 🎨 Features Overview

### Dashboard

- Real-time financial overview (total income, expenses, balance)
- Interactive charts for expense trends
- Recent transactions list
- Category-based expense breakdown

### Income Management

- Add income with amount, description, and date
- View all income transactions in a list
- Delete income entries
- Export income data to Excel

### Expense Management

- Add expenses with amount, category, description, and date
- Categorize expenses with emoji icons
- View all expense transactions
- Delete expense entries
- Export expense data to Excel

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👤 Author

**Your Name**

- GitHub: [@IsuruAET](https://github.com/IsuruAET)

## 🙏 Acknowledgments

- Icons provided by [React Icons](https://react-icons.github.io/react-icons/)
- Charts powered by [Recharts](https://recharts.org/)
- Styling with [TailwindCSS](https://tailwindcss.com/)
