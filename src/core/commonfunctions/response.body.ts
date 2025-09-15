export default function response(
  status: any,
  message: string,
  data?: any,
  token?: string,
) {
  let res: any = {
    status,
    message,
  }

  if (token) {
    res.token = token;
  }

  if (data) {
    res.data = data;
  }

  return res;
}