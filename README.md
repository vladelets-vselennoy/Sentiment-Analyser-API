# AI-Powered Sentiment Analysis API with React Portal

A powerful sentiment analysis solution combining a FastAPI backend for text analysis and a React frontend for visualizing results. The system allows users to upload CSV reports and view sentiment analysis results through an intuitive dashboard interface.

## Features

- FastAPI backend with sentiment analysis capabilities using pre-trained models (VADER, TextBlob)
- React frontend for file uploads and data visualization
- Secure API authentication
- CSV file processing for batch sentiment analysis
- Interactive data visualization dashboard
- Azure cloud deployment support

## API Documentation

### Base URL
```
https://testing-staged.azurewebsites.net/
```

### Authentication

**Endpoint:** `/token`  
**Method:** POST  
**Response:**
```json
{
  "access_token": "your-access-token",
  "token_type": "bearer"
}
```

### Sentiment Analysis

**Endpoint:** `/analyze`  
**Method:** POST  
**Headers:**
- Authorization: Bearer <your-access-token>
- Content-Type: multipart/form-data

**Request Body:**
- File: CSV file with columns `id`, `text`, and optional `timestamp`

**Example CSV Format:**
```csv
id,text,timestamp
1,"I love the new features of this product!",2024-12-13 10:00:00
2,"The service was okay, nothing special.",2024-12-13 11:30:00
3,"I am not happy with the recent changes.",2024-12-13 12:45:00
```

**Response:**
```json
{
  "results": [
    {
      "id": 1,
      "text": "I love the new features of this product!",
      "sentiment": "positive",
      "timestamp": "2024-12-13T10:00:00"
    },
    {
      "id": 2,
      "text": "The service was okay, nothing special.",
      "sentiment": "neutral",
      "timestamp": "2024-12-13T11:30:00"
    },
    {
      "id": 3,
      "text": "I am not happy with the recent changes.",
      "sentiment": "negative",
      "timestamp": "2024-12-13T12:45:00"
    }
  ]
}
```

## Setup Instructions

### Backend Setup (FastAPI)

1. Clone the repository:
```bash
git clone https://github.com/your-repo-name.git
cd your-repo-name/backend
```

2. Create and activate virtual environment:
```bash
python3 -m venv venv
source venv/bin/activate  # On Linux/Mac
# or
.\venv\Scripts\activate  # On Windows
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Run the FastAPI application:
```bash
uvicorn main:app --reload
```

The API will be available at `http://127.0.0.1:8000`

### Frontend Setup (React)

1. Navigate to the frontend directory:
```bash
cd your-repo-name/frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The React application will be available at `http://localhost:5173`

## Deployment

### Backend Deployment (Azure)

The FastAPI backend is currently deployed on Azure and accessible at:
```
https://testing-staged.azurewebsites.net/
```

### Frontend Deployment

To deploy the React frontend:

1. Build the application:
```bash
npm run build
```

2. Update the API URL in `frontend/src/App.jsx` or `vite.config.js`:
```javascript
const API_URL = 'https://testing-staged.azurewebsites.net';
```

## Testing

1. Obtain authentication token:
```bash
curl -X POST https://testing-staged.azurewebsites.net/token
```

2. Send a CSV file for analysis:
```bash
curl -X POST \
  -H "Authorization: Bearer <your-token>" \
  -F "file=@sample.csv" \
  https://testing-staged.azurewebsites.net/analyze
```

## License

This project is licensed under the MIT License - see the LICENSE file for details.
