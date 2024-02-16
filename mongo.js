const mongoose = require("mongoose")

if (process.argv.length !== 3 && process.argv.length !== 5) {
    console.log("The script has two modes of operation:")
    console.log("1. Supplying a database password, a person's name and their phone number adds the person to the database.")
    console.log("2. Supplying a database password shows all saved people in the database.")
    process.exit(1)
}

const password = process.argv[2]

// connect to databse
const url = `mongodb+srv://ottokuusela:${password}@cluster0.effboax.mongodb.net/phonebookApp?retryWrites=true&w=majority`
mongoose.set("strictQuery", false)
mongoose.connect(url).catch(reason => {
    console.log(reason)
    process.exit(1)
})

const personSchema = new mongoose.Schema({
    name: String,
    number: String,
})
const Person = mongoose.model("Person", personSchema)

// if only a password is supplied, we list all the people in the database
if (process.argv.length === 3) {
    // find all notes
    Person.find({}).then(result => {
        result.forEach(person => {
            console.log(`${person.name} ${person.number}`)
        })
        mongoose.connection.close()
    })
}

// if a password, name and number are supplied, create a new contact
if (process.argv.length === 5) {
    const name = process.argv[3]
    const number = process.argv[4]

    const person = new Person({
        name: name,
        number: number,
    })

    person.save().then(result => {
        console.log(`added ${name} number ${number} to phonebook`)
        mongoose.connection.close()
    })
}
