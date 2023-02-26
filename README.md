# Cloudflare Worker Using Durable Objects and Websockets

This example is a dramatic simplification of the original 'Chat Room' example provided by
Cloudflare. It has no concept of rooms, does not use storage or implement rate limitting.
There is just a box to enter text, and the text is echoed to all connected windows.

Data is transported using websockets and routed through a single durable object. A key benefit of durable
objects is that data can be pushed to clients. A worker's only solution would require some kind
of polling by the client. The purpose of this example is to demonstrate that ability with minimal code.

To try it clone and run:
`wrangler publish` or `wrangler dev`
Note: You will need to have durable objects enabled in your Cloudflare account.

Once deployed, open multiple browser windows / tabs on the resulting URL and submit messages.
The messages should appear in all connected windows almost simultaneously.
