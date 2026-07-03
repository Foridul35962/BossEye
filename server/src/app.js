import express from 'express'
import cors from 'cors'
import errorHandler from './helpers/ErrorHandler.js'

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

app.get("/health", (req, res) => {
    res.status(200).json({ status: "ok" });
});

app.use(errorHandler)

export default app