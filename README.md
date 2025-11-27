# EcoWise AI - Personal Sustainability Coach

EcoWise AI is an intelligent sustainability coach that helps users track, improve, and gamify their daily habits to reduce their carbon footprint. The application leverages Google's Gemini API for natural language understanding and personalized eco-friendly recommendations.

## Features

- **Interactive AI Coach**: Chat with an AI assistant that provides personalized sustainability advice based on your habits and preferences
- **Habit Tracking**: Log your daily activities related to transport, diet, energy, waste management, and more
- **Carbon Footprint Analysis**: Get estimates of your carbon footprint and sustainable alternatives
- **Gamification**: Earn green points and badges as you adopt more eco-friendly habits
- **Personalized Recommendations**: Receive tailored suggestions based on your lifestyle and preferences
- **Progress Dashboard**: View your sustainability score and improvements over time

## Technology Stack

- **Frontend**: React with TypeScript, Vite
- **Backend**: Node.js with Express
- **Database**: MongoDB Atlas for cloud data storage
- **AI**: Google Gemini API for natural language processing and generative content
- **Authentication**: JWT for secure user authentication

## Getting Started

### Prerequisites

- Node.js (v14+)
- MongoDB Atlas account
- Google Gemini API key

### Installation

1. Clone the repository:

```
git clone https://github.com/yourusername/ecowise-ai.git
cd ecowise-ai
```

2. Install backend dependencies:

```
cd backend
npm install
```

3. Create a `.env` file in the backend directory with the following variables:

```
PORT=5000
MONGODB_URI=your_mongodb_connection_string
GEMINI_API_KEY=your_gemini_api_key
NODE_ENV=development
```

4. Install frontend dependencies:

```
cd ../frontend
npm install
```

5. Start the backend server:

```
cd ../backend
npm run dev
```

6. Start the frontend development server:

```
cd ../frontend
npm run dev
```

The frontend will be available at `http://localhost:4200` and the backend at `http://localhost:8081` (or the port specified in your backend .env file).

## Project Structure

```
wastezero-app/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── utils/
│   │   └── server.js
│   ├── package.json
│   └── .env
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── contexts/
│   │   ├── services/
│   │   ├── types/
│   │   ├── config/
│   │   └── App.tsx
│   ├── package.json
│   └── vite.config.ts
└── README.md
```

## API Endpoints

- **User Endpoints**:

  - `POST /api/users/register`: Register a new user
  - `POST /api/users/login`: Login user
  - `GET /api/users/:id`: Get user profile
  - `PUT /api/users/:id`: Update user profile
  - `GET /api/users/:id/stats`: Get user sustainability stats

- **Habits Endpoints**:

  - `GET /api/habits`: Get all habits for a user
  - `POST /api/habits`: Create a new habit
  - `PUT /api/habits/:id`: Update a habit
  - `DELETE /api/habits/:id`: Delete a habit
  - `POST /api/habits/:id/complete`: Mark a habit as completed

- **AI Endpoints**:
  - `POST /api/ai/chat`: Chat with the AI assistant
  - `POST /api/ai/analyze-habits`: Get habit analysis
  - `POST /api/ai/suggestions`: Get personalized sustainability suggestions
  - `POST /api/ai/calculate-footprint`: Calculate carbon footprint

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- Google Gemini API for powerful language processing
- MongoDB Atlas for cloud database services
