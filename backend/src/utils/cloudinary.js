import { v2 as cloudinary } from "cloudinary";
import fs from "fs";





// Configuration
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET // Click 'View API Keys' above to copy your API secret
});

// Upload an File
const uploadFile = async (localFilePath) => {
    try {
        if (!localFilePath) return null;


        const uploadResult = await cloudinary.uploader
            .upload(
                localFilePath, {
                resource_type: "auto",
            }
            )
            .catch((error) => {
                console.log("Unable to Upload File Try Again Later", error);
            })
        fs.unlinkSync(localFilePath); // Remove file from server after upload
        return uploadResult
    } catch (error) {
        console.log(error);
        fs.unlinkSync(localFilePath);
        return null

    }

}



export { uploadFile }