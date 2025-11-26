const mongoose= require('mongoose');



const dataBaseConected= ()=>{
   mongoose.connect(process.env.MONGO_URI)
   .then(()=>{
    console.log("DataBase Conencted");
   }).catch((error)=>{
     console.error(error);
   })
   
}



module.exports= dataBaseConected;