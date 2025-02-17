import express from 'express'
import path from 'path'
import { createServer } from 'http'
import productsRouter from './routes/productsRouter.js'
import cartsRouter from './routes/cartsRouter.js'
import { Server } from 'socket.io'
import { engine } from 'express-handlebars'
import getProducts from './routes/productsRouter.js'


const app = express()
const server = createServer(app)
const webSocketServer = new Server(server)

// Handlebars
app.engine('handlebars', engine())
app.set('view engine', 'handlebars')
app.set('views', path.join(path.resolve(), 'views'))

// Middleware
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(express.static('public'));


// Rutas
app.use('/api/products', productsRouter)
app.use('/api/carts', cartsRouter)

app.get('/', (req,res)=> {
    res.render('home', getProducts())
})

// Websockets

webSocketServer.on('connection', (socket)=> {
    console.log('Usuario Conectado')

    socket.emit('updateProducts', getProducts())

    socket.on('newProduct', (product)=>{
        addProduct(product)
        webSocketServer.emit('updateProducts', getProducts())
    })

    socket.on('deleteProducts', (id)=>{
        removeProduct(id)
        webSocketServer.emit('updateProducts', getProducts())
    })
    
})


const PORT = 8080

server.listen(PORT, () => {
    console.log(` Servidor ok en http://localhost:${PORT}`)
})

/*2) Ademas la segunda pre-entrega pide:
	-Vista home.handlebars que muestre la lista de todos los productos.
	-Vista realTimeProducts.handlebars en el endpoint /realtimeproducts para mostrar los mismos productos, pero actualizarlos con websockets.
En tu código, estás haciendo:app.get('/', (req, res) => { res.render('realTimeProducts');});Y además usas un router viewsRouter que también hace res.render('realTimeProducts').
Lo ideal para cumplir con la consigna seria crear la ruta /home (o algo equivalente) que renderice home.handlebars, y tenes que pasar products a la vista home.handlebars (si quieres 
mostrar la lista de productos), y ademas la ruta /realtimeproducts debe renderizar realTimeProducts.handlebars, de acuerdo a lo que pide la consigna.
Luego en la consigna, se proponen dos enfoques para la creación/eliminación de productos en realTimeProducts.handlebars:
	-Envío directo vía WebSocket: El formulario emite un socket.emit('newProduct', product). Luego, en el servidor (server.js), en socket.on('newProduct', ...), creas el producto 
	y emitis updateProducts.socke
	-Envío vía HTTP + emisión de Socket.io: El formulario hace un fetch o axios.post('/api/products'). Luego, en la ruta POST, creas el producto y, al final, llamas 
	webSocketServer.emit('updateProducts', ...).No es incorrecto mezclar ambos, pero lo más limpio es elegir uno. */
