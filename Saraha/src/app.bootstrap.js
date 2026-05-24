import {  port } from '../config/config.service.js'
import { globalErrorHandling, sendEmail, verifyEmailTemplate } from './common/utils/index.js'
import express from 'express'
import {authRouter ,userRouter} from './modules/index.js'
import { connectDB } from './DB/index.js'
import {resolve} from 'node:path'
import cors from 'cors'
import { connectRedis } from './DB/redis.connection.db.js'
import { messageRouter } from './modules/message/index.js'


async function bootstrap() {
    const app = express()
    //convert buffer data
    app.use(cors(),express.json());
    app.use("/uploads",express.static(resolve("../uploads")))

    //DB
   await connectDB();
   await connectRedis();
      
    //application routing
    app.get('/', (req, res) => res.send('Hello World!'))
     app.use('/auth',authRouter);
     app.use('/user',userRouter);
     app.use('/message',messageRouter);

    //invalid routing
    app.use('{/*dummy}', (req, res) => {
        return res.status(404).json({ message: "Invalid application routing" })
    })

    //error-handling
    app.use(globalErrorHandling)
    
    app.listen(port, () => console.log(`Example app listening on port ${port}!`))
}
export default bootstrap