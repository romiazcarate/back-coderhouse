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
  const router = express.Router()

  // Middleware para registrar cada petición en las rutas de productos.
  router.use((req, res, next) => {
    console.log(`[PRODUCTOS] ${req.method} ${req.url}`)
    next()
  })

  /**  GET /api/products 
   * Devuelve los productos desde MongoDB con la paginación, filtros y el orden
   * Los query params son:
   * - limit(numero de productos por pagina, el default es 10)
   * page (pagina actual, la default es 1)
   * sort (asc o desc para ordenar por precio, es opcional )
   * query */
  router.get('/', async (req, res) => {
    try {
      const { limit = 10, page = 1, sort, query } = req.query
      const queryObj = {}
      if (query) queryObj.category = query;
  
      const sortOptions = {}
      if (sort === 'asc') sortOptions.price = 1
      if (sort === 'desc') sortOptions.price = -1
  
      const options = { limit, page, sort: sortOptions, lean: true }
      const result = await ProductModel.paginate(queryObj, options)
  
      // Si la petición es "API"
      return res.json({
        status: 'success',
        payload: result.docs,
        totalPages: result.totalPages,
        page: result.page,
        hasPrevPage: result.hasPrevPage,
        hasNextPage: result.hasNextPage,
        prevPage: result.prevPage,
        nextPage: result.nextPage,
      });
    } catch (e) {
      console.error('Error al obtener productos:', e)
      return res.status(500).json({ status: 'error', message: 'Error al obtener productos' })
    }
  })
  
  /**
   * Ruta VISTA (HTML) - 
   * GET /api/products/view
   */

  router.get('/view', async (req, res) => {
    try {
      const { limit = 10, page = 1, sort, query } = req.query
      const queryObj = {}
      if (query) queryObj.category = query
  
      const sortOptions = {}
      if (sort === 'asc') sortOptions.price = 1
      if (sort === 'desc') sortOptions.price = -1
  
      const options = { limit, page, sort: sortOptions, lean: true }
      const result = await ProductModel.paginate(queryObj, options)
  
      // Construir prevLink y nextLink
      const baseUrl = `${req.protocol}://${req.get('host')}${req.originalUrl.split('?')[0]}`
      const buildLink = (pageNumber) => {
        let url = `${baseUrl}?page=${pageNumber}&limit=${limit}`
        if (sort) url += `&sort=${sort}`
        if (query) url += `&query=${query}`
        return url
      }
      const prevLink = result.hasPrevPage ? buildLink(result.prevPage) : null
      const nextLink = result.hasNextPage ? buildLink(result.nextPage) : null
  
      // Renderizar la vista
      res.render('products', {
        products: result.docs,
        totalPages: result.totalPages,
        page: result.page,
        hasPrevPage: result.hasPrevPage,
        hasNextPage: result.hasNextPage,
        prevLink,
        nextLink,
        sort,
        query
      })
    } catch (e) {
      console.error('Error al renderizar vista de productos:', e);
      res.status(500).send('Error al renderizar vista de productos');
    }
  })
  

  // POST /api/products – agrega un nuevo producto.
  router.post('/', async (req, res) => {
    try {
      const { title, description, code, price, stock, category } = req.body

      // Validación básica de campos obligatorios
      if (!title || !description || !code || price == null || stock == null || !category) {
        return res.status(400).json({ error: 'Faltan campos obligatorios' })
      }

      // Creamos el producto en MongoDB
      const newProduct = await ProductModel.create({
        title,
        description,
        code,
        price,
        stock,
        category
      })

      // Emitir evento al WebSocket para notificar a los clientes
      const allProducts = await ProductModel.find().lean()
      webSocketServer.emit('updateProducts', allProducts)

      return res.status(201).json({
        mensaje: 'Producto agregado con éxito',
        producto: newProduct
      })
    } catch (e) {
      console.error('Error al crear producto:', e);
      return res.status(500).json({ status: 'error', message: 'Error al crear producto' })
    }
  })

  return router
}
