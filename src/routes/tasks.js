const express = require('express')
const Task = require('../models/tasks')
const User = require('../models/users')
const auth = require('../middleware/auth')
const router = new express.Router()

router.get('/tasks',auth,async(req,res)=>{

    try{
        //const tasks = await Task.find({owner:req.user._id})
        const match = {}
        const sort = {}
        if(req.query.completed)
            match.completed = req.query.completed === 'true'
        if(req.query.sort){
            const parts = req.query.sort.split(':')
            sort[parts[0]] = parts[1]                                                                         
        }
        await req.user.populate({path:'tasks',match,options:{
            limit:parseInt(req.query.limit),
            skip :parseInt(req.query.skip),
            sort
        }})
        res.send(req.user.tasks)
    }
    catch(e){
        res.status(500).send(e)
    }
    // Task.find({}).then((tasks)=>{
    //     res.send(tasks)
    // }).catch((e)=>{
    //     res.status(500).send()
    // })
})

router.get('/tasks/:id',auth,async (req,res)=>{
    const _id = req.params.id
    try{
        const task = await Task.findOne({_id:_id,owner:req.user._id})
        res.send(task)
    }catch(e){
        res.status(500).send()
    }
    // Task.findById(id).then((task)=>{
    //     if(!task)
    //     {
    //         return res.status(404).send()
    //     }
    //     res.send(task)
    // }).catch((e)=>{
    //     res.status(500).send()
    // })
})

router.post('/task',auth,async(req,res)=>{

    const task = new Task({...req.body,owner:req.user._id})

    try{
        await task.save()
        res.send(task)
    }catch(e){
        res.status(500).send(e)
    }
    
    // res.send(task)

    // task.save().then((result)=>{
    //     res.status(201).send(result)
    // }).catch((e)=>{
    //     res.status().send(e)
    // })

})

router.patch('/tasks/:id',auth,async(req,res)=>{
    const id = req.params.id 
    const updates = Object.keys(req.body)
    const allowedUpdates = ['description','completed']

    const validUpdate = updates.every(update => allowedUpdates.includes(update))

    if(!validUpdate)
        res.status(400).send({error:'invalid update'})
    try{
        const task = await Task.findOne({_id:id,owner:req.user._id})
        
        if(!task)
            res.status(400).send({error:'task doesn\'t exist'})

        updates.forEach((update) => task[update] = req.body[update])
        await task.save()
        res.send(task)
    }catch(e){
        res.status(500).send(e)
    }
})

router.delete('/tasks/:id',auth,async(req,res)=>{

    try{
        const task = await Task.findOne({_id:req.params.id,owner:req.user._id})
        await task.remove()
        if(!task)
            res.status(400).send({error:'task does not exist'})
        res.send(task)

    }catch(e)
    {
        res.status(500).send(e)
    }

    
})

module.exports = router