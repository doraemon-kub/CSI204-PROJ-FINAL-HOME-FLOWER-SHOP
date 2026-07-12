const express = require('express');
const cors = require('cors');
const path = require('path');

// Import routes
const userRoutes = require('./src/routes/userRoutes');
const productRoutes = require('./src/routes/productRoutes');
const cartRoutes = require('./src/routes/cartRoutes');
const orderRoutes = require('./src/routes/orderRoutes');

const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST', 'PUT', 'DELETE']
    }
});

// Set io globally so controllers can use it via req.app.get('io')
app.set('io', io);

io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);
    
    // Clients can join a room based on their userId to get specific cart updates
    socket.on('joinUserRoom', (userId) => {
        socket.join(`user_${userId}`);
        console.log(`Socket ${socket.id} joined room user_${userId}`);
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors()); // Allow frontend to connect
app.use(express.json()); // Parse JSON body
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded body

// Serve static files from 'uploads' directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);

// Base route for testing
app.get('/', (req, res) => {
    res.json({ message: 'Welcome to Home Flowers Shop API' });
});

server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
