import Swal from 'sweetalert2'

interface ApiOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  body?: any
  query?: any
  headers?: any
  silent?: boolean // If true, avoids triggering SweetAlert popups
}

export const useApi = () => {
  const fetchWithHandling = async <T = any>(url: string, options: ApiOptions = {}): Promise<T> => {
    try {
      const response = await $fetch<T>(url, {
        method: options.method || 'GET',
        body: options.body,
        query: options.query,
        headers: options.headers,
      })
      return response
    } catch (error: any) {
      if (!options.silent) {
        let title = 'Error'
        let message = 'An unexpected error occurred. Please try again.'

        if (error.response) {
          // HTTP Errors returned by backend (e.g. Nitro plugin format or regular createError)
          const status = error.response.status
          const data = error.response._data

          message = data?.message || error.message
          
          if (status === 401) {
            title = 'Unauthorized'
            // Possibly redirect to login if not already there
          } else if (status === 403) {
            title = 'Forbidden'
          } else if (status === 404) {
            title = 'Not Found'
          } else if (status === 429) {
            title = 'Too Many Requests'
          } else if (status >= 500) {
            title = 'Server Error'
            if (message.includes('ECONNREFUSED')) {
               message = 'Unable to connect to the database or service. Please ensure the backend services are running.'
            }
          }
        } else if (error.name === 'FetchError') {
          // Network level errors (offline)
          title = 'Network Error'
          message = 'Cannot connect to the server. Please check your internet connection or try again later.'
        }

        Swal.fire({
          icon: 'error',
          title,
          text: message,
          confirmButtonColor: '#0071E3'
        })
      }
      
      // Re-throw so caller can still handle logic if needed (e.g. stop loading state)
      throw error
    }
  }

  return {
    fetch: fetchWithHandling
  }
}
