const dns = require("node:dns");
dns.setServers(["8.8.8.8", "8.8.4.4"]);

const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { MongoClient, ServerApiVersion } = require("mongodb");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// ✅ IMPORTANT middleware
app.use(cors());
app.use(express.json());

const uri = process.env.MONGODB_URI;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    await client.connect();

    const db = client.db("fluxride");
    const carCollection = db.collection("cars");

    app.get("/cars",async(req,res)=>{
      const result = await carCollection.find().toArray();
      res.json(result)
    })

    app.post("/cars", async (req, res) => {
      try {
        const carData = req.body;

        // debug
        console.log("Received car:", carData);

        if (!carData || Object.keys(carData).length === 0) {
          return res.status(400).json({
            success: false,
            message: "No car data received",
          });
        }

        const result = await carCollection.insertOne(carData);

        res.json({
          success: true,
          insertedId: result.insertedId,
        });
      } catch (err) {
        console.error(err);
        res.status(500).json({
          success: false,
          message: "Insert failed",
        });
      }
    });

    

    await client.db("admin").command({ ping: 1 });
    console.log("MongoDB connected successfully!");
  } catch (error) {
    console.error(error);
  }
}

run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("server is running fine");
});

app.listen(PORT, () => {
  console.log(`server is running on ${PORT}`);
});