//设置数据库
const mongoose = require('mongoose')
require('dotenv').config()
// const password = process.argv[2]
// const password = '15301124li'
// // DO NOT SAVE YOUR PASSWORD TO GITHUB!!
// const url = `mongodb+srv://lij110397:${password}@cluster0.0fvsbh4.mongodb.net/phonebook?retryWrites=true&w=majority&appName=Cluster0`
const url = process.env.MONGODB_URI
mongoose.set('strictQuery', false)
mongoose
  .connect(url)
  .then((result) => {
    console.log('connected to MongoDB')
  })
  .catch((error) => {
    console.log('error connecting to MongoDB:', error.message)
  })

const personSchema = new mongoose.Schema({
  name: {
    type: String,
    minLength:3,
    required: true
  },
  number: {
    type:String,
    minLength:8,
    validate: {
        validator: function(v) {
          return /^\d{2,3}-\d+$/.test(v);
        },
        message: props => `${props.value} is not a valid phone number!`
      }
  }
})

personSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  },
})

module.exports = mongoose.model('Person', personSchema)
