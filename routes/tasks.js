const express = require('express')
const router = express.Router()
const { ensureAuth } = require('../middleware/auth')

const Task = require('../models/Task')

// @desc    Show add page 
// @route   GET /tasks/add
router.get('/add', ensureAuth, (req, res) => {
    res.render('tasks/add')
})

// @desc    Process add form 
// @route   POST /tasks
router.post('/', ensureAuth, async (req, res) => {
    try {
        req.body.user = req.user.id
        await Task.create(req.body)
        res.redirect('/dashboard')
    } catch (err) {
        console.error(err)
        res.render('erroe/500')
    }
})


module.exports = router