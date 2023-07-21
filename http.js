import { showMessage } from './utils.js'

export default class PrismaHttp {
  #baseUrl

  constructor(baseUrl) {
    this.#baseUrl = baseUrl
  }

  request(method, url, body, success, error) {
    const xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
      try {
        if (this.readyState == 4) {
          let resp = JSON.parse(this.response || "null");
          if (!resp) resp = this.response;
          if (this.status == 200) {
            success(resp);
          } else if (this.status == 400) {
            error(resp.message || resp || "Bad Request", this.status);
          } else if (this.status == 401) {
            error("Unauthorized", this.status);
          } else if (this.status == 403) {
            error("Forbidden", this.status);
          } else if (this.status == 404) {
            error("Not Found", this.status);
          } else if (this.status == 500) {
            error("Internal server error", this.status);
          } else {
            error("Undefined error", this.status);
          }
        }
      } catch (err) {
        error(err.message, 0);
      }
    }
    xhttp.open(method, this.#baseUrl + url, true);
    let jwtoken = localStorage.getItem("autentication");
    if (jwtoken) {
      try {
        jwtoken = JSON.parse(jwtoken);
        if (jwtoken && jwtoken.access_token)
          xhttp.setRequestHeader("Authorization", "Bearer " + jwtoken.access_token);
      } catch (err) {}
    }
    xhttp.setRequestHeader("Cache-Control", "no-cache, no-store, max-age=0");
    /*** fallbacks for IE and older browsers: ***/
    //xhttp.setRequestHeader("Expires", "Tue, 01 Jan 1980 1:00:00 GMT");
    //xhttp.setRequestHeader("Pragma", "no-cache");
    xhttp.setRequestHeader("Content-type", "application/json");
    try {
      if (!body) xhttp.send();
      else xhttp.send(JSON.stringify(body));
    } catch (err) {
      error(err.message, 0);
    }
  }

  #onError(data, status) {
    console.error(`${status} ${data}`);
    if (data.message) showMessage(data.message);
    else showMessage(`${status} ${data}`);
  }

  post(url, body, successCallback) {
    this.request("POST", url, body, successCallback, this.#onError);
  }
  put(url, body, successCallback) {
    this.request("PUT", url, body, successCallback, this.#onError);
  }
  get(url, successCallback) {
    this.request("GET", url, null, successCallback, this.#onError);
  }
  delete(url, successCallback) {
    this.request("DELETE", url, null, successCallback, this.#onError);
  }
}