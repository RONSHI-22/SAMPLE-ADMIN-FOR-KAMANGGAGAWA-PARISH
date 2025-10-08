const express = require('express')
const mongoose = require('mongoose')
const path = require('path')
const port = 3020

const app = express();
app.use(express.static(__dirname))
app.use(express.urlencoded({ extended: true }))
app.use(express.json({ limit: '10mb' })) // 🔥 allow base64 images up to ~10MB

mongoose.connect('mongodb://127.0.0.1:27017/sample') // <--- wag mong kalimutan palitan to
const db = mongoose.connection
db.once('open', () => console.log("Connected to MongoDB"))

// Schema
const contentSchema = new mongoose.Schema({
  announcements: String,
  events: String,
  eventTextColor: String,
  eventImage: String, // 🔥 base64 string or URL
  verse: String,
  verseName: String,
  priests: [
    {
      name: String,
      description: String,
      image: String // 🔥 base64 string or URL
    }
  ]
})

const Content = mongoose.model("Content", contentSchema)

// ---------- General Content Routes ----------

// Save/update general content
app.post('/saveContent', async (req, res) => {
  try {
    let data = await Content.findOne()
    if (!data) {
      data = new Content(req.body)
    } else {
      // Merge only fields passed
      Object.assign(data, req.body)
    }
    await data.save()
    res.json({ success: true, message: "Content saved" })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

// Get general content
app.get('/getContent', async (req, res) => {
  try {
    const data = await Content.findOne()
    res.json(data || {})
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// ---------- Priest CRUD Routes ----------

// Add priest
app.post('/addPriest', async (req, res) => {
  try {
    let data = await Content.findOne()
    if (!data) data = new Content()
    if (!data.priests) data.priests = []
    data.priests.push(req.body) // req.body.image can be base64
    await data.save()
    res.json({ success: true, message: "Priest added" })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

// Get all priests
app.get('/getPriests', async (req, res) => {
  try {
    const data = await Content.findOne()
    res.json(data?.priests || [])
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Get single priest
app.get('/getPriest/:id', async (req, res) => {
  try {
    const data = await Content.findOne()
    const priest = data?.priests.id(req.params.id)
    res.json(priest || {})
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Update priest
app.put('/updatePriest/:id', async (req, res) => {
  try {
    const data = await Content.findOne()
    const priest = data?.priests.id(req.params.id)
    if (priest) {
      priest.name = req.body.name || priest.name
      priest.description = req.body.description || priest.description
      if (req.body.image) priest.image = req.body.image // 🔥 base64
      await data.save()
      res.json({ success: true, message: "Priest updated" })
    } else {
      res.status(404).json({ success: false, message: "Not found" })
    }
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Delete priest
app.delete('/deletePriest/:id', async (req, res) => {
  try {
    const data = await Content.findOne()
    if (data) {
      data.priests = data.priests.filter(p => p._id.toString() !== req.params.id)
      await data.save()
      res.json({ success: true, message: "Priest deleted" })
    } else {
      res.status(404).json({ success: false, message: "No data found" })
    }
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// ---------- Start Server ----------
app.listen(port, () => console.log("Server running at http://localhost:" + port))