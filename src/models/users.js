const mongoose = require('mongoose')
const validator = require('validator')
const bcryptjs = require('bcryptjs')
const jwt = require('jsonwebtoken')
const Tasks = require('./tasks')

const userSchema = mongoose.Schema({
    name:{
        type:String,
        required:true,
        trim:true
    },
    age:{
        type:Number,
        default:0,
        Validate(value){
            if(value<0)
                throw new error("age must be positive")
        }
    },
    email:{
        type:String,
        unique:true,
        trim:true,
        validate(value){
            if(!validator.isEmail(value))
                throw new Error("email is not valid")
        }
    },
    password:{
        type:String,
        required:true,
        trim:true,
        validate(value){
            if(value.length < 6)
            {
                throw new Error("password length should be more than 6")
            }
            if(value == "password")
            {
                throw new Error("use a different password")
            }
        }
    },
    tokens :[{
        token:{
            type:String,
            required:true
        }
    }],
    avatar:{
        type:Buffer
    }
},{timestamps:true})

userSchema.virtual('tasks',{ref:'Tasks',localField:'_id',foreignField:'owner'})


//when returning a response for a user remove the password and token field

userSchema.methods.toJSON = function(){
    const user = this
    const userObject = user.toObject()        //toObject converts mongoose document into a object
    delete userObject.password
    delete userObject.tokens
    return userObject
}

userSchema.methods.createAuthTokens = async function(){
    const user = this
    const token = jwt.sign({_id:user._id.toString()},process.env.AUTH_SECRET_KEY)                                                
    user.tokens = user.tokens.concat({token})
    await user.save()
    return token
}

userSchema.statics.findByCredentials = async (email,password)=>{

    const user = await User.findOne({email})                           
    
    if(!user)
        throw new Error("unable to login")

    const isValid = await bcryptjs.compare(password,user.password)
    if(!isValid)
        throw new Error("unable to login")
    return user

}

//Middlewares to run before save and remove operations

userSchema.pre('save',async function(next){
    const user = this
    if(user.isModified('password'))
        user.password = await bcryptjs.hash(user.password,8)
    next()
})

userSchema.pre('remove',async function(next){
    const user = this
    await Tasks.deleteMany({owner:user._id})
    next()
})


const User = mongoose.model('User',userSchema)

module.exports = User