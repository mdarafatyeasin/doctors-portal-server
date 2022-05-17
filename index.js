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

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

// api
async function run() {
  try {
    await client.connect();
    const servicesCollection = client.db('doctors_portal').collection('services');
    const bookingCollection = client.db('doctors_portal').collection('booking');


    /**
     * API Nameing Convention * 
     * app.get('/booking) // get all booking 
     * app.get('/booking/:id) get a specific booking
     * app.post('/booking) // add a booking
     * app.patch('/booking/:id) //update a specific booking
     * app.delete('/booking/:id) // delete a specific booking
     * */

    app.get('/service', async (req, res) => {
      const quary = {};
      const cursor = servicesCollection.find(quary);
      const services = await cursor.toArray();
      res.send(services)
    })

    app.get('/available', async (req, res) => {
      const date = req.query.date || 'May 17, 2022';

      // stape 1 (get all the service)
      const services = await servicesCollection.find().toArray();

      // stape 2 (get the booking of that day)
      const quary = { date: date }
      const booking = await bookingCollection.find(quary).toArray();


      // 
      services.forEach(service => {
        const serviceBooking = booking.filter(b => b.treatment === service.name);

        const booked = serviceBooking.map(s => s.slot);
        const available = service.slots.filter(s => !booked.includes(s));
        service.available = available;
      })
      res.send(services)
    })


    app.post('/booking', async (req, res) => {
      const booking = req.body;
      const quary = { treatment: booking.treatment, date: booking.date, patient: booking.patient }
      const exist = await bookingCollection.findOne(quary)
      if (exist) {
        return res.send({ success: false, booking: exist })
      }
      else {
        const request = await bookingCollection.insertOne(booking)
        return res.send({ success: true, request })
      }
    })


  }
  finally {
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