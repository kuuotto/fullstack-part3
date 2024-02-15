const express = require("express")
const morgan = require("morgan")
const cors = require("cors")

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


let persons = [
    {
        "id": 1,
        "name": "Arto Hellas",
        "number": "040-123456"
    },
    {
        "id": 2,
        "name": "Ada Lovelace",
        "number": "39-44-5323523"
    },
    {
        "id": 3,
        "name": "Dan Abramov",
        "number": "12-43-234345"
    },
    {
        "id": 4,
        "name": "Mary Poppendieck",
        "number": "39-23-6423122"
    }
]

const generateId = (max) => {
    // generates a random integer
    const id = Math.ceil(Math.random() * Number.MAX_SAFE_INTEGER)
    return id
}

app.get("/api/persons", (request, response) => {
    response.json(persons)
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
    const id = Number(request.params.id)

    // filter contacts
    persons = persons.filter(person => person.id !== id)

    // send response code
    response.sendStatus(204)
})

app.post("/api/persons", (request, response) => {
    const body = request.body

    // create a new person
    const person = {
        name: body.name,
        number: body.number
    }

    // check that the required fields are included
    const requiredFields = ["name", "number"]
    const missingFields = requiredFields.filter(reqField => !person[reqField])
    if (missingFields.length > 0) {
        return response.status(400).json({
            error: `the following fields are missing: ${[missingFields]}`
        })
    }

    // check that the name doesn't already exist
    if (persons.some(p => p.name == person.name)) {
        return response.status(400).json({
            error: `a person with the name ${person.name} already exists`
        })
    }

    // add an id to the contact
    person.id = generateId()

    // add contact to list
    persons = persons.concat(person)

    // respond with the newly created person
    response.json(person)
})

app.get("/info", (request, response) => {
    const time = new Date().toString()
    const page = `<p>Phonebook has contact information of ${persons.length} people.</p><p>${time}</p>`
    response.send(page)
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`)
})
