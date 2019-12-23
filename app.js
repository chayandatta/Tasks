var express = require('express')
var path = require('path')
var logger = require('morgan')
var bodyParser = require('body-parser')
var redis = require('redis')

var app = express()

// create client
var client = redis.createClient()

client.on('connect', function() {
    console.log('Redis server connected');
});

// view engine setup
app.set('views', path.join(__dirname, 'views'))
app.set('view_engine', 'ejs')

// middleware
app.use(logger('dev'))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(express.static(path.join(__dirname, 'public')))

//route for home
app.get('/', (req, res) => {
    // res.send('welcome')
    var title = 'Task list'
    client.lrange('tasks', 0, -1, (err, reply) => {
    	client.hgetall('call', (err,call) => {
    		res.render('index.ejs', {
            title: title,
            tasks: reply,
            call: call
        	});
    	})
    })

})

// Route for storing the form
app.post('/task/add', (req, res) => {
    var task = req.body.task
    client.rpush('tasks', task, (err, reply) => {
        if (err) {
            console.log(err)
        } else {
            console.log('Task Added...')
            res.redirect('/')
        }
    })
})
// Route for deleting the list
app.post('/task/delete', (req, res) => {
    var tasksToDel = req.body.tasks
    client.lrange('tasks', 0, -1, (err, tasks) => {
        for (var i = 0; i < tasks.length; i++) {
            if (tasksToDel.indexOf(tasks[i]) > -1) {
                client.lrem('tasks',0,tasks[i],(err, reply) => {
                    if (err) {
                        console.log(err)
                    }
                });
            }
        }
        res.redirect('/')
    })
})




// 
app.post('/call/add', (req,res) => {
	var newCall = {}
	newCall.name = req.body.name
	newCall.phone = req.body.phone
	newCall.time = req.body.time

	client.hmset('call', ['name', newCall.name, 'phone', newCall.phone, 'time', newCall.time], (err,reply) => {
		if (err){
			console.log(err)
		} else {
			console.log(reply)
			res.redirect('/')
		}
	})
})

// start server
app.listen(3000)
console.log('server started on port 3000...')

module.exports = app