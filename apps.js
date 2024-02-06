import express from "express";
import multer from "multer";
import axios from "axios";
import path from "path";
import fs from "fs";
import { setWallpaper } from 'wallpaper';

const app = express();
const port = 3000;

const storage = multer.diskStorage({
  destination: './uploads/temp',
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

function deleteImage(filePath) {
  fs.unlink(filePath, (err) => {
    if (err) {
      console.error(`Error deleting file: ${filePath}`);
    } else {
      console.log(`File deleted: ${filePath}`);
    }
  });
}

async function fetchRandomImage() {
  try {
    const response = await axios.get('https://source.unsplash.com/random?night');
    return response.request.res.responseUrl; 
  } catch (error) {
    console.error('Error fetching random image:', error.message);
    throw error;
  }
}

async function setWallpaperFromUrl(imageUrl) {
  try {
    const imageResponse = await axios.get(imageUrl, { responseType: 'arraybuffer' });

    const imagePath = './uploads/temp/component.jpg';
    fs.writeFileSync(imagePath, imageResponse.data);

    // Set wallpaper
    await setWallpaper(imagePath);

    const expiryTime = 10000;

    setTimeout(() => {
      deleteImage(imagePath);
    }, expiryTime);

    console.log('Random image uploaded successfully and set as wallpaper!');
  } catch (error) {
    console.error('Error processing image:', error.message);
  }
}

async function uploadRandomImage() {
  const imageUrl = await fetchRandomImage();
  await setWallpaperFromUrl(imageUrl);
}

const uploadInterval = 10000; // 1 hour
setInterval(uploadRandomImage, uploadInterval);

app.use(express.static('uploads'));

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
