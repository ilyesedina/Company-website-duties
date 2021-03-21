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
        res.render('error/500')
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


// @desc    Show single task
// @route   GET /tasks/:id
router.get('/:id', ensureAuth, async (req, res) => {
  try {
    let task = await Task.findById(req.params.id).populate('user').lean()

    if (!task) {
      return res.render('error/404')
    }

    if (task.user._id != req.user.id && task.status == 'private') {
      res.render('error/404')
    } else {
      res.render('tasks/show', {
        task,
      })
    }
  } catch (err) {
    console.error(err)
    res.render('error/404')
  }
})

// @desc    Show edit page
// @route   GET /tasks/edit/:id
router.get('/edit/:id', ensureAuth, async (req, res) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
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
  } catch (err) {
    console.error(err)
    return res.render('error/500')
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

// @desc    Delete task
// @route   DELETE /tasks/:id
router.delete('/:id', ensureAuth, async (req, res) => {
  try {
    let task = await Task.findById(req.params.id).lean()

    if (!task) {
      return res.render('error/404')
    }

    if (task.user != req.user.id) {
      res.redirect('/tasks')
    } else {
      await Task.remove({ _id: req.params.id })
      res.redirect('/dashboard')
    }
  } catch (err) {
    console.error(err)
    return res.render('error/500')
  }
})

// @desc    User tasks
// @route   GET /tasks/user/:userId
router.get('/user/:userId', ensureAuth, async (req, res) => {
  try {
    const tasks = await Task.find({
      user: req.params.userId,
      status: 'public',
    })
      .populate('user')
      .lean()

    res.render('tasks/index', {
      tasks,
    })
  } catch (err) {
    console.error(err)
    res.render('error/500')
  }
})


module.exports = router