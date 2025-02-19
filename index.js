const express = require('express');
const cors = require('cors');
require('dotenv').config()
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

    //Get all scholarships from db
    app.get('/scholarships', async (req, res) => {
        const result = await scholarshipCollection.find().toArray();
        res.send(result);
    })

    //Get single scholarship data using id from db
    app.get('/scholarship/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await scholarshipCollection.findOne(query);
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