const sgmail = require('@sendgrid/mail')

const apikey = process.env.SET_API_KEY

sgmail.setApiKey(apikey)



const sendEmail = (email,name)=>{

    sgmail.send({
        from:"nikhiltewari30@gmail.com",
        to:email,
        subject:"Welcome email",
        text:`Welcome ${name}. Hope you like our service`
    })

}

const sendDeleteEmail = (email,name)=>{

    sgmail.send({
        from:'nikhiltewari30@gmail.com',
        to:email,
        subject:'delete email',
        text:`We are sorry ${name} that you are leaving`
    })

}

module.exports = {
    sendEmail,sendDeleteEmail
}

