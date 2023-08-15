const mongoose=require('mongoose')
mongoose.connect(process.env.mongo_url)
.then(()=>{
    console.log("connected with database");
}).catch(()=>{
    console.log("failed to connect with database");
})