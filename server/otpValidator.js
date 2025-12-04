const express=require("express");
const router=express.Router();
const pool=require("./db");

// Just reply to check connection
router.get("/", async (req,res)=>{
  try{
    const test=await pool.query("SELECT NOW()");
    res.json({success:true,message:"OTP route active"});
  }catch(err){
    res.json({success:false,error:err.message});
  }
});

module.exports=router;
