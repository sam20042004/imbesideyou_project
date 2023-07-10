const express = require('express');
const app = express();
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const helmet = require('helmet');
const morgan = require('morgan');
const userRoutes = require('./routes/users');
const authRoutes = require('./routes/auth');
const postRoutes = require("./routes/posts");
const conversationRoutes = require("./routes/conversations");
const messageRoutes = require("./routes/messages");
const cors = require('cors');
const bodyParser = require("body-parser");
const multer = require('multer')
const path = require('path');

dotenv.config();

mongoose.connect(process.env.MONGO_URL)
        .then(result =>{
            console.log('Connected to the Server!');  
        })
        .catch(err =>{
            console.log(err);
        })


app.use(cors());
app.use("/images", express.static(path.join(__dirname, "public/images")));
// Middlewares
app.use(bodyParser.urlencoded({extended : false}));
app.use(express.json());
app.use(helmet());
app.use(morgan("common"));


const storage = multer.diskStorage({
    destination: (req, file, cb) =>{
      cb(null, "public/images");
  },
    filename: (req, file, cb) => {
      cb(null, new Date().toISOString + '-' + file.originalname)
    }
  })
const upload = multer({storage})

app.post('/api/upload', upload.single('file'), (req, res) => {
    try{
        return res.status(200).json("File Uploaded Successfully!")
    }
    catch(err){
        console.log(err);
    }
  })

app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/conversations", conversationRoutes);
app.use("/api/messages", messageRoutes);


app.listen(8800, ()=>{
    console.log("Server is running");
})