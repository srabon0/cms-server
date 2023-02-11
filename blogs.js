const mongoose = require("mongoose");

const blogSchema = new mongoose.Schema({
    index: {
        type: Number
    },
    isActive: {
        type: Boolean
    },
    rating: {
        type: Number
    },
    picture: {
        type: String
    },
    title: {
        type: String
    },
    desc: {
        type: String
    },
    author: {
        type: String
    },
    createdAt: {
        type: Date
    },
    totalHits: {
        type: Number
    },
    email: {
        type: String
    },
    tags: {
        type: Array
    }
});

module.exports = mongoose.model("Blog", blogSchema);


  