const { v4: uuidv4 } = require('uuid');
const fileDb = require('../utils/fileDb');

const register = (req, res) => {
    const { name, email, password, phone } = req.body;
    
    if (!name || !email || !password) {
        return res.status(400).json({ message: 'Name, email, and password are required' });
    }

    const users = fileDb.readData('users');
    
    // Check if user already exists
    const existingUser = users.find(u => u.email === email);
    if (existingUser) {
        return res.status(400).json({ message: 'Email already exists' });
    }

    const newUser = {
        id: uuidv4(),
        name,
        email,
        password, // In a real app, hash this password!
        phone: phone || '',
        role: 'MEMBER',
        createdAt: new Date().toISOString()
    };

    users.push(newUser);
    fileDb.writeData('users', users);

    // Don't send password back
    const { password: _, ...userWithoutPassword } = newUser;
    res.status(201).json({ message: 'Registration successful', user: userWithoutPassword });
};

const login = (req, res) => {
    const { email, password } = req.body;
    
    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
    }

    const users = fileDb.readData('users');
    
    const user = users.find(u => u.email === email && u.password === password);
    if (!user) {
        return res.status(401).json({ message: 'Invalid credentials' });
    }

    const { password: _, ...userWithoutPassword } = user;
    res.json({ message: 'Login successful', user: userWithoutPassword });
};

module.exports = {
    register,
    login
};
