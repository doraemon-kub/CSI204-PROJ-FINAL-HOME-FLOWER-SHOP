const { v4: uuidv4 } = require('uuid');
const fileDb = require('../utils/fileDb');
const logger = require('../utils/logger');

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

    logger.logAction(newUser.id, 'REGISTER', `New user registered: ${name} (${email})`);

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

    logger.logAction(user.id, 'LOGIN', `User logged in: ${user.name} (${user.email})`);

    res.json({ message: 'Login successful', user: userWithoutPassword });
};

const getUserProfile = (req, res) => {
    const { id } = req.params;
    const users = fileDb.readData('users');
    const user = users.find(u => u.id === id);
    if (!user) {
        return res.status(404).json({ message: 'User not found' });
    }
    
    const allAddresses = fileDb.readData('addresses');
    const userAddresses = allAddresses.filter(a => a.userId === id);
    
    const { password: _, ...userWithoutPassword } = user;
    userWithoutPassword.addresses = userAddresses;
    
    res.json(userWithoutPassword);
};

const addAddress = (req, res) => {
    const { id } = req.params;
    const { name, phone, address, addressDetail, subdistrict, district, province, zipcode, isDefault } = req.body;
    
    if (!name || !phone || !address) {
        return res.status(400).json({ message: 'Name, phone, and address are required' });
    }

    const users = fileDb.readData('users');
    if (!users.find(u => u.id === id)) {
        return res.status(404).json({ message: 'User not found' });
    }

    let allAddresses = fileDb.readData('addresses');
    const userAddresses = allAddresses.filter(a => a.userId === id);

    let wantDefault = isDefault === 'true' || isDefault === true;

    // If new address is default, reset others for this user
    if (wantDefault) {
        allAddresses.forEach(a => {
            if (a.userId === id) a.isDefault = false;
        });
    }

    // If it's the first address, make it default automatically
    if (userAddresses.length === 0) {
        wantDefault = true;
    }

    const newAddress = {
        id: uuidv4(),
        userId: id,
        name,
        phone,
        address,
        addressDetail: addressDetail || '',
        subdistrict: subdistrict || '',
        district: district || '',
        province: province || '',
        zipcode: zipcode || '',
        isDefault: wantDefault
    };

    allAddresses.push(newAddress);
    fileDb.writeData('addresses', allAddresses);

    logger.logAction(id, 'ADD_ADDRESS', `Added new address for ${name}`);

    res.status(201).json({ message: 'Address added', address: newAddress });
};

const editAddress = (req, res) => {
    const { id, addressId } = req.params;
    const { name, phone, address, addressDetail, subdistrict, district, province, zipcode, isDefault } = req.body;

    let allAddresses = fileDb.readData('addresses');
    const addressIndex = allAddresses.findIndex(a => a.id === addressId && a.userId === id);
    
    if (addressIndex === -1) {
        return res.status(404).json({ message: 'Address not found' });
    }

    let wantDefault = isDefault === 'true' || isDefault === true;

    if (wantDefault) {
        allAddresses.forEach(a => {
            if (a.userId === id) a.isDefault = false;
        });
    }

    const currentAddress = allAddresses[addressIndex];
    const updatedAddress = {
        ...currentAddress,
        name: name || currentAddress.name,
        phone: phone || currentAddress.phone,
        address: address || currentAddress.address,
        addressDetail: addressDetail !== undefined ? addressDetail : (currentAddress.addressDetail || ''),
        subdistrict: subdistrict !== undefined ? subdistrict : (currentAddress.subdistrict || ''),
        district: district !== undefined ? district : (currentAddress.district || ''),
        province: province !== undefined ? province : (currentAddress.province || ''),
        zipcode: zipcode !== undefined ? zipcode : (currentAddress.zipcode || ''),
        isDefault: wantDefault ? true : currentAddress.isDefault
    };

    allAddresses[addressIndex] = updatedAddress;
    
    // Ensure at least one default if we have addresses for this user
    const userAddresses = allAddresses.filter(a => a.userId === id);
    if (!userAddresses.some(a => a.isDefault) && userAddresses.length > 0) {
        const firstAddrIndex = allAddresses.findIndex(a => a.userId === id);
        if (firstAddrIndex !== -1) {
            allAddresses[firstAddrIndex].isDefault = true;
        }
    }

    fileDb.writeData('addresses', allAddresses);

    logger.logAction(id, 'UPDATE_ADDRESS', `Updated address for ${updatedAddress.name}`);

    res.json({ message: 'Address updated', address: updatedAddress });
};

const deleteAddress = (req, res) => {
    const { id, addressId } = req.params;

    let allAddresses = fileDb.readData('addresses');
    const addressIndex = allAddresses.findIndex(a => a.id === addressId && a.userId === id);
    
    if (addressIndex === -1) {
        return res.status(404).json({ message: 'Address not found' });
    }

    const wasDefault = allAddresses[addressIndex].isDefault;
    allAddresses.splice(addressIndex, 1);

    // If we deleted the default and there are remaining addresses, make the first one default
    if (wasDefault) {
        const firstAddrIndex = allAddresses.findIndex(a => a.userId === id);
        if (firstAddrIndex !== -1) {
            allAddresses[firstAddrIndex].isDefault = true;
        }
    }

    fileDb.writeData('addresses', allAddresses);

    logger.logAction(id, 'DELETE_ADDRESS', `Deleted an address`);

    res.json({ message: 'Address deleted' });
};

const logout = (req, res) => {
    const { userId } = req.body;
    if (userId) {
        logger.logAction(userId, 'LOGOUT', 'User logged out');
    }
    res.json({ message: 'Logout successful' });
};

module.exports = {
    register,
    login,
    logout,
    getUserProfile,
    addAddress,
    editAddress,
    deleteAddress
};
