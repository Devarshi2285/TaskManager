const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const { getStorage, getDownloadURL } = require('firebase-admin/storage');
require('dotenv').config();
const connectToDatabase = require('./dbconnect');
const bodyParser = require('body-parser');
const multer = require('multer');
const admin = require('firebase-admin');
const serviceAccount = require('./myfirstproject-5c8ad-firebase-adminsdk-1kvfp-89042d2629.json');

// Initialize Firebase Admin with service account credentials
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: process.env.BUCKET_NAME
});

const storage = admin.storage();
const bucket = storage.bucket();

const multerStorage = multer.memoryStorage();
const upload = multer({ storage: multerStorage });

const authRoutes = require('./routes/authRoutes');
const taskRoutes = require('./routes/taskRoutes');
const teamRoutes = require('./routes/teamRoutes');
const messageRoutes = require('./routes/messageRoutes');

const app = express();
const allowedOrigin = process.env.FRONT_END_URI;
app.use(cors({
  origin: allowedOrigin
}));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.json());

(async () => {
  try {
    await connectToDatabase();

    app.get('/', (req, res) => {
      res.send('Server is running');
    });

    app.use('/auth', authRoutes);
    app.use('/task', taskRoutes);
    app.use('/team', teamRoutes);
    app.use('/message', messageRoutes);

    // Upload route with download URL retrieval
    app.post('/upload', upload.single('file'), async (req, res) => {
      const file = req.file;

      if (!file) {
        return res.status(400).send('No file uploaded.');
      }

      try {
        const metadata = {
          metadata: {
            // Optional: Add custom metadata (avoid using firebaseStorageDownloadTokens)
          },
          contentType: file.mimetype
        };

        const blob = bucket.file(file.originalname);
        const fileName = file.originalname;
        const fileRef = storage.bucket(process.env.BUCKET_NAME).file(fileName);
        const blobStream = blob.createWriteStream({
          metadata: metadata
        });

        blobStream.on('error', (err) => {
          console.error('Error uploading file:', err);
          res.status(500).send('Error uploading file.');
        });

        blobStream.on('finish', async () => {
          try {
            const downloadURL = await getDownloadURL(fileRef);
            
            res.status(200).json({ downloadURL });
          } catch (error) {
            console.error('Error getting download URL:', error);
            res.status(500).send('Error getting download URL.');
          }
        });

        blobStream.end(file.buffer);
      } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Error uploading file.');
      }
    });
    const PORT = process.env.PORT || 3004;
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to connect to the database and start the server:', error);
  }
})();

module.exports = app; // For potential unit testing
