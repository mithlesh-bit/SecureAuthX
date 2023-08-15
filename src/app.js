require("dotenv").config();
const express = require('express')
require('./db/conn')
const Register = require('./models/registers')
const auth=require('./middleware/auth')
const app = express();
const PORT = 3000;
const path = require('path')
const ejs = require('ejs')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken');
const { log } = require("console");
const cookieParser=require('cookie-parser')


const staticPath = path.join(__dirname, "../public")

app.use(express.static(staticPath));
app.set("view engine", "ejs")
app.use(cookieParser())
app.use(express.json())
app.use(express.urlencoded({ extended: false }))

app.get('/protected',auth, (req, res) => {
    console.log("cookie lao thabhi ane dunga",req.cookies.jwt);
    res.render('protected');
});

app.get('/logout',(req,resp)=>{
resp.clearCookie('jwt')
console.log("hii");
resp.redirect('/')
})
app.get('/', (req, resp) => {
    resp.render('index')
})
app.get('/login', (req, resp) => {
    resp.render('login')
})
app.get('/register', (req, resp) => {
    resp.render('register')
})

app.post('/register', async (req, resp) => {
    try {
        const password = req.body.pass
        const confirmpassword = req.body.repass
        if (password == confirmpassword) {

            const userdata = new Register({
                name: req.body.name,
                email: req.body.email,
                gender: req.body.gender,
                phone: req.body.phone,
                age: req.body.age,
                password: req.body.pass,
                confirmpassword: req.body.repass
            })
            console.log(userdata);
            const token = await userdata.generateAuthToken()
            console.log("generatet token is:", token);

            resp.cookie("jwt", token,{
                expires:new Date(Date.now()+300000),
                httpOnly:true
            });

            

            const registered = await userdata.save()
            resp.status(201).render('index')
        } else {
            resp.send("pass not matching")
        }

    } catch (error) {
        resp.send(error)
        console.log("registerpage ka error post method");
    }
})

// login post
app.post('/login', async (req, resp) => {
    const email = req.body.email
    const password = req.body.pass
    try {
        const useremail = await Register.findOne({ email: email })
        const ismatch = await bcrypt.compare(password, useremail.password)
        const token = await useremail.generateAuthToken()

        resp.cookie("jwt", token,{
            expires:new Date(Date.now()+300000),
            httpOnly:true
        });

        if (ismatch) {

            resp.status(201).redirect('/')

        } else {
            resp.send('invalid credential')
        }
    } catch (error) {
        resp.send("user not found")
    }

})


// const securepass=async (password)=>{
//     const passHash=await bcrypt.hash(password,12);
//     console.log(passHash);
// }
// securepass("1234")


// token creation

// const createToken=async()=>{
//     const expirationTime = 60 * 5;
//     const token=await jwt.sign({_id:"1234567890"},secretKey,{ expiresIn: expirationTime })
// console.log(token);

// const userVer=await jwt.verify(token,secretKey)
// console.log(userVer);

// }

// createToken()




app.listen(PORT, function (err) {
    if (err) console.log("Error in server setup")
    console.log("Server listening on Port", PORT);
})

