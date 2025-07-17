const axios = require('axios');
const { MongoClient } = require('mongodb');

const uri = 'mongodb+srv://allievosettimig:ProgettoITS@projectwork.6lruq01.mongodb.net/?retryWrites=true&w=majority&appName=ProjectWork';
const client = new MongoClient(uri);

async function run() {
  try {
    await client.connect();

    const database = client.db('ProgettoITS');
    const collection = database.collection('ProjectWork');

    // Api endpoint 
    const response = await axios.get('https://api.openweathermap.org/data/3.0/onecall?lat=42.334902&lon=12.3833577&exclude={part}&appid=8538788ed3e43a05b6ec6dcbb2c76068');

    const data = response.data;

    // Inserisce i dati nella collection
    if (Array.isArray(data)) {
      await collection.insertMany(data);
    } else {
      await collection.insertOne(data);
    }

    console.log('Data inserted successfully!');
  } catch (err) {
    console.error(err);
  } finally {
    await client.close();
  }
}

run();
