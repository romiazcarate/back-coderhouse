import express from 'express'
import { CartModel } from '../models/cart.model.js' 

const router = express.Router()

// Middleware para registrar cada solicitud en las rutas de carritos
router.use((req, res, next) => {
    console.log(` [CARRITOS] ${req.method} ${req.url}`)
    next()
})

// Función asíncrona para leer el archivo de carritos.
/*const getCarts = async () => {
    try {
        const data = await fs.readFile(cartsFilePath, "utf-8")
        return JSON.parse(data)
    } catch (error) {
        if (error.code === 'ENOENT') {
            await fs.writeFile(cartsFilePath, '[]', 'utf8');
            return [];
        }
        console.error('Error al leer carritos:', error)
        return []
    }
}*/


// Función asíncrona para guardar el array de carritos en el archivo.
/*const saveCarts = async (carts) => {
    try {
        await fs.writeFile(cartsFilePath,  JSON.stringify(carts,null,2), "utf-8")
    } catch (error){
        console.error('Error al guardar carritos:', error)
    }
}*/

router.post('/', async (req, res) => {
    try{
      // Creamos el carrito sin productos al inicio

      const newCart = await CartModel.create({ products: []})
      res.status(201).json({ message: ' Carrito creado ', cart: newCart})
    }catch(e){
      console.error('Error al crear carrito', e)
      res.status(500).json({ error: 'Error al crear carrito' })
    }
})

/* 
  2) GET /api/carts/:cid
     Obtiene un carrito por su ID
     - Con .populate('products.product') para ver el detalle de cada producto
*/
router.get('/:cid', async (req, res) => {
  try{
    const { cid } = req.params
    const cart = await CartModel.findById(cid).populate('products.product')
    if(!cart){
      return res.status(404).json({ error: 'Carrito no encontrado'})
    }
    res.json(cart)
  }catch(e){
    console.error('Error al obtener el carrito', e)
    res.status(500).json({ error: 'Error al obterner el carrito'})
  }
})

/* 
  3) POST /api/carts/:cid/product/:pid
     Agrega un producto al carrito. 
     - Si el carrito no existe, lo crea automáticamente (opcional, según tu lógica).
     - Si el producto ya existe en el carrito, incrementa la cantidad.
*/
router.post('/:cid/product/:pid', async (req, res) => {
  try{
    const { cid, pid } = req.params

    let cart = await CartModel.findById(cid)

    // si no existe el carrito, lo creo

    if (!cart){
      cart = await CartModel.create({ _id: cid, products: []})
    }

    //Se verifica si el producto ya se encuentra en el carrito

    const productIndex = cart.products.findIndex((p) => p.product.toString() == pid)

    if(productIndex !== -1){
      // Se incrementa la cantidad
      cart.products[productIndex].quantity += 1
    }else{
      cart.products.push({ product: pid, quantity: 1})
    }

    await cart.save()
    res.json({ message: 'El producto se agregó al carrito', cart})
  }catch(e){
    console.error('Error al agregar producto al carrito', e)
    res.status(500).json({ error: 'Error al agregar producto al carrito'})
  }
})

/* 
  4) DELETE /api/carts/:cid/product/:pid
     Elimina un producto específico del carrito
*/

router.delete('/:cid/product/:pid', async (req, res) => {
  
  try {
    const { cid, pid } = req.params
    const cart = await CartModel.findById(cid)
    if (!cart) {
      return res.status(404).json({ error: 'Carrito no encontrado' })
    }

    // Buscamos el índice del producto dentro del array
    const productIndex = cart.products.findIndex(
      (p) => p.product.toString() === pid
    )

    if (productIndex === -1) {
      return res.status(404).json({ error: 'Producto no encontrado en el carrito' })
    }

    // Borra el producto del array
    cart.products.splice(productIndex, 1)
    await cart.save()

    res.json({ message: 'Producto eliminado del carrito', cart })
  } catch (e) {
    console.error('Error al eliminar producto del carrito:', e)
    res.status(500).json({ error: 'Error al eliminar producto del carrito' })
  }
});

/* 
  5) PUT /api/carts/:cid/products/:pid
     Actualiza la cantidad de un producto existente en el carrito
*/
router.put('/:cid/products/:pid', async (req, res) => {
  try {
    const { cid, pid } = req.params
    const { quantity } = req.body

    const cart = await CartModel.findById(cid)
    if (!cart) {
      return res.status(404).json({ error: 'Carrito no encontrado' });
    }

    const productIndex = cart.products.findIndex(
      (p) => p.product.toString() === pid
    );

    if (productIndex === -1) {
      return res.status(404).json({ error: 'Producto no encontrado en el carrito' })
    }

    cart.products[productIndex].quantity = quantity
    await cart.save()

    res.json({ message: 'Cantidad del producto actualizada', cart })
  } catch (e) {
    console.error('Error al actualizar cantidad del producto en el carrito:', e)
    res.status(500).json({ error: 'Error al actualizar la cantidad del producto' })
  }
});

/* 
  6) PUT /api/carts/:cid
     Reemplaza todo el array de productos del carrito
     con el array que se recibe en el body
*/
router.put('/:cid', async (req, res) => {
  try {
    const { cid } = req.params
    const { products } = req.body;

    const cart = await CartModel.findById(cid)
    if (!cart) {
      return res.status(404).json({ error: 'Carrito no encontrado' })
    }

    // Se cambia por completo el array de productos
    cart.products = products
    await cart.save()

    res.json({ message: 'Carrito actualizado', cart })
  } catch (e) {
    console.error('Error al actualizar carrito:', e)
    res.status(500).json({ error: 'Error al actualizar carrito' })
  }
})

/* 
  7) DELETE /api/carts/:cid
     Elimina TODOS los productos del carrito
*/
router.delete('/:cid', async (req, res) => {
  try {
    const { cid } = req.params
    const cart = await CartModel.findById(cid)
    if (!cart) {
      return res.status(404).json({ error: 'Carrito no encontrado' })
    }

    cart.products = []
    await cart.save()

    res.json({ message: 'Carrito vaciado', cart })
  } catch (error) {
    console.error('Error al vaciar carrito:', error)
    res.status(500).json({ error: 'Error al vaciar carrito' })
  }
})



export default router
