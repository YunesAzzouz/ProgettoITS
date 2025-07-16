const { MongoClient } = require("mongodb");

const uri = 'mongodb+srv://allievosettimig:ProgettoITS@projectwork.6lruq01.mongodb.net/?retryWrites=true&w=majority&appName=ProjectWork'; // Replace this
const client = new MongoClient(uri);

async function run() {
  try {
    await client.connect();
    const database = client.db("ProgettoITS");
    const collection = database.collection("Filtro");

    await collection.insertMany([
      {
        ID: 1,
        Nome: "Glutine",
      },
      {
        ID: 2,
        Nome: "Crostacei e Derivati",
      },
      {
        ID: 3,
        Nome: "Uova e Derivati",
      },
      {
        ID: 4,
        Nome: "Pesce e Derivati",
      },
      {
        ID: 5,
        Nome: "Arachidi e Derivati",
      },
      {
        ID: 6,
        Nome: "Soia e Derivati",
      },
      {
        ID: 7,
        Nome: "Latte e Derivati",
      },
      {
        ID: 8,
        Nome: "Frutta a guscio e derivati",
      },
      {
        ID: 9,
        Nome: "Sedano e derivati",
      },
      {
        ID: 10,
        Nome: "Senape e derivati",
      },
      {
        ID: 11,
        Nome: "Semi di Sesamo",
      },
      {
        ID: 12,
        Nome: "Anidride solforosa e solfiti in concentrazioni superiori a 10 mg/kg o 10 mg/l espressi come SO2",
      },
      {
        ID: 13,
        Nome: "Lupino e derivati",
      },
      {
        ID: 14,
        Nome: "Molluschi e derivati",
      },
      {
        ID: 15,
        Nome: "Nichel",
      },
      {
        ID: 16,
        Nome: "Fruttosio",
      },
      {
        ID: 17,
        Nome: "Additivi Alimentari (coloranti/conservanti)",
      },
      {
        ID: 18,
        Nome: "Lieviti",
      },
      {
        ID: 19,
        Nome: "Solanacee (pomodori, peperoni, melanzane, patate)",
      },
      {
        ID: 20,
        Nome: "Agrumi",
      }
    ]);

    console.log("Ristoranti inserted!");
  } finally {
    await client.close();
  }
}

run().catch(console.dir);