const express = require('express')
const app = express()
const server = require('http').Server(app)
const io = require('socket.io')(server)

app.set('view engine', 'ejs')
app.use(express.static('public'))

app.get('/', (req, res) => {
	res.render('room', { roomId: '1' })
})

io.on('connection', socket => {
	console.log('New user connected')

	socket.on('join-room', (roomId, userId) => {
		console.log({ roomId, userId })

		socket.join(roomId)
		socket.to(roomId).broadcast.emit('user-connected', userId)

		socket.on('disconnect', () => {
			socket.to(roomId).broadcast.emit('user-disconnected', userId)
		})
	})
})

server.listen(3000)