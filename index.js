const express = require('express');
const cors = require('cors');
const port = process.env.PORT || 5000;
const app = express();
const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config();

// middleware
app.use(express.json());
app.use(cors());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.PASSWORD}@cluster0.ift16.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
console.log(uri)
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

// api
async function run(){
  try{
    await client.connect();
    const servicesCollection = client.db('doctors_portal').collection('services');

    app.get('/service', async(req, res)=>{
      const quary = {};
      const cursor = servicesCollection.find(quary);
      const services = await cursor.toArray();
      res.send(services)
    })    

  }
  finally{
    // await client.close();
  }
};
run().catch(console.dir)




app.get('/', (req, res) => {
    res.send('Hello World!')
  })
  
  app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
  })