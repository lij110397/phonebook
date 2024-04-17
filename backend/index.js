const express = require('express')
const morgan = require('morgan')
const app = express()
app.use(express.json())
//app.use(morgan('tiny'))

// 自定义 Morgan 日志输出格式，包含请求体数据
morgan.token('req-body', (req) => JSON.stringify(req.body));
// 配置 Morgan，使用自定义格式化器
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :req-body'));

//设置CORS
const cors = require('cors')
app.use(cors())

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

app.get('/api/persons',(request,response)=>{
    response.json(persons)
})

app.get('/api/persons/:id',(request,response) => {
    const id = Number(request.params.id)
    const person = persons.find(person => person.id === id)
    if(person){
        response.json(person)
    }else {
        response.status(404).end()
    }
})

app.delete('/api/persons/:id',(request,response)=>{
    const id = Number(request.params.id)
    persons = persons.filter(person => person.id === id)

    response.status(204).end()
})

app.post('/api/persons',(request,response)=>{
    const body = request.body
    //console.log('body name ', body.name)
    //console.log('body number ', body.number)
    let existName = persons.find(person => person.name === body.name) ? true:false
    let existNumber= persons.find(person => person.number === body.number) ? true:false

    if(!body.name || !body.number){
        return response.status(404).json({
            error:'name or number missing'
        })
    }else if(existName){
        return response.status(404).json({
            error:'name must be unique'
        })
    }else if (existNumber) {
        return response.status(404).json({
            error:'number must be unique'
        })
    }

    const person = {
        id:generateId(),
        name:body.name,
        number:body.number
    }

    persons = persons.concat(person)
    response.json(person)
})

// generate an id which does not exist
const generateId =()=>{
    let random
    let exist = true
    while(exist) {
        random = Math.floor(Math.random()*100)+1
        exist = persons.find(person => person.id === random) ? true:false
        //console.log(exist)
    }

    return random
}

app.get('/info',(request,response)=>{
    
    const number = persons.length
    const timeNow = new Date()
    response.send(`<p>Phonebook has info for ${number} people</p><p>${timeNow}</p>`)
})


const PORT = 3001
app.listen(PORT)
console.log(`Server running on port ${PORT}`)