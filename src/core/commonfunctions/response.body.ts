export default function response(
  status: any,
  message: string,
  data?: any,
  token?: string
) {
  return {
    status,
    message,
    data,
    token
  }
}