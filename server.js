import express from 'express'
import path from 'path'
import { createServer } from 'http'
import productsRouter from './routes/productsRouter.js'
import cartsRouter from './routes/cartsRouter.js'
import { Server } from 'socket.io'
import { engine } from 'express-handlebars'
import viewsRouter from './routes/realTimeProducts.route.js'; 


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
app.use('/', viewsRouter);

app.get('/', (req,res)=> {
    res.render('realTimeProducts')
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

app.listen(PORT, () => {
    console.log(` Servidor ok en http://localhost:${PORT}`)
})
