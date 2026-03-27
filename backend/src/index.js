import dotenv from 'dotenv'
dotenv.config()
import app from "./app.js";
import connectDB from "./db/index.js";



const PORT = process.env.PORT || 5000;

// Start the server
connectDB()
.then((result)=>{
    app.listen(PORT,()=>{
        console.log(`Server is running on port ${PORT}`);
    });
})
.catch((error)=>{
    console.log("Failed to connect to the database");
    console.log(error);
    process.exit(1);
});