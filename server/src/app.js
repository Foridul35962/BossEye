import express from 'express'
import cors from 'cors'
import errorHandler from './helpers/ErrorHandler.js'
import router from './routes/index.route.js'

const app = express()

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))


app.use(express.json())
app.use(express.urlencoded({ extended: true }))


app.get('/', (req, res) => {
    res.send("BossEye server is running ...")
})

app.use("/api", router)


app.use(errorHandler)

export default app