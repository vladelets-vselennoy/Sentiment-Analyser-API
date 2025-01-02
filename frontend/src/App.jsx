
import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { Upload } from 'lucide-react';
import axios from 'axios';

const App = () => {
  const [file, setFile] = useState(null);
  const [results, setResults] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [token, setToken] = useState('');

  // Function to handle user login and get JWT token
  const handleLogin = async () => {
    if (!username || !password) {
      setError('Please enter both username and password');
      return;
    }
    setError('');
    try {
      const response = await axios.post('https://testing-staged.azurewebsites.net/token', new URLSearchParams({
        username,
        password
      }), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });
      setToken(response.data.access_token);
      setError('');
    } catch (err) {
      setError('Invalid credentials or error during login');
      console.error(err);
    }
  };

  // Function to handle sentiment analysis
  const analyzeSentiment = async () => {
    if (!file || !token) return;

    setLoading(true);
    setError('');

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post('https://testing-staged.azurewebsites.net/analyze', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      setResults(response.data.results);
    } catch (err) {
      setError('Error analyzing sentiment');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Prepare chart data from the sentiment analysis results
  const prepareChartData = () => {
    const sentimentCounts = results.reduce((acc, curr) => {
      acc[curr.sentiment] = (acc[curr.sentiment] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(sentimentCounts).map(([sentiment, count]) => ({
      sentiment,
      count,
    }));
  };

  return (
    <div className="dashboard">
      <h1>Sentiment Analysis Dashboard</h1>

      {!token ? (
        <div className="login-section">
          <h2>Login</h2>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button onClick={handleLogin} disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
          {error && <div className="error">{error}</div>}
        </div>
      ) : (
        <div>
          <h2>Upload CSV and Analyze Sentiment</h2>
          <div className="upload-section">
            <input
              type="file"
              accept=".csv"
              onChange={(e) => setFile(e.target.files[0])}
              id="file-upload"
            />
            <button
              onClick={analyzeSentiment}
              disabled={!file || loading}
              className="analyze-button"
            >
              <Upload className="icon" />
              {loading ? 'Analyzing...' : 'Analyze Sentiment'}
            </button>
          </div>

          {error && <div className="error">{error}</div>}

          {results.length > 0 && (
            <div className="results-section">
              <div className="chart">
                <BarChart width={600} height={300} data={prepareChartData()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="sentiment" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" fill="#4f46e5" />
                </BarChart>
              </div>

              <table className="results-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Text</th>
                    <th>Sentiment</th>
                    <th>Timestamp</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((result, index) => (
                    <tr key={index}>
                      <td>{result.id}</td>
                      <td>{result.text}</td>
                      <td>{result.sentiment}</td>
                      <td>{result.timestamp}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default App;

