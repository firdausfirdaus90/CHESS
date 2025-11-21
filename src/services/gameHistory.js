import { collection, addDoc, query, orderBy, getDocs, limit } from 'firebase/firestore';
import { db } from '../config/firebase';

// Save game result to Firestore
export const saveGameResult = async (gameData) => {
  try {
    const docRef = await addDoc(collection(db, 'games'), {
      winner: gameData.winner, // 'white', 'black', or 'draw'
      gameMode: gameData.gameMode, // 'ai' or 'multiplayer'
      aiType: gameData.aiType || null, // 'minimax' or 'claude'
      aiDifficulty: gameData.aiDifficulty || null, // 'easy', 'medium', 'hard'
      moveCount: gameData.moveCount || 0,
      timestamp: new Date(),
      duration: gameData.duration || null // game duration in seconds
    });

    console.log('Game saved with ID:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('Error saving game:', error);
    throw error;
  }
};

// Get all game history
export const getGameHistory = async (limitCount = 50) => {
  try {
    const q = query(
      collection(db, 'games'),
      orderBy('timestamp', 'desc'),
      limit(limitCount)
    );

    const querySnapshot = await getDocs(q);
    const games = [];

    querySnapshot.forEach((doc) => {
      games.push({
        id: doc.id,
        ...doc.data()
      });
    });

    return games;
  } catch (error) {
    console.error('Error fetching game history:', error);
    throw error;
  }
};

// Get game statistics
export const getGameStats = async () => {
  try {
    const games = await getGameHistory(1000); // Get last 1000 games for stats

    const stats = {
      totalGames: games.length,
      whiteWins: 0,
      blackWins: 0,
      draws: 0,
      aiGames: 0,
      multiplayerGames: 0,
      claudeGames: 0,
      minimaxGames: 0
    };

    games.forEach(game => {
      if (game.winner === 'white') stats.whiteWins++;
      else if (game.winner === 'black') stats.blackWins++;
      else if (game.winner === 'draw') stats.draws++;

      if (game.gameMode === 'ai') stats.aiGames++;
      else if (game.gameMode === 'multiplayer') stats.multiplayerGames++;

      if (game.aiType === 'claude') stats.claudeGames++;
      else if (game.aiType === 'minimax') stats.minimaxGames++;
    });

    return stats;
  } catch (error) {
    console.error('Error calculating stats:', error);
    throw error;
  }
};
