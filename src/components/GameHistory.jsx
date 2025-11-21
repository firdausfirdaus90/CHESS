import { useState, useEffect } from 'react';
import { getGameHistory, getGameStats } from '../services/gameHistory';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import './GameHistory.css';

const GameHistory = () => {
  const [games, setGames] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [gamesData, statsData] = await Promise.all([
        getGameHistory(50),
        getGameStats()
      ]);
      setGames(gamesData);
      setStats(statsData);
    } catch (err) {
      setError('Failed to load game history');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (err) {
      console.error('Failed to logout:', err);
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  const formatDuration = (seconds) => {
    if (!seconds) return 'N/A';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  if (loading) {
    return (
      <div className="game-history">
        <div className="loading">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="game-history">
        <div className="error">{error}</div>
      </div>
    );
  }

  return (
    <div className="game-history">
      <header className="history-header">
        <h1>♟️ Chess Game - History & Stats</h1>
        <div className="header-actions">
          <button onClick={() => navigate('/')} className="btn-primary">
            Play Chess
          </button>
          <button onClick={handleLogout} className="btn-secondary">
            Logout
          </button>
        </div>
      </header>

      {stats && (
        <div className="stats-container">
          <h2>Statistics</h2>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-value">{stats.totalGames}</div>
              <div className="stat-label">Total Games</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{stats.whiteWins}</div>
              <div className="stat-label">White Wins</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{stats.blackWins}</div>
              <div className="stat-label">Black Wins</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{stats.draws}</div>
              <div className="stat-label">Draws</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{stats.aiGames}</div>
              <div className="stat-label">vs AI</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{stats.multiplayerGames}</div>
              <div className="stat-label">Multiplayer</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{stats.claudeGames}</div>
              <div className="stat-label">Claude AI</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{stats.minimaxGames}</div>
              <div className="stat-label">Minimax AI</div>
            </div>
          </div>
        </div>
      )}

      <div className="games-container">
        <h2>Recent Games</h2>
        {games.length === 0 ? (
          <p className="no-games">No games played yet. Start playing to see your history!</p>
        ) : (
          <div className="games-table">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Winner</th>
                  <th>Mode</th>
                  <th>AI Type</th>
                  <th>Difficulty</th>
                  <th>Moves</th>
                  <th>Duration</th>
                </tr>
              </thead>
              <tbody>
                {games.map((game) => (
                  <tr key={game.id}>
                    <td>{formatDate(game.timestamp)}</td>
                    <td>
                      <span className={`winner-badge ${game.winner}`}>
                        {game.winner === 'draw' ? 'Draw' : game.winner.charAt(0).toUpperCase() + game.winner.slice(1)}
                      </span>
                    </td>
                    <td>{game.gameMode === 'ai' ? 'vs AI' : 'Multiplayer'}</td>
                    <td>{game.aiType ? game.aiType.charAt(0).toUpperCase() + game.aiType.slice(1) : '-'}</td>
                    <td>{game.aiDifficulty || '-'}</td>
                    <td>{game.moveCount || 0}</td>
                    <td>{formatDuration(game.duration)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default GameHistory;
