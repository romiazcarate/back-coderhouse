import mongoose from 'mongoose'
import dotenv from 'dotenv'

dotenv.config()

export const connectToMongo = async () => {
    try{
        mongoose.connect(process.env.MONGO_KEY, {dbName:'Ecommerce'})
        .then(() => console.log('Se conecto a la DB'))
        
    }catch(e){
        console.log('Error al conectar la DB')
    }
}