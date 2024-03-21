import { BadRequestError, HttpError, JsonError, NetworkError, UnauthorizedError } from "./utils/error.js";

export default class PrismaHttp {
  #baseUrl
  #authKey
  #refreshEndpoint
  #tokenType
  #authPage

  constructor(baseUrl, {authKey, refreshEndpoint, tokenType,  authPage} = {}) {
    if (baseUrl && baseUrl.endsWith('/')) {
      baseUrl = baseUrl.slice(0, -1);
    }
    this.#baseUrl = baseUrl
    this.#authKey = authKey || "authentication";
    this.#refreshEndpoint = refreshEndpoint || "api/account/refresh";
    this.#tokenType = tokenType || "Bearer";
    this.#authPage = authPage;
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
    let jwtoken = localStorage.getItem(this.#authKey);
    jwtoken = JSON.parse(jwtoken);
    if (jwtoken && jwtoken.access_token) {
      req.setRequestHeader("Authorization", `${this.#tokenType} ${jwtoken.access_token}`);
    }
  }

  async #refreshAuthorization() {
    const { refresh_token } = JSON.parse(localStorage.getItem(this.#authKey));
    const auth = await this.post(this.#refreshEndpoint, { refresh_token });
    localStorage.setItem(this.#authKey, JSON.stringify(auth));
  }

  #request(method, url, body, retrying = false) {
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
        } else if (request.status == 401) {
          if (retrying || url.includes(this.#refreshEndpoint)) {
            reject(new UnauthorizedError(this.#authPage));
          } else {
            this.#refreshAuthorization()
            .then(() => this.#request(method, url, body, true))
            .then((res) => resolve(res))
            .catch((err) => reject(err));
          }
        } else {
          reject(new HttpError(request.status, request.statusText));
        }
      }

      request.onerror = () => {
        reject(new NetworkError());
      }

      if (this.#baseUrl && !url.includes(this.#baseUrl)) {
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

  request(method, url, body) {
    return this.#request(method, url, body);
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