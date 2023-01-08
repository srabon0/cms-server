require("dotenv").config();
const express = require("express");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
const port = process.env.PORT || 5000;

const cors = require("cors");

app.use(cors());
app.use(express.json());

const uri = process.env.DB_URI
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

const run = async () => {
  try {
    const db = client.db("klog");
    const blogsClollection = db.collection("blogs");

    app.get("/blogs", async (req, res) => {
      const cursor = blogsClollection.find({});
      const blog = await cursor.toArray();

      res.send({ status: true, data: blog });
    });

    app.get("/blog/:id", async (req, res) => {
      const id = req.params.id;
    
      const result = await blogsClollection.findOne({ _id: ObjectId(id) })
  
      res.send(result);
    });

    app.post("/blog", async (req, res) => {
      const blog = req.body;

      const result = await blogsClollection.insertOne(blog);

      res.send(result);
    });

    app.delete("/blog/:id", async (req, res) => {
      const id = req.params.id;

      const result = await blogsClollection.deleteOne({ _id: ObjectId(id) });
      res.send(result);
    });
  } finally {
  }
};

run().catch((err) => console.log(err));

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
