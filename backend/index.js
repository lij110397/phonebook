const express = require('express')
const morgan = require('morgan')
const Person = require('./models/person')
require('dotenv').config()
const app = express()
app.use(express.json())
//app.use(morgan('tiny'))

// 自定义 Morgan 日志输出格式，包含请求体数据
morgan.token('req-body', (req) => JSON.stringify(req.body))
// 配置 Morgan，使用自定义格式化器
app.use(
  morgan(
    ':method :url :status :res[content-length] - :response-time ms :req-body'
  )
)

//设置CORS
const cors = require('cors')
app.use(cors())

// let persons = [
//     {
//       "id": 1,
//       "name": "Arto Hellas",
//       "number": "040-123456"
//     },
//     {
//       "id": 2,
//       "name": "Ada Lovelace",
//       "number": "39-44-5323523"
//     },
//     {
//       "id": 3,
//       "name": "Dan Abramov",
//       "number": "12-43-234345"
//     },
//     {
//       "id": 4,
//       "name": "Mary Poppendieck",
//       "number": "39-23-6423122"
//     }
// ]

app.get('/api/persons', (request, response, next) => {
  Person.find({})
    .then((people) => {
      response.json(people)
    })
    .catch((error) => next(error))
  //response.json(persons)
})

app.get('/api/persons/:id', (request, response, next) => {
  //const id = Number(request.params.id)
  Person.findById(request.params.id)
    .then((person) => {
      if (person) {
        response.json(person)
      } else {
        response.status(404).end()
      }
    })
    .catch((error) => next(error))
  // const person = persons.find(person => person.id === id)
  // if(person){
  //     response.json(person)
  // }else {
  //     response.status(404).end()
  // }
})

app.delete('/api/persons/:id', (request, response, next) => {
  //   const id = Number(request.params.id)
  //   console.log('delete id', id)
  //persons = persons.filter(person => person.id === id)
  Person.findByIdAndDelete(request.params.id)
    .then((result) => {
      response.status(204).end()
    })
    .catch((error) => next(error))

  response.status(204).end()
})

app.put('/api/persons/:id', (request, response, next) => {
  const body = request.body

  const person = {
    name: body.name,
    number: body.number,
  }

  Person.findByIdAndUpdate(request.params.id, person, { new: true, runValidators: true, context: 'query' })
    .then((updatePerson) => {
      response.json(updatePerson)
    })
    .catch((error) => next(error))
})

app.post('/api/persons', (request, response, next) => {
  const body = request.body
  //console.log('body name ', body.name)
  //console.log('body number ', body.number)
  // let existName = persons.find(person => person.name === body.name) ? true:false
  // let existNumber= persons.find(person => person.number === body.number) ? true:false

  // if(!body.name || !body.number){
  //     return response.status(404).json({
  //         error:'name or number missing'
  //     })
  // }else if(existName){
  //     return response.status(404).json({
  //         error:'name must be unique'
  //     })
  // }else if (existNumber) {
  //     return response.status(404).json({
  //         error:'number must be unique'
  //     })
  // }

  if (!body.name || !body.number) {
    return response.status(400).json({
      error: 'name or number missing',
    })
  }

  const person = new Person({
    name: body.name,
    number: body.number,
  })

  //persons = persons.concat(person)
  person
    .save()
    .then((savePerson) => {
      response.json(savePerson)
    })
    .catch((error) => next(error))
  //response.json(person)
})

// generate an id which does not exist
const generateId = () => {
  let random
  let exist = true
  while (exist) {
    random = Math.floor(Math.random() * 100) + 1
    exist = persons.find((person) => person.id === random) ? true : false
    //console.log(exist)
  }

  return random
}

app.get('/info', (request, response, next) => {
  let number = 0
  Person.find({})
    .then((people) => {
      if (people) {
        number = people.length
        const timeNow = new Date()
        response.send(
          `<p>Phonebook has info for ${number} people</p><p>${timeNow}</p>`
        )
      } else {
        throw new Error('No data found')
      }
    })
    .catch((error) => next(error))
})

//错误处理中间件
const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

// handler of requests with unknown endpoint
app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
    console.error(error.message)
  
    if (error.name === 'CastError') {
      return response.status(400).send({ error: 'malformatted id' })
  
    } else if (error.name === 'ValidationError') {
      return response.status(400).json({ error: error.message })
    }
  
    next(error)
  }
// this has to be the last loaded middleware, also all the routes should be registered before this!
app.use(errorHandler)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
