const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const cookieParser = require('cookie-parser');
const mongoSanitize=require('express-mongo-sanitize');
const helmet=require('helmet');
const {xss}=require('express-xss-sanitizer');
const rateLimit=require('express-rate-limit');
const hpp=require('hpp');
const cors=require('cors');
const swaggerJsDoc = require('swagger-jsdoc'); 
const swaggerUI = require('swagger-ui-express');

const dentists = require('./routes/dentists');
const auth = require('./routes/auth');
const appointments = require('./routes/appointments');

dotenv.config({ path: './config/config.env' });

connectDB();

const app = express();

const swaggerOptions={
    swaggerDefinition:{
        openapi: '3.0.0',
        info: {
            title: 'Dental Booking API',
            version: '1.0.0',
            description: 'A simple Express VacQ API'
        } ,
        servers: [
            {
                url: 'http://localhost:5003/api/v1'
            }
        ],
    },
    apis:['./routes/*.js'], 
};

const swaggerDocs=swaggerJsDoc(swaggerOptions); 
app.use('/api-docs',swaggerUI.serve, swaggerUI.setup(swaggerDocs));

app.set('query parser','extended');

app.use(express.json());
app.use(cookieParser());
app.use(mongoSanitize());
app.use(helmet());
app.use(xss());
app.use(hpp());
app.use(cors());

const limiter=rateLimit({
    windowMs:10*60*1000,
    max: 100 
});
app.use(limiter);


app.use(express.static('public'));

app.use('/api/v1/dentists', dentists);
app.use('/api/v1/auth', auth);
app.use('/api/v1/appointments',appointments);

const PORT = process.env.PORT || 5003;

const server = app.listen(PORT, () => {
    console.log('Server running in ', process.env.NODE_ENV, ' mode on port ',PORT);
});

process.on('unhandledRejection',(err,promise)=>{
    console.log(`Error: ${err.message}`);

    server.close(()=>process.exit(1));
});