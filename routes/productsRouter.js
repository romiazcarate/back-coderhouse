import express from 'express';
import fs from 'fs/promises';

const router = express.Router();
const productsFilePath = './data/productos.json';

router.use((req, res, next) => {
    console.log(` [PRODUCTOS] ${req.method} ${req.url}`);
    next();
});

const getProducts = async () => {
   
    try {
        const data = await fs.readFile(productsFilePath, 'utf8');
        return data ? JSON.parse(data) : [];
    } catch (error) {
        console.error('Error al leer productos:', error);
        return [];
    }
};


const saveProducts = async (products) => {
    try {
        fs.writeFile(productsFilePath, JSON.stringify(products, null, 2), 'utf8');
    } catch (error) {
        console.error('Error al guardar productos:', error);
    }
};

router.get('/', async (req, res) => {
    const products = await getProducts();
    const limit = req.query.limit ? parseInt(req.query.limit) : products.length;
    
    if (isNaN(limit) || limit < 1) {
        return res.status(400).json({ error: 'El parámetro limit debe ser un número válido' });
    }

    res.json(products.slice(0, limit));
});

router.get('/:pid', async (req, res) => {
    const products = await getProducts();
    const productId = req.params.pid;
    const product = products.find(p => p.id.toString() === productId);

    if (!product) {
        return res.status(404).json({ error: 'Producto no encontrado' });
    }

    res.json(product);
});

router.post('/', async (req, res) => {
    let products = await getProducts();
    const { title, description, code, price, status = true, stock, category, thumbnails = [] } = req.body;

    if (!title || !description || !code || price === undefined || stock === undefined || !category) {
        return res.status(400).json({ error: 'Todos los campos son obligatorios excepto thumbnails' });
    }

    const newId = products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1;

    const newProduct = {
        id: newId,
        title,
        description,
        code,
        price,
        status: true,
        stock,
        category,
        thumbnails
    };

    products.push(newProduct);
    await saveProducts(products);

    webSocketServer.emit('updateProducts', getProducts())

    res.status(201).json({ mensaje: 'Producto agregado con éxito', producto: newProduct });
});

router.put('/:pid', async (req, res) => {
    let products = await getProducts();
    const pid = req.params.pid;

    if (!pid) {
        return res.status(400).json({ error: 'ID del producto es requerido' });
    }

    const index = products.findIndex(p => p.id.toString() === pid);
    if (index === -1) {
        return res.status(404).json({ error: 'Producto no encontrado' });
    }

    const updatedProduct = req.body;
    products[index] = { ...products[index], ...updatedProduct, id: pid };
    await saveProducts(products);

    res.json({ mensaje: 'Producto actualizado', producto: products[index] });
});

router.delete('/:pid', async (req, res) => {
    let products = await getProducts();
    const pid = req.params.pid;

    if (!pid) {
        return res.status(400).json({ error: 'ID del producto es requerido' });
    }

    const filteredProducts = products.filter(p => p.id.toString() !== pid);
    if (filteredProducts.length === products.length) {
        return res.status(404).json({ error: 'Producto no encontrado' });
    }

    await saveProducts(filteredProducts);

    webSocketServer.emit('updateProducts', getProducts())

    res.json({ mensaje: 'Producto eliminado correctamente' });
});

export default router;
