import HTML from "./echo.html";

/**********************************
 * WORKER CODE 
**********************************/

// borrowed from Cloudflare chatroom example, good for debugging.
async function handleErrors(request, func) {
	try {
		return await func();
	} catch (err) {
		if (request.headers.get("Upgrade") == "websocket") {
			// Annoyingly, if we return an HTTP error in response to a WebSocket request, Chrome devtools
			// won't show us the response body! So... let's send a WebSocket response with an error
			// frame instead.
			let pair = new WebSocketPair();
			pair[1].accept();
			pair[1].send(JSON.stringify({error: err.stack}));
			pair[1].close(1011, "Uncaught exception during session setup");
			return new Response(null, { status: 101, webSocket: pair[0] });
		} else {
			return new Response(err.stack, {status: 500});
		}
	}
}

export default {
	async fetch(request, env) {
		return await handleErrors(request, async () => {
			let url = new URL(request.url);
			let pathParts = url.pathname.slice(1).split('/');
			if (!pathParts[0]) {
				return new Response(HTML, {headers: {"Content-Type": "text/html;charset=UTF-8"}});
			} else {
				if (pathParts[0] === "websocket") {	
					return handleWebsocketRequest(request, env);
				}
			}
			return new Response("Not found", {status: 404});
		});
	}
}

async function handleWebsocketRequest(request, env) {
	let id = env.echo.idFromName("default"); // this could be any name
	let roomObject = env.echo.get(id);
	return roomObject.fetch(request);
}



/**********************************
 * DURABLE OBJECT CODE 
**********************************/

export class Echo {
	
	constructor(controller, env) {
		this.env = env;
		this.sessions = [];
	}

	async fetch(request) {
		return await handleErrors(request, async () => {
			if (request.headers.get("Upgrade") != "websocket") {
				return new Response("expected websocket", {status: 400});
			}
			let [client, server] = Object.values(new WebSocketPair());
			await this.handleSession(server);
			return new Response(null, { status: 101, webSocket: client });			
		});
	}

	async handleSession(webSocket) {
		webSocket.accept();
		
		let session = {webSocket, }; // we could store other useful stuff in the session
		this.sessions.push(session);

		webSocket.addEventListener("message", async (msg) => {
			try {
				let data = JSON.parse(msg.data);
				this.broadcast(data);
			} catch (err) {
				webSocket.send(JSON.stringify({error: err.stack}));
			}
		});

		let closeOrErrorHandler = (evt) => {
			this.sessions = this.sessions.filter(s => s !== session);
		};
		webSocket.addEventListener("close", closeOrErrorHandler);
		webSocket.addEventListener("error", closeOrErrorHandler);
  	}

	broadcast(message) {
		message = JSON.stringify(message);
		// try to send message to all sessions and remove any dead sessions
		this.sessions = this.sessions.filter(session => {
			try {
				session.webSocket.send(message);
				return true;
			} catch (err) {
				return false;
			}
		});
	}
}
