import express from 'express'
import fs from 'fs/promises'

const router = express.Router()
const cartsFilePath = './data/carts.json'

// Middleware para registrar cada solicitud en las rutas de carritos
router.use((req, res, next) => {
    console.log(` [CARRITOS] ${req.method} ${req.url}`)
    next()
})

// Función asíncrona para leer el archivo de carritos.
const getCarts = async () => {
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
}


// Función asíncrona para guardar el array de carritos en el archivo.
const saveCarts = async (carts) => {
    try {
        await fs.writeFile(cartsFilePath,  JSON.stringify(carts,null,2), "utf-8")
    } catch (error){
        console.error('Error al guardar carritos:', error)
    }
}

router.post('/', async (req, res) => {
    let carts = await getCarts()
    const newCart = { id: carts.length + 1, products: [] }

    carts.push(newCart)
    await saveCarts(carts)
    res.status(201).json({ mensaje: 'Carrito creado', carrito: newCart })
})

router.get('/:cid', async (req, res) => {
    let carts = await getCarts()
    const cart = carts.find(c => c.id.toString() === req.params.cid)

    if (!cart) {
        return res.status(404).json({ error: 'Carrito no encontrado' })
    }

    res.json(cart)
})

router.post('/:cid/product/:pid', async (req, res) => {
  let carts = await getCarts();
  let cart = carts.find(c => c.id.toString() === req.params.cid);

  // Si el carrito no existe, se crea automáticamente
  if (!cart) {
    cart = { id: parseInt(req.params.cid), products: [] };
    carts.push(cart);
  }

  // Verifica si el producto ya existe en el carrito y lo actualiza o lo agrega
  const existingProduct = cart.products.find(p => p.product === req.params.pid);
  if (existingProduct) {
    existingProduct.quantity += 1;
  } else {
    cart.products.push({ product: req.params.pid, quantity: 1 });
  }

  await saveCarts(carts);
  res.json({ mensaje: 'Producto agregado al carrito', carrito: cart });
});

router.delete('/:cid/product/:pid', async (req, res) => {
  let carts = await getCarts();
  let cart = carts.find(c => c.id.toString() === req.params.cid);

  if (!cart) {
    return res.status(404).json({ error: 'Carrito no encontrado' });
  }

  // Busca el índice del producto en el carrito
  const productIndex = cart.products.findIndex(p => p.product === req.params.pid);
  if (productIndex === -1) {
    return res.status(404).json({ error: 'Producto no encontrado en el carrito' });
  }

  // Elimina el producto del array
  cart.products.splice(productIndex, 1);
  await saveCarts(carts);
  res.json({ mensaje: 'Producto eliminado del carrito', carrito: cart });
});


export default router
