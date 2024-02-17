require("dotenv").config()
const express = require("express")
const morgan = require("morgan")
const cors = require("cors")
const Person = require("./models/person")

const corsOptions = {
    origin: "*" // only allow requests from these origins
}

// create a new token for Morgan that shows the body of the request if available
morgan.token("body", (request, response) => {
    if (request.method !== "POST") {
        return " "
    }

    return request.body ? JSON.stringify(request.body) : ""
})

// create app
const app = express()

// enable processing of json
app.use(express.json())

// enable logging of requests
app.use(morgan(":method :url :status :res[content-length] - :response-time ms :body"))

// enable cross-origin resource sharing
app.use(cors(corsOptions))

// enable serving the frontend from the dist directory
app.use(express.static("dist"))


// const generateId = (max) => {
//     // generates a random integer
//     const id = Math.ceil(Math.random() * Number.MAX_SAFE_INTEGER)
//     return id
// }

app.get("/api/persons", (request, response) => {
    Person.find({}).then(persons => {
        response.json(persons)
    })
})

app.get("/api/persons/:id", (request, response) => {
    const id = Number(request.params.id)

    // find the person corresponding to the id
    const person = persons.find(person => person.id === id)

    if (person) {
        // send the correct person
        response.json(person)
    } else {
        // send an error code
        response.sendStatus(404)
    }
})

app.delete("/api/persons/:id", (request, response) => {
    Person.findByIdAndDelete(request.params.id)
        .then(result => { response.status(204).send() })
        .catch(error => {
            if (error.name === "CastError") {
                // this error arises if the supplied id cannot be converted to
                // an actual object id
                response.status(400).send({error: `Malformatted id: ${request.params.id}`})
                return
            }

            console.log(`Could not delete contact. ${error.name}: ${error.message}$`)
            response.status(500).send()
        })
})

app.post("/api/persons", (request, response) => {
    const body = request.body

    // create a new person
    const person = Person({
        name: body.name,
        number: body.number
    })

    // check that the required fields are included
    const requiredFields = ["name", "number"]
    const missingFields = requiredFields.filter(reqField => !person[reqField])
    if (missingFields.length > 0) {
        return response.status(400).json({
            error: `the following fields are missing: ${[missingFields]}`
        })
    }

    // check that the name doesn't already exist
    // if (persons.some(p => p.name == person.name)) {
    //     return response.status(400).json({
    //         error: `a person with the name ${person.name} already exists`
    //     })
    // }

    // add contact to database
    person.save().then(savedPerson => {
        // respond with the newly created person
        response.json(savedPerson)
    })
})

app.get("/info", (request, response) => {
    const time = new Date().toString()
    const page = `<p>Phonebook has contact information of ${persons.length} people.</p><p>${time}</p>`
    response.send(page)
})

const PORT = process.env.PORT
app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`)
})
