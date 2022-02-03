const socket = io('/')

const videoGrid = document.getElementById('video-grid')

const myPeer = new Peer()

const myVideo = document.createElement('video')
myVideo.muted = true

const peers = {}

navigator.mediaDevices.getUserMedia({
	video: true,
	audio: true
}).then(stream => {
	addVideoStream(myVideo, stream)

	myPeer.on('call', call => {
		call.answer(stream)

		const video = document.createElement('video')

		call.on('stream', userVideoStream => {
			addVideoStream(video, userVideoStream)
		})
	})

	socket.on('user-connected', userId => {
		connectToNewUser(userId, stream)
	})
})

socket.on('user-disconnected', userId => {
	if (peers[userId]) peers[userId].close()
})

myPeer.on('open', id => {
	socket.emit('join-room', ROOM_ID, id)
})

function connectToNewUser(userId, stream) {
	const call = myPeer.call(userId, stream)
	const video = document.createElement('video')

	call.on('stream', userVideoStream => {
		addVideoStream(video, userVideoStream)
	})

	call.on('close', () => {
		video.remove()
	})

	peers[userId] = call
}

function addVideoStream(video, stream) {
	video.srcObject = stream
	video.addEventListener('loadedmetadata', () => {
		video.play()
	})
	videoGrid.append(video)
}

function toggleFullscreen(elem) {
	if (!document.fullscreenElement) {
		document.documentElement.requestFullscreen()
	} else {
		if (document.exitFullscreen) {
			document.exitFullscreen()
		}
	}
}

function toggleExpandClass() {
	if (document.querySelector('#fullscreen-btn > i').classList.contains('fa-expand')) {
		document.querySelector('#fullscreen-btn > i').classList.remove('fa-expand')
		return document.querySelector('#fullscreen-btn > i').classList.add('fa-compress')
	}

	document.querySelector('#fullscreen-btn > i').classList.remove('fa-compress')
	document.querySelector('#fullscreen-btn > i').classList.add('fa-expand')
}

document.querySelector('#fullscreen-btn').addEventListener('click', (e) => {
	toggleFullscreen(document.documentElement)
	toggleExpandClass()
})

function toggleMicrophone() {
	if (!myVideo.srcObject.getAudioTracks()[0].enabled) {
		myVideo.srcObject.getAudioTracks()[0].enabled = true
		document.querySelector('#microphone-btn > i').classList.remove('fa-microphone-slash')
		return document.querySelector('#microphone-btn > i').classList.add('fa-microphone')
	}

	myVideo.srcObject.getAudioTracks()[0].enabled = false
	document.querySelector('#microphone-btn > i').classList.remove('fa-microphone')
	document.querySelector('#microphone-btn > i').classList.add('fa-microphone-slash')
}

document.querySelector('#microphone-btn').addEventListener('click', (e) => {
	toggleMicrophone()
})

function toggleCamera() {
	if (myVideo.srcObject.getVideoTracks()[0].enabled) {
		myVideo.srcObject.getVideoTracks()[0].enabled = false
		document.querySelector('#video-btn > i').classList.remove('fa-video')
		return document.querySelector('#video-btn > i').classList.add('fa-video-slash')
	}

	myVideo.srcObject.getVideoTracks()[0].enabled = true
	document.querySelector('#video-btn > i').classList.remove('fa-video-slash')
	document.querySelector('#video-btn > i').classList.add('fa-video')
}

document.querySelector('#video-btn').addEventListener('click', (e) => {
	toggleCamera()
})

document.querySelector('#autoRowsSize').addEventListener('input', (e) => {
	console.log(e.target.value)
	document.querySelector('#video-grid').style.gridTemplateColumns = `repeat(auto-fill, ${e.target.value / 4 * 5}rem)`;
	document.querySelector('#video-grid').style.gridAutoRows = `${e.target.value}rem`;
})