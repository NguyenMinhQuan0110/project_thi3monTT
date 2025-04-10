import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import session from "express-session";

import "reflect-metadata"
import webRouter from "@routers/web.route";
import adminRouter from '@routers/admin.route';
import { AppDataSource } from "@databases/dbsports";
import path from "path";


dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3000;
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
// parse application/json
app.use(bodyParser.json())



// config views engine
app.set('view engine', 'ejs');
app.set('views', './src/views');

app.use(cookieParser());
app.use(session({
  secret: 'mykey',// ma hoa ID session
  resave: false,// khong luu lai session neu khong thay doi
  saveUninitialized: true,// luu lai session khi chua duoc khoi tao
}))

app.use(express.static(path.join(__dirname,'public')));

//connect database
AppDataSource.initialize().then(() => { 
  console.log('initialized')
}).catch((e) => {
console.error('Error while connecting to the database')
console.log(e);
process.exit(1)  // exit with error code 1 to indicate failure to connect to the database
});

// Middleware để sử dụng router
app.use('/',webRouter);
app.use('/admin',adminRouter);

app.listen(port, () => {
  console.log(`[server]: Server is running at http://192.168.100.176:${port}`);
});
