const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const User = require('./models/user');
const Message = require('./models/message');
const authRoutes = require('./routes/auth');
const multer = require('multer');
const path = require('path');
const File = require('./models/file');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect('mongodb+srv://kshitijkale:551818@cluster0.ar3nf.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Create uploads directory if it doesn't exist
const fs = require('fs');
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Add login route
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { userId: user._id, userType: user.userType },
      process.env.JWT_SECRET || '8d44f3f5b6a7c8e9d0a1b2c3d4e5f6g7h8i9j0klm',
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        userType: user.userType
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      message: 'Server error during login',
      error: error.message 
    });
  }
});

// Message routes
app.get('/api/messages', async (req, res) => {
  try {
    const messages = await Message.find().sort({ timestamp: 1 });
    res.json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ message: 'Error fetching messages' });
  }
});

app.post('/api/messages', async (req, res) => {
  try {
    const { text, sender } = req.body;
    const message = new Message({
      text,
      sender,
      timestamp: new Date()
    });
    await message.save();
    res.status(201).json(message);
  } catch (error) {
    console.error('Error saving message:', error);
    res.status(500).json({ message: 'Error saving message' });
  }
});

// WebSocket connection handling
wss.on('connection', (ws) => {
  console.log('New client connected');

  ws.on('message', async (data) => {
    try {
      const messageData = JSON.parse(data);
      const message = new Message({
        text: messageData.text,
        sender: messageData.sender,
        timestamp: new Date()
      });
      await message.save();

      // Broadcast to all clients
      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({
            type: 'new_message',
            message
          }));
        }
      });
    } catch (error) {
      console.error('Error handling WebSocket message:', error);
    }
  });

  ws.on('close', () => {
    console.log('Client disconnected');
  });
});

app.use('/api', authRoutes);

// File upload endpoint
app.post('/api/files/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const file = new File({
      filename: req.file.filename,
      originalName: req.file.originalname,
      path: req.file.path,
      uploadedBy: req.body.uploadedBy,
      title: req.body.title || req.file.originalname,
      description: req.body.description,
      subject: req.body.subject,
      tags: req.body.tags ? req.body.tags.split(',').map(tag => tag.trim()) : [],
      uploadedAt: new Date()
    });

    await file.save();
    res.status(201).json(file);
  } catch (error) {
    console.error('File upload error:', error);
    res.status(500).json({ message: 'Error uploading file', error: error.message });
  }
});

// Get all files endpoint
app.get('/api/files', async (req, res) => {
  try {
    const files = await File.find().populate('uploadedBy', 'firstName lastName');
    res.json(files);
  } catch (error) {
    console.error('Error fetching files:', error);
    res.status(500).json({ message: 'Error fetching files' });
  }
});

// Upvote file endpoint
app.post('/api/files/:fileId/upvote', async (req, res) => {
  try {
    const { fileId } = req.params;
    const { userId } = req.body;

    const file = await File.findById(fileId);
    if (!file) {
      return res.status(404).json({ message: 'File not found' });
    }

    const hasUpvoted = file.upvotes?.includes(userId);
    
    if (hasUpvoted) {
      // Remove upvote
      file.upvotes = file.upvotes.filter(id => id.toString() !== userId);
    } else {
      // Add upvote
      if (!file.upvotes) file.upvotes = [];
      file.upvotes.push(userId);
    }

    await file.save();
    res.json({ upvotes: file.upvotes });
  } catch (error) {
    console.error('Error upvoting file:', error);
    res.status(500).json({ message: 'Error upvoting file' });
  }
});

app.get('/api/users/:userId/stats', async (req, res) => {
  try {
    const { userId } = req.params;

    // Get all files uploaded by user
    const userFiles = await File.find({ uploadedBy: userId });
    
    // Calculate total upvotes received
    const totalUpvotes = userFiles.reduce((sum, file) => sum + (file.upvotes?.length || 0), 0);
    
    // Get files where user has upvoted
    const upvotedFiles = await File.find({ upvotes: userId });
    
    // Get recent files (last 5)
    const recentFiles = await File.find({ uploadedBy: userId })
      .sort({ uploadedAt: -1 })
      .limit(5);

    const stats = {
      totalUploads: userFiles.length,
      totalUpvotes,
      upvotesGiven: upvotedFiles.length,
      recentFiles
    };

    res.json(stats);
  } catch (error) {
    console.error('Error fetching user stats:', error);
    res.status(500).json({ message: 'Error fetching user stats' });
  }
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
