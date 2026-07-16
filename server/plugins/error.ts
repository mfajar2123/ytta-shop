export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook('error', async (error: any, { event }) => {
    console.error('[Global Error Hook]', error)
    
    // Default error response
    let statusCode = error.statusCode || 500
    let message = error.message || 'An internal server error occurred'
    let data = error.data || null

    // Check for PostgreSQL / Drizzle connection errors
    if (error.code && (error.code === 'ECONNREFUSED' || error.message.includes('connect ECONNREFUSED'))) {
      statusCode = 503
      message = 'Database connection failed. Please try again later.'
    }

    if (error.message.includes('relation') && error.message.includes('does not exist')) {
       statusCode = 500
       message = 'Database schema error. Missing tables.'
    }

    if (!event) return

    // Standardize error response structure
    const response = {
      success: false,
      statusCode,
      message,
      data
    }

    // Set the status code and send standard response
    setResponseStatus(event, statusCode)
    
    // Fallback if event is already closed (rare, but possible in streams)
    if (!event.handled) {
      await send(event, JSON.stringify(response), 'application/json')
    }
  })
})
