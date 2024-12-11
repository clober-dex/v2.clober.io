import axios from 'axios'

export async function fetchApi<T>(
  apiBaseUrl: string,
  path: string,
  options?: any,
): Promise<T> {
  const response = await axios(`${apiBaseUrl}/${path}`, options)

  if (response.status === 200) {
    return response.data
  } else {
    throw new Error(response.data)
  }
}
