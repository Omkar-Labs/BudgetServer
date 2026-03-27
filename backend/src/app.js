import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';


const app = express();

app.use(cors({
    origin:process.env.origin,
    credentials:true,
    methods:["GET","POST","PUT","DELETE"],
    allowedHeaders:["Content-Type","Authorization"],
    accessControlAllowOrigin:process.env.ORIGIN,
    accessControlAllowCredentials:true,

}));
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(express.static("public"));
app.use(cookieParser());

//user router is here
import router from './routes/user.route.js';

app.use("/api/v1/user" , router)


export default app;