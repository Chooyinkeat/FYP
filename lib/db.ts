import mysql, { Pool } from "mysql2/promise";

const pool: Pool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "",
  database: "visionvault",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Function to test the database connection
const DBConnection = async () => {
  try {
    const connection = await pool.getConnection();
    await connection.ping();
    connection.release();
    console.log("Database connection successful!");
  } catch (error) {
    console.error("Database connection failed:", error);
  }
};

DBConnection();

export default pool;
