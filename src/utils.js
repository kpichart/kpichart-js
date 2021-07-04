import  { API_URL } from './constants'

export function isBrowser() {
  return typeof window !== "undefined"
}

export function sendData(url, stringifyData) {
  // do not use fetch, for IE compatibility
  const request = new XMLHttpRequest();
  url = url || API_URL;
  request.open("post", url, true);
  request.setRequestHeader("Content-Type", "application/json");
  request.send(stringifyData);
}
