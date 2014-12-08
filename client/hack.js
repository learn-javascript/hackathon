
var chatBtn = document.getElementById('chat-btn');
chatBtn.addEventListener('click', function(e) {
	e.preventDefault();
	chatBtn.classList.toggle('active');
	var chat = document.getElementById('chat');
	chat.classList.toggle('open');
});

var statsBtn = document.getElementById('stats-btn');
statsBtn.addEventListener('click', function(e) {
	e.preventDefault();
	statsBtn.classList.toggle('active');
	var stats = document.getElementById('stats');
	stats.classList.toggle('open');
});

// var nickBtn = document.getElementById('nick-btn');
// nickBtn.addEventListener('click', function(e) {
// 	e.preventDefault();
// 	nickBtn.classList.toggle('change');
// });

/*
 * chat stuff
 */
;(function () {
	
	var nick = 'user#' + ~~(Math.random()*10000000)
	var $messages = document.querySelector('.messages')
	var $chatInput = document.querySelector('.chat-input')
	var $chatInputBtn = document.querySelector('.send-msg')
	var $nickBtn = document.getElementById('nick-btn');

	$chatInput.addEventListener('keypress', sendChat)
	$chatInputBtn.addEventListener('click', sendChat)

	$nickBtn.addEventListener('click', function(e) {
		e.preventDefault();
		window.smoke.prompt('enter new name', function(input){
		  		if (input) nick = input
		  	}, {
				ok: "submit",
		  		cancel: "cancel"
			})
	});

	function sendChat (e) {
		if(e && e.keyCode && e.keyCode !== 13) return
		if($chatInput.value.trim() === '') return

		socket.emit('chat', {
			msg: $chatInput.value,
			nick: nick
		})

		$chatInput.value = ''
	}
	socket.on('chat', function (data) {
		$messages.innerHTML += '<div class="message"><span class="nick">'+(data.nick||'SERVER')+'</span>'+data.msg+'</div>'
		$messages.scrollTop = $messages.scrollHeight
	})

})();
