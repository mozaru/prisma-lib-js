export default class PrismaHttp {
  #baseUrl

  constructor(baseUrl) {
    if (baseUrl.endsWith('/')) {
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
      return { error: false, resp: resp.message || resp };
    } catch (err) {
      return { error: true, resp: err.message };
    }
  }

  #trySetAuthorization(req) {
    try {
      let jwtoken = localStorage.getItem("authentication");
      jwtoken = JSON.parse(jwtoken);
      if (jwtoken && jwtoken.access_token)
        req.setRequestHeader("Authorization", "Bearer " + jwtoken.access_token);
    } catch { }
  }

  request(method, url, body) {
    return new Promise((resolve, reject) => {
      const req = new XMLHttpRequest();
      req.onload = () => {
        const { error, resp } = this.#tryParseResponse(req);
        if (error) {
          reject(new Error(resp));
        } else if (req.status == 200) {
          resolve(resp);
        } else if (req.status == 400) {
          reject(new Error(resp || `${req.status}: Bad Request`));
        } else {
          reject(new Error(`${req.status}: ${req.statusText}`));
        }
      }

      req.onerror = () => {
          reject(new Error('Network error occurred'));
      }

      if (this.#baseUrl) {
        url = `${this.#baseUrl}/${url}`;
      }

      req.open(method, url);
      req.setRequestHeader("Cache-Control", "no-cache, no-store, max-age=0");
      req.setRequestHeader("Content-type", "application/json");
      this.#trySetAuthorization(req);
      if (body) {
        req.send(JSON.stringify(body));
      } else {
        req.send();
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