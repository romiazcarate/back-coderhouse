import express from 'express';
import { ProductModel } from '../models/product.model.js';



// const productsFilePath = './data/products.json';

/**
 * Función para obtener los productos desde el archivo JSON.
 */
/*export async function getProducts() {
  try {
    const data = await fs.readFile(productsFilePath, 'utf8');
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error al leer productos:', error);
    return [];
  }
}*/

/**
 * Función para guardar el arreglo de productos en el archivo JSON.
 */
/*async function saveProducts(products) {
  try {
    await fs.writeFile(productsFilePath, JSON.stringify(products, null, 2), 'utf8');
  } catch (error) {
    console.error('Error al guardar productos:', error);
  }
}*/


export default function createProductsRouter(webSocketServer) {
  const router = express.Router();

  // Middleware para registrar cada petición en las rutas de productos.
  router.use((req, res, next) => {
    console.log(`[PRODUCTOS] ${req.method} ${req.url}`);
    next();
  });

  /**  GET /api/products 
   * Devuelve los productos desde MongoDB con la paginación, filtros y el orden
   * Los query params son:
   * - limit(numero de productos por pagina, el default es 10)
   * page (pagina actual, la default es 1)
   * sort (asc o desc para ordenar por precio, es opcional )
   * query */
  router.get('/', async (req, res) => {
    const products = await getProducts();
    res.json(products);
  });

  // POST /api/products – agrega un nuevo producto.
  router.post('/', async (req, res) => {
    let products = await getProducts();
    const { title, description, code, price, stock, category } = req.body;

    // Validación básica de campos obligatorios.
    if (!title || !description || !code || price == null || stock == null || !category) {
      return res.status(400).json({ error: 'Faltan campos obligatorios' });
    }

    const newId = products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1;
    const newProduct = {
      id: newId,
      title,
      description,
      code,
      price,
      stock,
      category
    };

    products.push(newProduct);
    await saveProducts(products);

    webSocketServer.emit('updateProducts', await getProducts());

    res.status(201).json({ mensaje: 'Producto agregado con éxito', producto: newProduct });
  });

  return router;
}
