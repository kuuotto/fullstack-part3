const mongoose = require("mongoose")

mongoose.set("strictQuery", false)

// access the database url from environment variables
const url = process.env.MONGODB_URL

console.log(`Connecting to MongoDB database at ${url}`)

mongoose.connect(url)
    .then(result => {console.log("Connected to MongoDB")})
    .catch(error => {console.log(`Failed to connect to MongoDB: ${error.message}`)})

// create a schema corresponding to a person
const personSchema = mongoose.Schema({
    name: String,
    number: String,
})

// alter the way persons from the database are parsed into JSON
personSchema.set("toJSON", {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id
        delete returnedObject._id
        delete returnedObject.__v
    }
})

// create a model out of the person schema
const Person = mongoose.model("Person", personSchema)

// export the model from this module
module.exports = Person
