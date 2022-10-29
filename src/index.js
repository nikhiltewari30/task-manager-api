const express = require('express')
require('./db/mongoose')

const Task = require('./models/tasks')
const User = require('./models/users')


const userRoute = require('./routes/user')
const taskRoute = require('./routes/tasks')

const app = express()

// app.use((req,res,next)=>{
//     res.status(503).send('site under maintainance')
// })

app.use(express.json())
app.use(userRoute)
app.use(taskRoute)

// // const test = async()=>{
// //     // const task = await Task.findById('635670a0c0ba775205d9c7b5')
// //     // await task.populate('owner')
// //     // console.log(task.owner)

// //     const user = await User.findById('63566f12c0ba775205d9c7a9')
// //     await user.populate('tasks')
// //     console.log(user.tasks)
// // }

// test()


const port = process.env.PORT 

app.listen(port,()=>{
    console.log(`server is up on port ${port}`)
})