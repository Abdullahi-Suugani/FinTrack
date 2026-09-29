import mongoose from 'mongoose';
const schema=new mongoose.Schema({title:{type:String,required:true,trim:true},amount:{type:Number,required:true,min:0},type:{type:String,enum:['income','expense'],required:true},category:{type:String,required:true,trim:true},date:{type:Date,required:true},user:{type:mongoose.Schema.Types.ObjectId,ref:'User',required:true}},{timestamps:true});
schema.index({user:1,date:-1});schema.index({user:1,category:1});schema.index({user:1,type:1});export default mongoose.model('Transaction',schema);
