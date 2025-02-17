import express from 'express'
import fs from 'fs/promises'

const router = express.Router()
const cartsFilePath = './data/carts.json'

router.use((req, res, next) => {
    console.log(` [CARRITOS] ${req.method} ${req.url}`)
    next()
})

const getCarts = async () => {
    try {
        const data = await fs.readFile(cartsFilePath, "utf-8")
        return JSON.parse(data)
    } catch (error) {
        console.error('Error al leer carritos:', error)
        return []
    }
}

const saveCarts = async () => {
    try {
        const data = await fs.writeFile(cartsFilePath,  JSON.stringify(carts,null,2), "utf-8")
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

router.get('/:cid', (req, res) => {
    const carts = getCarts()
    const cart = carts.find(c => c.id.toString() === req.params.cid)

    if (!cart) {
        return res.status(404).json({ error: 'Carrito no encontrado' })
    }

    res.json(cart)
})

router.post('/:cid/product/:pid', (req, res) => {
    let carts = getCarts()
    const cart = carts.find(c => c.id.toString() === req.params.cid)

    if (!cart) {
        return res.status(404).json({ error: 'Carrito no encontrado' })
    }

    const existingProduct = cart.products.find(p => p.product === req.params.pid)
    if (existingProduct) {
        existingProduct.quantity += 1
    } else {
        cart.products.push({ product: req.params.pid, quantity: 1 })
    }

    fs.writeFileSync(cartsFilePath, JSON.stringify(carts, null, 2), "utf-8")

    res.json({ mensaje: 'Producto agregado al carrito', carrito: cart })
})

export default router