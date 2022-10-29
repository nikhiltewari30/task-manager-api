const express = require('express')

const Task = require('../models/tasks')
const User = require('../models/users')
const auth = require('../middleware/auth')
const multer = require('multer')
const sharp = require('sharp')

const {sendEmail,sendDeleteEmail} = require('../emails/account')

const upload = multer({
    //dest:'images',
    limits:{
    fileSize:1000000
   },
   fileFilter(req,file,cb){
    if(!file.originalname.match(/\.(jpg|jpeg|png)$/))
        return cb(new Error("file should be an image"))
    
    cb(undefined,true)

}})

const router = new express.Router()

router.post('/users',async (req,res)=>{
    const user = new User(req.body)
    try{
        const token = await user.createAuthTokens()
        res.status(201).send({user,token})
    }
    catch(e){
        res.status(400).send(e)
    }

    // user.save().then((result)=>{
    //     res.status(201).send(result)
    // }).catch((e)=>{
    //     res.status(400).send()
    // })

})

router.post('/user/login',async(req,res)=>{

    try{
        const user = await User.findByCredentials(req.body.email,req.body.password)                                                  
        const token = await user.createAuthTokens()         
        res.send({user,token})
    }catch(e){
        res.status(400).send({error:e.message})
    }
})

router.post('/users/logout',auth,async(req,res)=>{
    try{
        req.user.tokens = req.user.tokens.filter(token => req.token !== token.token ) 
        req.user.save();
        res.send(req.user)                     
    }catch(e){
        res.status(500).send(e)
    }
})

router.get('/users/:id/avatar',async(req,res)=>{
    try{
        const id = req.params.id
        const user = await User.findById(id)

        if(!user || !user.avatar)
            throw new Error()

        res.set('content-type','image/jpg')                  //setting up headers
        res.send(user.avatar)
    }catch(e){
        res.status(400).send()
    }
})

router.post('/users/logoutAll',auth,async(req,res)=>{
    try{
        req.user.tokens = []
        await req.user.save()
        res.send({msg:'all users logged out'})
    }catch(e){
        res.status(500).send(e)
    }
})

router.post('/users/me/avatar',auth,upload.single('avatar'),async(req,res)=>{
    const buffer = await sharp(req.file.buffer).resize({width:250,height:250}).jpeg().toBuffer()
    req.user.avatar = buffer

    await req.user.save()

    res.status(200).send(req.user)

},(error,req,res,next)=>{
    res.status(400).send({error:error.message})                                           // this function is for, when middleware 
                                                                                          // throws some error.Like in this case
})                                                                                        // image size too large or wrong file type uploaded.

router.delete('/users/me/avatar',auth,async(req,res)=>{
    req.user.avatar = undefined                                                    
    await req.user.save()
    res.status(200).send()
})
router.patch('/users/me',auth,async(req,res)=>{

    const updates = Object.keys(req.body)
    const allowedUpdates = ['name','email','password','age']

    const isValidUpdate = updates.every((update)=> allowedUpdates.includes(update))
    if(!isValidUpdate)
        return res.status(400).send({error:'inavlid updates'})
    try{
        

        updates.forEach((update)=>{
            req.user[update] = req.body[update]
        })

        await req.user.save()

        res.send(req.user)
    }catch(e)
    {
        res.status(500).send(e)
    }
})

router.get('/users/me',auth,async(req,res)=>{

    res.send(req.user)
    // User.find({}).then((users)=>{
    //     res.send(users)
    // }).catch((e)=>{
    //     res.status(505).send()
    // })
})

// router.get('/users/:id',async(req,res)=>{
//     const id = req.params.id

//     try{
//         const user = await User.findById(id)
//         res.send(user)
//     }
//     catch(e){
//         res.status(500).send()
//     }
//      // User.findById(id).then((user)=>{
//     //     if(!user)
//     //     {
//     //         return res.status(400).send()
//     //     }
//     //     res.send(user)
//     // }).catch((e)=>{
//     //     res.status(500).send()
//     // })
// })

router.delete('/users/me',auth,async(req,res)=>{
    try{
        const user = await req.user.remove()
        sendDeleteEmail(user.email,user.name)
        res.send(user)

    }catch(e){
        res.status(500).send(e)
    }
})




module.exports = router