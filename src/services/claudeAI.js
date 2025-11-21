// Service to interact with Claude AI via Vercel function

export const getClaudeMove = async (board, color, moveHistory = []) => {
  try {
    const response = await fetch('/api/claude-move', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        board,
        color,
        moveHistory
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to get move from Claude');
    }

    const data = await response.json();
    return data.move;

  } catch (error) {
    console.error('Error calling Claude API:', error);
    throw error;
  }
};
