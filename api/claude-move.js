// Vercel Serverless Function to call Claude API
// This keeps your API key secure on the server

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { board, color, moveHistory } = req.body;

    // Validate request
    if (!board || !color) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Get Claude API key from environment variable
    const apiKey = process.env.CLAUDE_API_KEY;

    if (!apiKey) {
      console.error('CLAUDE_API_KEY not set');
      return res.status(500).json({ error: 'API key not configured' });
    }

    // Build the prompt for Claude
    const prompt = buildChessPrompt(board, color, moveHistory);

    // Call Claude API
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-5-haiku-20241022',
        max_tokens: 1024,
        messages: [{
          role: 'user',
          content: prompt
        }]
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Claude API error:', errorData);
      return res.status(response.status).json({
        error: 'Claude API request failed',
        details: errorData
      });
    }

    const data = await response.json();

    // Extract the move from Claude's response
    const move = parseClaudeMove(data.content[0].text);

    if (!move) {
      return res.status(500).json({
        error: 'Failed to parse move from Claude response',
        response: data.content[0].text
      });
    }

    return res.status(200).json({ move });

  } catch (error) {
    console.error('Error in claude-move function:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
}

// Build a chess prompt for Claude
function buildChessPrompt(board, color, moveHistory) {
  const boardStr = boardToString(board);
  const history = moveHistory && moveHistory.length > 0
    ? `\n\nMove history:\n${moveHistory.join('\n')}`
    : '';

  return `You are playing chess as ${color}. Here is the current board position:

${boardStr}${history}

Please analyze the position and respond with your next move in the following JSON format:
{
  "from": {"row": <number>, "col": <number>},
  "to": {"row": <number>, "col": <number>}
}

Where row and col are 0-indexed (0-7). Only respond with the JSON, no explanation.`;
}

// Convert board array to readable string
function boardToString(board) {
  let str = '  0 1 2 3 4 5 6 7\n';
  for (let row = 0; row < 8; row++) {
    str += `${row} `;
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col];
      if (piece) {
        const symbol = getPieceSymbol(piece);
        str += `${symbol} `;
      } else {
        str += '. ';
      }
    }
    str += '\n';
  }
  return str;
}

// Get chess piece symbol
function getPieceSymbol(piece) {
  const symbols = {
    'white': { 'king': '♔', 'queen': '♕', 'rook': '♖', 'bishop': '♗', 'knight': '♘', 'pawn': '♙' },
    'black': { 'king': '♚', 'queen': '♛', 'rook': '♜', 'bishop': '♝', 'knight': '♞', 'pawn': '♟' }
  };
  return symbols[piece.color]?.[piece.type] || '?';
}

// Parse Claude's response to extract the move
function parseClaudeMove(text) {
  try {
    // Try to find JSON in the response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error('No JSON found in response:', text);
      return null;
    }

    const moveData = JSON.parse(jsonMatch[0]);

    // Validate the move structure
    if (moveData.from && moveData.to &&
        typeof moveData.from.row === 'number' &&
        typeof moveData.from.col === 'number' &&
        typeof moveData.to.row === 'number' &&
        typeof moveData.to.col === 'number') {
      return moveData;
    }

    console.error('Invalid move structure:', moveData);
    return null;
  } catch (error) {
    console.error('Error parsing Claude response:', error, text);
    return null;
  }
}
