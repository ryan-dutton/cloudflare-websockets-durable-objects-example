# Cloudflare Worker Using Durable Objects and Websockets

This example is a dramatic simplification of the original 'Chat Room' example provided by
Cloudflare. There is no concept of rooms, it does not use storage or implement rate limitting.

To try it simply clone and run:
`wrangler publish` or `wrangler dev`

Once deplyed, open multiple browser windows / tabs on the resulting URL and submit messages.
The messages should appear in all connected windows almost simultaneously.
