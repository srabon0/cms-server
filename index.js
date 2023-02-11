require("dotenv").config();
const express = require("express");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

const port = process.env.PORT || 5000;
const mongoose = require("mongoose");
const passport = require("passport");
const passportLocal = require("passport-local").Strategy;
const cookieParser = require("cookie-parser");
const bcrypt = require("bcryptjs");
const session = require("express-session");
const cors = require("cors");
const app = express();
const User = require("./user");
const Blog = require("./blogs")
app.use(express.json({limit: '50mb'}));
app.use(
  cors()
);
app.use(express.json());
app.use(
  session({
    secret: "secretcode",
    resave: true,
    saveUninitialized: true,
  })
);
app.use(cookieParser("secretcode"));
app.use(passport.initialize());
app.use(passport.session());
require("./passportConfig")(passport);

const uri = process.env.DB_URI
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

mongoose.connect(
  uri,{
    dbName:"klog"
  },
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  },
  () => {
    console.log("Mongoose Is Connected");
  }
);


const run = async () => {
  try {
    const db = client.db("klog");
    const blogsClollection = db.collection("blogs");

    app.get("/blogs", async (req, res) => {
      const cursor = blogsClollection.find({});
      const blog = await cursor.toArray();
      // const tags = await blog.map(item=>item?.tags).flat()
      const uniq = await  [...new Set(blog.map(item=>item?.tags).flat())];
      res.send({ status: true, data: blog,tags:uniq });
    });

    app.get("/blog/:id", async (req, res) => {
      const id = req.params.id;
      await Blog.updateOne({_id:ObjectId(id)},{$inc:{totalHits:1}})
      const result  = await Blog.findById(id);
      //const result = await blogsClollection.findOne({ _id: ObjectId(id) })
      
      res.send(result);
    });

    app.post("/blog", async (req, res) => {
      const blogInstance = req.body;
      const newblog = new Blog(blogInstance)
      await newblog.save()
      .then(savedDoc => {
        res.send({acknowledged:true,insertedId:savedDoc.id})
    });

      // const result = await blogsClollection.insertOne(blog);
    });

    app.delete("/blog/:id", async (req, res) => {
      const id = req.params.id;

      const result = await Blog.deleteOne({ _id:id });
      res.send(result);
    });
    

    //Authentication

    app.post("/login", (req, res, next) => {
      passport.authenticate("local", (err, user, info) => {
        if (err) throw err;
        if (!user) res.send("No User Exists");
        else {
          req.logIn(user, (err) => {
            if (err) throw err;
            res.status(200).json({success:true,data:{email:user.username, role:user.role}});
            console.log(req.user);
          });
        }
      })(req, res, next);
    });
    
    app.post("/register", async(req, res) => {
      console.log("user data ", req.body)
      User.findOne({ username: req.body.username }, async (err, doc) => {
        if (err) throw err;
        if (doc) res.send("User Already Exists");
        if (!doc) {
          const hashedPassword = await bcrypt.hash(req.body.password, 10);
    
          const newUser = new User({
            username: req.body.username,
            password: hashedPassword,
            role:"user"
          });
          console.log("user data after creation", newUser);
          await newUser.save();
          res.send("User Created");
        }
      });
    });

    // app.get("/hitu",async(req,res)=>{
    //   const allBlog = await blogsClollection.find({}).toArray()
    //   allBlog.map(async (item,index)=>{
    //     //addiing a day 
    //     const today  = new Date(new Date().setDate(new Date().getDate() + index))
    //     await blogsClollection.updateOne({_id:ObjectId(item._id)},{$set:{createdAt:today}})
    //   })
    //   // const resp = await blogsClollection.updateMany({},{$set:{createdAt:"10/01/2023, 9:38:53 am"}})
    //   res.send("doing");
    // })
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
