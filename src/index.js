// require('dotenv').config({path: './env'})
import dotenv from 'dotenv'
import { app } from './app.js'
import connectDB from "./db/index.js"

dotenv.config({
    path: './env'
})



connectDB()
.then(() => {
    app.on("error", (err) => {
        console.error("App failure ::", err)
    })
    app.listen(process.env.PORT || 8000, () => {
        console.log(`Server is running on http://localhost:${process.env.PORT}`);
    });
})
.catch(err => {
    console.error("DB Connection failed :: ", err)
})