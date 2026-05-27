import handler from '../dist/server/server.js';

export default {
  async fetch(request) {
    try {
      return await handler.fetch(request);
    } catch (err) {
      return new Response(`SSR rendering error: ${err.message}`, { status: 500 });
    }
  }
};
