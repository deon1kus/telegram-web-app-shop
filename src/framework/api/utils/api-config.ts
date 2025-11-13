import axios from "axios"

const { VITE_API_URL } = import.meta.env

const Api = axios.create({
  baseURL: VITE_API_URL ? `${VITE_API_URL}/api` : '/api',
  headers: {
    Accept: "*/*"
  }
})

Api.interceptors.request.use(
  (config) => config,
  (err) => Promise.reject(err)
)

Api.interceptors.response.use(
  (response) => response,
  (err) => Promise.reject(err)
)

export default Api
