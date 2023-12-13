import { BadRequestError, HttpError, JsonError, NetworkError } from "./utils/error.js";

export default class PrismaHttp {
  #baseUrl

  constructor(baseUrl) {
    if (baseUrl && baseUrl.endsWith('/')) {
      baseUrl = baseUrl.slice(0, -1);
    }
    this.#baseUrl = baseUrl
  }

  #tryParseResponse(req) {
    try {
      let resp = '';
      if (req.response) {
        resp = JSON.parse(req.response);
      }
      return { error: null, response: resp.message || resp };
    } catch (err) {
      return { error: new JsonError(err, req.response), response: null };
    }
  }

  #setAuthorization(req) {
    let jwtoken = localStorage.getItem("authentication");
    jwtoken = JSON.parse(jwtoken);
    if (jwtoken && jwtoken.access_token)
      req.setRequestHeader("Authorization", "Bearer " + jwtoken.access_token);
  }

  request(method, url, body) {
    return new Promise((resolve, reject) => {
      const request = new XMLHttpRequest();
      request.onload = () => {
        const { error, response } = this.#tryParseResponse(request);
        if (error) {
          reject(error);
        } else if (request.status == 200) {
          resolve(response);
        } else if (request.status == 400) {
          reject(new BadRequestError(response));
        } else {
          reject(new HttpError(request.status, request.statusText));
        }
      }

      request.onerror = () => {
        reject(new NetworkError());
      }

      if (this.#baseUrl) {
        url = `${this.#baseUrl}/${url}`;
      }

      request.open(method, url);
      request.setRequestHeader("Cache-Control", "no-cache, no-store, max-age=0");
      request.setRequestHeader("Content-type", "application/json");
      this.#setAuthorization(request);
      if (body) {
        request.send(JSON.stringify(body));
      } else {
        request.send();
      }
    });
  }

  post(url, body) {
    return this.request("POST", url, body);
  }
  put(url, body) {
    return this.request("PUT", url, body);
  }
  get(url) {
    return this.request("GET", url, null);
  }
  delete(url) {
    return this.request("DELETE", url, null);
  }
}