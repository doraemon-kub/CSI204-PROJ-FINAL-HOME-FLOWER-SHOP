const fileDb = require('../utils/fileDb');
const logger = require('../utils/logger');

const getAllProducts = (req, res) => {
    const { category, search } = req.query;
    let products = fileDb.readData('products');

    if (category) {
        products = products.filter(p => p.category === category);
    }
    
    if (search) {
        const lowerSearch = search.toLowerCase();
        products = products.filter(p => p.name.toLowerCase().includes(lowerSearch));
    }

    res.json(products);
};

const getProductById = (req, res) => {
    const { id } = req.params;
    const products = fileDb.readData('products');
    
    const product = products.find(p => p.id === id);
    if (!product) {
        return res.status(404).json({ message: 'Product not found' });
    }

    res.json(product);
};

const createProduct = (req, res) => {
    const { name, category, price, tag, badge, description, stock } = req.body;
    if (!name || !price) {
        return res.status(400).json({ message: 'Name and price are required' });
    }

    const products = fileDb.readData('products');
    
    let imageUrl = '';
    if (req.file) {
        imageUrl = req.file.filename;
    }

    const newProduct = {
        id: `prod-${Date.now()}`,
        name,
        category,
        price: parseFloat(price),
        tag: tag || '',
        badge: badge || '',
        description: description || '',
        stock: stock ? parseInt(stock, 10) : 0,
        image: imageUrl,
        createdAt: new Date().toISOString()
    };

    products.push(newProduct);
    fileDb.writeData('products', products);

    logger.logAction(req.user.userId || req.user.id, 'CREATE_PRODUCT', `Created product ${newProduct.name}`);

    res.status(201).json({ message: 'Product created successfully', product: newProduct });
};

const updateProduct = (req, res) => {
    const { id } = req.params;
    const { name, category, price, tag, badge, stock, description } = req.body;
    const products = fileDb.readData('products');
    
    const productIndex = products.findIndex(p => p.id === id);
    if (productIndex === -1) {
        return res.status(404).json({ message: 'Product not found' });
    }

    const updatedProduct = { ...products[productIndex] };
    
    if (name !== undefined) updatedProduct.name = name;
    if (category !== undefined) updatedProduct.category = category;
    if (price !== undefined) updatedProduct.price = parseFloat(price);
    if (tag !== undefined) updatedProduct.tag = tag;
    if (badge !== undefined) updatedProduct.badge = badge;
    if (stock !== undefined) updatedProduct.stock = parseInt(stock, 10);
    if (description !== undefined) updatedProduct.description = description;
    
    if (req.file) {
        updatedProduct.image = req.file.filename;
    }

    products[productIndex] = updatedProduct;
    fileDb.writeData('products', products);

    logger.logAction(req.user.userId || req.user.id, 'UPDATE_PRODUCT', `Updated product ${updatedProduct.name}`);

    res.json({ message: 'Product updated successfully', product: updatedProduct });
};

const deleteProduct = (req, res) => {
    const { id } = req.params;
    const products = fileDb.readData('products');
    
    const productIndex = products.findIndex(p => p.id === id);
    if (productIndex === -1) {
        return res.status(404).json({ message: 'Product not found' });
    }

    const deletedProductName = products[productIndex].name;
    products.splice(productIndex, 1);
    fileDb.writeData('products', products);

    logger.logAction(req.user.userId || req.user.id, 'DELETE_PRODUCT', `Deleted product ${deletedProductName}`);

    res.json({ message: 'Product deleted successfully' });
};

module.exports = {
    getAllProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct
};
