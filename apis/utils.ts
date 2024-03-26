export async function fetchApi<T>(
  apiBaseUrl: string,
  path: string,
  options?: RequestInit,
): Promise<T> {
  const response = await fetch(`${apiBaseUrl}/${path}`, options)

  if (response.ok) {
    return response.json()
  } else {
    const errorResponse = await response.json()

    throw new Error(errorResponse.message || 'Unknown Error')
  }
}
