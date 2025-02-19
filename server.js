import express from 'express'
import path from 'path'
import { createServer } from 'http'
import { Server } from 'socket.io'
import { engine } from 'express-handlebars'

// Importamos el router de productos como función factory
import createProductsRouter, { getProducts } from './routes/productsRouter.js';
import cartsRouter from './routes/cartsRouter.js'

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
    const products = await getProducts();
    res.render('home', { title: 'Mi Tienda', products });
})

// Websockets
webSocketServer.on('connection', (socket)=> {
    console.log('Usuario Conectado')
})


const PORT = 8080
server.listen(PORT, () => {
    console.log(` Servidor ok en http://localhost:${PORT}`)
})

