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

// @desc    Show all tasks
// @route   GET /tasks
router.get('/', ensureAuth, async (req, res) => {
    try {
       const tasks = await Task.find({ status: 'public' })
        .populate('user')
        .sort({ createdAt: 'desc' })
        .lean()

    res.render('tasks/index', {
        tasks,
    })
    } catch (err) {
        console.error(err)
        res.render('error/500')
    }
})

// @desc    Show edit page
// @route   GET /tasks/edit/:id
router.get('/edit/:id', ensureAuth, async (req, res) => {
    const task = await Task.findOne({
        _id: req.params.id
    }).lean()

    if (!task) {
        return res.render('error/404')
    }

    if (task.user != req.user.id) {
        res.redirect('/tasks')
    } else {
        res.render('tasks/edit', {
            task,
        })
    }
})

// @desc    Update task
// @route   PUT /tasks/:id
router.put('/:id', ensureAuth, async (req, res) => {
    try {
      let task = await Task.findById(req.params.id).lean()
  
      if (!task) {
        return res.render('error/404')
      }
  
      if (task.user != req.user.id) {
        res.redirect('/tasks')
      } else {
        task = await Task.findOneAndUpdate({ _id: req.params.id }, req.body, {
          new: true,
          runValidators: true,
        })
  
        res.redirect('/dashboard')
      }
    } catch (err) {
      console.error(err)
      return res.render('error/500')
    }
  })



module.exports = router