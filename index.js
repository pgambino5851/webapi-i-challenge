// implement your API here 
const express  = require('express');
const db = require('./data/db.js')

const server = express();

const sendUserError = (status, message, res) => {
    // This is just a helper method that we'll use for sending errors when things go wrong.
    res.status(status).json({ errorMessage: message });
    return;
  };

server.use(express.json()); // add this

server.listen(5000, () => console.log("API running on port 5000"));


server.get('/', (req, res) =>{
    res.send("It's alive!");
})

server.get('/api/users', (req, res) => {
    db.find().then(users => {
        res.status(200).json(users)
    }).catch(err => {
        //handle error
        res.status(500).json({error: err, message: "The users information could not be retrieved." })
    })
})

server.get('/api/users/:id', (req, res) => {

    const userId = req.params.id;
    // if(!userId) {
    //     res.status(404).json({message: "The user with the specified ID does not exist." })
        
    //     return;
    // }
    db.findById(userId)
    .then(user => {
        if(user.length === 0){
            res.status(404).json({message: "The user with the specified ID does not exist."})
            return;
        }
        res.status(200).json(user)
    })
    .catch(err => {
        res.status(500).json({error: "The user information could not be retrieved."})
    })
})

server.post('/api/users', (req, res) => {
    // one way to get data from the client is i the request's body
    // axios.post(url, data) => the data shows up as the body on the server
    const userInfo = req.body;
    console.log('request body: ', userInfo);
    if(userInfo.name && userInfo.bio){
        db.insert(userInfo).then(user => {
            res.status(201).json(user)
        }).catch(err => {
            //handle error
            console.log(err);
            res.status(500).json({error: err,  errorMessage: "There was an error while saving the user to the database" })
        })
    } else {
        res.status(400).json({errorMessage: "Please provide name and bio for the user"})
    }
})

server.delete('/api/users/:id', (req, res) => {
    const userId = req.params.id; //req.params has url parameters
    db.remove(userId).then(deleted => {
        res.status(204).end();
    }).catch(err => {
        res.status(500).json({ error: err, message: 'Error deleting user' });
    })
})

server.put('/api/users/:id', (req, res) => {
    const userId = req.params.id;
    const {name, bio} = req.body;
    if(!name || !bio) {
        sendUserError(400, 'Please provide name and bio for the user', res);
        return;
    }
    db.update(userId, {name, bio})
    .then(res => {
        if(res == 0) {
            sendUserError(404, "User with specified ID does not exist", res);
            return;
        }
    })
    .catch(err => {
        sendUserError(500, "User information could not be modifed", err)
    })
    db.findById(userId)
    .then(user => {
        if(user.length === 0) {
            sendUserError(404, 'User with specified ID not found', res);
            return;
        }
        res.status(200).json(user)
    })
    
})


