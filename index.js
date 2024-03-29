require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const Person = require('./models/person')

const corsOptions = {
  origin: '*' // only allow requests from these origins
}

// create a new token for Morgan that shows the body of the request if available
morgan.token('body', (request) => {
  if (request.method !== 'POST') {
    return ' '
  }

  return request.body ? JSON.stringify(request.body) : ''
})

// create app
const app = express()

// enable processing of json
app.use(express.json())

// enable logging of requests
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))

// enable cross-origin resource sharing
app.use(cors(corsOptions))

// enable serving the frontend from the dist directory
app.use(express.static('dist'))

app.get('/api/persons', (request, response) => {
  Person.find({}).then(persons => {
    response.json(persons)
  })
})

app.get('/api/persons/:id', (request, response, next) => {
  const id = request.params.id

  Person.findById(id)
    .then(person => {
      if (person) {
        response.json(person)
      } else {
        response.status(404).end()
      }
    })
    .catch(error => next(error))
})

app.delete('/api/persons/:id', (request, response, next) => {
  Person.findByIdAndDelete(request.params.id)
    .then(() => { response.status(204).end() })
    .catch(error => next(error))
})

app.post('/api/persons', (request, response, next) => {
  const body = request.body

  // create a new person
  const person = Person({
    name: body.name,
    number: body.number.replaceAll(' ', '')
  })

  // add contact to database
  person.save()
    .then(savedPerson => {
      // respond with the newly created person
      response.json(savedPerson)
    })
    .catch(error => next(error))
})

app.put('/api/persons/:id', (request, response, next) => {
  const id = request.params.id
  const body = request.body

  const person = {
    name: body.name,
    number: body.number.replaceAll(' ', '')
  }

  Person.findByIdAndUpdate(id, person, { new: true, runValidators: true })
    .then(updatedPerson => { response.json(updatedPerson) })
    .catch(error => next(error))
})

app.get('/info', (request, response) => {
  const time = new Date().toString()

  // count the number of people in the database
  Person.find({}).then(persons => {
    const page = `<p>Phonebook has contact information of ${persons.length} people.</p><p>${time}</p>`
    response.send(page)
  })

})

const errorHandler = (error, request, response, next) => {
  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'Malformatted id' })
  } else if (error.name === 'ValidationError') {
    // if this is a validation error, send an array of error codes in response
    return response.status(400).send({
      errors: Object.values(error.errors).map(err => err.message)
    })
  }

  // pass any remaining errors to the default Express error handler
  next(error)
}

// enable errorHandler
app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`)
})
