import mysql from 'mysql2/promise'
import dotenv from 'dotenv'

dotenv.config({ path: 'src/.env' })

const pool = mysql.createPool({
    host: process.env.BD_HOST,
    user: process.env.BD_USER,
    password: process.env.BD_PSW,
    database: process.env.BD_NAME,
    port: process.env.BD_PORT,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
})

export default pool
