import moongoose from "mongoose";

const connectDB = async()=>{
    try {
        await moongoose.connect(process.env.MONGO_URI);
        console.log("MongoDb connected successfully");
    } catch (error) {
        console.log("MongoDb connection failed");
        console.log(error);
        process.exit(1);

    }
}

export default connectDB;