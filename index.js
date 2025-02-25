const express = require('express');
const cors = require('cors');
require('dotenv').config()
const jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 8000;

//middleware
const corsOptions = {
    origin: [
        'http://localhost:5173',
        'http://localhost:5174',
        'https://eduscholar-f1c0d.web.app',
    ],
    credentials: true,
    optionSuccessStatus: 200,
}

app.use(cors(corsOptions));
app.use(express.json());

//token verify 
const verifyToken = (req, res, next) => {
  console.log('inside verify token', req.headers);
  if(!req.headers.authorization) {
    return res.status(401).send({ message: 'unauthorized access' });
  }
  const token = req.headers.authorization.split(' ')[1];
  jwt.verify(token, process.env.ACCESS_SECRET_TOKEN, (err, decoded) => {
     if (err) {
       return res.status(401).send({ message: 'unauthorized access' });
     }
     req.decoded = decoded;
     next()
  } )
}

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.hmtao.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    //await client.connect();
    
    const scholarshipCollection = client.db('eduScholar').collection('scholarships');
    const usersCollection = client.db('eduScholar').collection('users');

    //jwt generate
    app.post('/jwt', async (req, res) => {
      const user = req.body;
      const token = jwt.sign(user, process.env.ACCESS_SECRET_TOKEN, {
        expiresIn: '7d',
      })
      res.send({ token })
    })

    //Get all scholarships from db
    app.get('/scholarships', async (req, res) => {
        const result = await scholarshipCollection.find().toArray();
        res.send(result);
    })

    //Get single scholarship data using id from db
    app.get('/scholarship/:id', verifyToken, async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await scholarshipCollection.findOne(query);
      res.send(result)
    })

    //Save a user data in db
    app.put('/user', async (req, res) => {
      const user = req.body;
      const query = { email: user?.email }
      
      //save user for the first time
      const options = { upsert: true };
      const updateDoc = {
         $set: {
           ...user,
          timestamp: Date.now(),
         },
      }
      const result = await usersCollection.updateOne(query, updateDoc, options);
      res.send(result)

    })

    //Get all users from db
    app.get('/users', async (req, res) => {
      const result = await usersCollection.find().toArray();
      res.send(result);
    })

    //Get a user using email from db
    app.get('/user/:email', async (req, res) => {
      const email = req.params.email;
      const result = await usersCollection.findOne({ email });
      res.send(result)
    })

    //Update a user role
    app.patch('/users/update/:email', async (req, res) => {
      const email = req.params.email;
      const user = req.body;
      const query = { email };
      const updateDoc ={
         $set: {
            ...user,
            timestamp: Date.now(),
         },
      }
      const result = await usersCollection.updateOne(query, updateDoc);
      res.send(result)
    })

    //delete user from db 
    app.delete('/users/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await usersCollection.deleteOne(query);
      res.send(result)
    })


    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    //await client.close();
  }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('Hello All Student from EduScholar Server..')
})

app.listen(port, () => {
    console.log(`EduScholar Server is running on port: ${port}`)
})