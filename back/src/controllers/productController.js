const fileDb = require('../utils/fileDb');

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

module.exports = {
    getAllProducts,
    getProductById
};
