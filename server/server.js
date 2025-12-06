import express from "express"
import cors from "cors"
import 'dotenv/config';
import cookieParser  from "cookie-parser";  
import connectDB from "./config/mongodb.js";
import authRouter from "./routes/authRouter.js"
import userRouter from "./routes/userRoutes.js";

const app=express();
const port=process.env.PORT||4000
connectDB()
app.use(express.json());
app.use(cookieParser());

// --- START OF REQUIRED FIX ---

// Define the origins allowed to access the API
const allowedOrigins = [
    'http://localhost:3000', // Assuming your frontend runs here (e.g., using http-server)
    'http://127.0.0.1:3000', // A common alternative when running locally
    // If you run the file directly from disk (file://), you might need to allow the default host origin too:
    'http://localhost:4000',
    'http://10.215.38.22:3000'
];

app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps or curl requests)
        // and allow requests from our list of allowed origins.
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true, // This is essential for sending and receiving cookies
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// --- END OF REQUIRED FIX ---


//API Endpoints
app.get('/',(req,res)=>res.send("API Working fine"));
app.use('/api/auth',authRouter);
app.use('/api/user',userRouter);


app.listen(port,()=>console.log(`Server started on PORT:${port}`));