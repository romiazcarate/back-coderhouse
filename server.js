import express from 'express'
import path from 'path'
import { createServer } from 'http'
import { Server } from 'socket.io'
import { engine } from 'express-handlebars'
import { ProductModel } from './models/product.model.js'
import createProductsRouter from './routes/productsRouter.js'
import cartsRouter from './routes/cartsRouter.js'
import { CartModel } from './models/cart.model.js'
import { connectToMongo } from './connection/mongo.js'


const app = express()
const server = createServer(app)
const webSocketServer = new Server(server)

// Configuracion de Handlebars
app.engine('handlebars', engine())
app.set('view engine', 'handlebars')
app.set('views', path.join(path.resolve(), 'views'))

// Middlewares para parsear JSON, datos URL-encoded y servir archivos estáticos
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(express.static('public'));

// Rutas
const productsRouter = createProductsRouter(webSocketServer);
app.use('/api/products', productsRouter)
app.use('/api/carts', cartsRouter)

// Ruta principal que renderiza la vista "home" y envía los productos existentes
app.get('/', async (req,res)=> {
    try {
      // Crear o recuperar un carrito
      const newCart = await CartModel.create({ products: [] });
      const cartId = newCart._id.toString();
  
      // Obtener productos
      const products = await ProductModel.find().lean();
  
      // Renderizar vista, pasando variables a Handlebars
      res.render('home', { cartId, products });
    } catch (error) {
      console.error('Error:', error);
      res.status(500).send('Error interno');
    }
})

connectToMongo()
// Websockets
webSocketServer.on('connection', (socket)=> {
    console.log('Usuario Conectado')
})


const PORT = 8080
server.listen(PORT, () => {
    console.log(` Servidor ok en http://localhost:${PORT}`)
})

