import express from 'express';
import cors from 'cors';
import db from './db.js';

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

// Get Transactions (with optional limit)
app.get('/api/transactions', async (req, res) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const query = limit === -1 ? 'SELECT * FROM transactions ORDER BY created_at DESC' : 'SELECT * FROM transactions ORDER BY created_at DESC LIMIT ?';
    const params = limit === -1 ? [] : [limit];
    
    const [rows] = await db.query(query, params);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

// Update Transaction Status
app.put('/api/transactions/:id/status', async (req, res) => {
  const { status } = req.body;
  if (!status) {
    return res.status(400).json({ error: 'Status is required' });
  }

  try {
    await db.query('UPDATE transactions SET status = ? WHERE id = ?', [status, req.params.id]);
    res.json({ message: 'Transaction status updated' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

// Delete Transaction
app.delete('/api/transactions/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM transactions WHERE id = ?', [req.params.id]);
    res.json({ message: 'Transaction deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

// Search Transaction
app.get('/api/transactions/:id', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM transactions WHERE id = ?', [req.params.id]);
    if (rows.length > 0) {
      res.json(rows[0]);
    } else {
      res.status(404).json({ error: 'Transaction not found' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

// Create Transaction
app.post('/api/transactions', async (req, res) => {
  const { id, phone, game_name, item_name, price, unique_code, final_price } = req.body;
  
  if (!id || !phone || !game_name || !item_name || !price) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    await db.query(
      'INSERT INTO transactions (id, phone, game_name, item_name, price, unique_code, final_price, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [id, phone, game_name, item_name, price, unique_code || 0, final_price || price, 'Waiting'] // Default status Waiting
    );
    res.status(201).json({ message: 'Transaction created', id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

// Get Games List
app.get('/api/games', async (req, res) => {
  try {
    const [games] = await db.query('SELECT * FROM games');
    const [items] = await db.query('SELECT * FROM game_items');
    
    const gamesWithItems = games.map(game => {
      return {
        ...game,
        items: items.filter(item => item.game_id === game.id),
        inputs: typeof game.inputs === 'string' ? JSON.parse(game.inputs) : game.inputs
      };
    });
    
    res.json(gamesWithItems);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

// Get Single Game
app.get('/api/games/:id', async (req, res) => {
  try {
    const [games] = await db.query('SELECT * FROM games WHERE id = ?', [req.params.id]);
    if (games.length === 0) return res.status(404).json({ error: 'Game not found' });
    
    const game = games[0];
    const [items] = await db.query('SELECT * FROM game_items WHERE game_id = ?', [game.id]);
    
    game.items = items;
    game.inputs = typeof game.inputs === 'string' ? JSON.parse(game.inputs) : game.inputs;
    
    res.json(game);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
