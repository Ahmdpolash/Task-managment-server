const express = require("express");
const app = express();
const cors = require("cors");
const port = process.env.PORT || 5000;
require("dotenv").config();

app.use(express.json());
app.use(cors());

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.yrssrk8.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    const usersCollection = client.db("Task_Management").collection("users");
    const tasksCollection = client.db("Task_Management").collection("tasks");

    //! users
    app.post("/users", async (req, res) => {
      const users = req.body;
      const email = { email: users.email };

      const existingEmail = await usersCollection.findOne(email);

      if (existingEmail) {
        return res.send({ message: "user already exist", insertedId: null });
      }
      const result = await usersCollection.insertOne(users);
      res.send(result);
    });

    app.get("/users", async (req, res) => {
      const result = await usersCollection.find().toArray();
      res.send(result);
    });

    //! task

    app.post("/tasks", async (req, res) => {
      const tasks = req.body;
      const result = await tasksCollection.insertOne(tasks);
      res.send(result);
    });

    app.get("/tasks", async (req, res) => {
      const result = await tasksCollection.find().toArray();
      res.send(result);
    });

    app.delete("/tasks/:id", async (req, res) => {
      const tasks = req.params.id;
      console.log(tasks);
      const query = { _id: new ObjectId(tasks) };
      const result = await tasksCollection.deleteOne(query);
      res.send(result);
    });

    //update
    app.put("/tasks/:id", async (req, res) => {
      const id = req.params.id;
      // console.log(id);

      const tasks = req.body;
      console.log(tasks);
      const query = { _id: new ObjectId(id) };


      const updateDoc = {
        $set: {
          title: tasks.title,
          priority: tasks.priority,
          deadline: tasks.deadline,
          description: tasks.description,
        },
      };
      const result = await tasksCollection.updateOne(query, updateDoc);
      res.send(result);
    });


    app.get('/tasks/singleTask/:id', async (req, res) => {
      const id = req.params.id ;
      const query = {_id :new ObjectId(id)}
      const result = await tasksCollection.findOne(query)
      res.send(result)
    })

    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Task management website running");
});

app.all("*", (req, res, next) => {
  const error = new Error(`the requested url is invalid : [${req.url}]`);
  error.status = 404;
  next(error);
});

app.use((error, req, res, next) => {
  res.status(error.status || 404).json({
    message: error.message,
  });
});

app.listen(port, () => {
  console.log(`task management website running on port ${port}`);
});
