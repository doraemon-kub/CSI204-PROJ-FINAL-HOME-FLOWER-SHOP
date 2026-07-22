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

const getAllTags = (req, res) => {
    const customTags = fileDb.readData('tags') || {};
    // ensure it's an object
    res.json(Array.isArray(customTags) ? {} : customTags);
};

const addCustomTag = (req, res) => {
    const { category, tag } = req.body;
    if (!category || !tag) return res.status(400).json({ message: 'Category and tag required' });
    
    let customTags = fileDb.readData('tags');
    if (Array.isArray(customTags)) customTags = {}; // initialize if it was an empty array by default
    
    if (!customTags[category]) customTags[category] = [];
    if (!customTags[category].includes(tag)) {
        customTags[category].push(tag);
        fileDb.writeData('tags', customTags);
    }
    res.json({ message: 'Tag added successfully', tags: customTags });
};

const deleteCustomTag = (req, res) => {
    const { tag } = req.params;
    const { category } = req.query; // pass category in query string
    
    let customTags = fileDb.readData('tags');
    if (Array.isArray(customTags)) customTags = {};
    
    if (category && customTags[category]) {
        customTags[category] = customTags[category].filter(t => t !== tag);
        fileDb.writeData('tags', customTags);
    }
    res.json({ message: 'Tag deleted successfully', tags: customTags });
};

const createProduct = (req, res) => {
    const { name, category, price, tag, badge, description, stock, isCustom, customOptions } = req.body;
    if (!name || !price) {
        return res.status(400).json({ message: 'Name and price are required' });
    }

    const products = fileDb.readData('products');
    
    // Automatically save new tag to tags.json if it exists
    if (tag && tag.trim() !== '') {
        let customTags = fileDb.readData('tags');
        if (Array.isArray(customTags)) customTags = {};
        if (!customTags[category]) customTags[category] = [];
        if (!customTags[category].includes(tag.trim())) {
            customTags[category].push(tag.trim());
            fileDb.writeData('tags', customTags);
        }
    }

    let imageUrl = '';
    if (req.files) {
        const mainImage = req.files.find(f => f.fieldname === 'image');
        if (mainImage) {
            imageUrl = mainImage.filename;
        }
    } else if (req.file) { // Fallback just in case
        imageUrl = req.file.filename;
    }

    let parsedCustomOptions = [];
    if (isCustom === 'true' && customOptions) {
        try {
            parsedCustomOptions = JSON.parse(customOptions);
            
            // Map uploaded choice images back into the options
            if (req.files && Array.isArray(req.files)) {
                parsedCustomOptions.forEach((opt, optIndex) => {
                    if (opt.choices && Array.isArray(opt.choices)) {
                        opt.choices.forEach((choice, choiceIndex) => {
                            const fieldName = `choiceImg_${optIndex}_${choiceIndex}`;
                            const uploadedFile = req.files.find(f => f.fieldname === fieldName);
                            if (uploadedFile) {
                                choice.image = uploadedFile.filename;
                            }
                        });
                    }
                });
            }
        } catch (e) {
            console.error("Failed to parse customOptions:", e);
        }
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
        isCustom: isCustom === 'true',
        customOptions: isCustom === 'true' ? parsedCustomOptions : undefined,
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
    const { name, category, price, tag, badge, stock, description, isCustom, customOptions } = req.body;
    const products = fileDb.readData('products');
    
    const productIndex = products.findIndex(p => p.id === id);
    if (productIndex === -1) {
        return res.status(404).json({ message: 'Product not found' });
    }

    // Automatically save new tag to tags.json if it exists
    if (tag && tag.trim() !== '') {
        let customTags = fileDb.readData('tags');
        if (Array.isArray(customTags)) customTags = {};
        if (!customTags[category]) customTags[category] = [];
        if (!customTags[category].includes(tag.trim())) {
            customTags[category].push(tag.trim());
            fileDb.writeData('tags', customTags);
        }
    }

    const updatedProduct = { ...products[productIndex] };
    
    // If the user is STAFF, they are only allowed to update the stock field
    if (req.user.role === 'STAFF') {
        if (stock !== undefined) {
            updatedProduct.stock = parseInt(stock, 10);
        }
    } else {
        // ADMIN can update everything
        if (name !== undefined) updatedProduct.name = name;
        if (category !== undefined) updatedProduct.category = category;
        if (price !== undefined) updatedProduct.price = parseFloat(price);
        if (tag !== undefined) updatedProduct.tag = tag;
        if (badge !== undefined) updatedProduct.badge = badge;
        if (stock !== undefined) updatedProduct.stock = parseInt(stock, 10);
        if (description !== undefined) updatedProduct.description = description;
        
        if (isCustom !== undefined) {
            updatedProduct.isCustom = isCustom === 'true';
            if (updatedProduct.isCustom && customOptions) {
                try {
                    const parsedOpts = JSON.parse(customOptions);
                    
                    // Map uploaded choice images back into the options
                    if (req.files && Array.isArray(req.files)) {
                        parsedOpts.forEach((opt, optIndex) => {
                            if (opt.choices && Array.isArray(opt.choices)) {
                                opt.choices.forEach((choice, choiceIndex) => {
                                    const fieldName = `choiceImg_${optIndex}_${choiceIndex}`;
                                    const uploadedFile = req.files.find(f => f.fieldname === fieldName);
                                    if (uploadedFile) {
                                        choice.image = uploadedFile.filename;
                                    }
                                });
                            }
                        });
                    }
                    updatedProduct.customOptions = parsedOpts;
                } catch (e) {
                    console.error("Failed to parse customOptions during update:", e);
                }
            } else if (!updatedProduct.isCustom) {
                // Remove customOptions if product is no longer custom
                delete updatedProduct.customOptions;
            }
        }
        
        if (req.files) {
            const mainImage = req.files.find(f => f.fieldname === 'image');
            if (mainImage) {
                updatedProduct.image = mainImage.filename;
            }
        } else if (req.file) { // Fallback
            updatedProduct.image = req.file.filename;
        }
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
    deleteProduct,
    getAllTags,
    addCustomTag,
    deleteCustomTag
};
