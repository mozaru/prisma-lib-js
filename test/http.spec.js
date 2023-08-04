import PrismaHttp from "prisma-js/http";
import { JsonError, HttpError, BadRequestError, NetworkError } from "prisma-js/error";

describe('PrismaHttp', () => {
  let httpClient;
  let xhr;
  let localStorage;
  const access_token = 'token value';
  const baseUrl = 'https://test.com/';
  const url = 'api/endpoint';
  const mockResponseData = { key: 'value' };
  const mockBody = { name: 'prisma-js' }

  beforeEach(() => {
    httpClient = new PrismaHttp(baseUrl);

    xhr = {
      open: jasmine.createSpy('open'),
      setRequestHeader: jasmine.createSpy('setRequestHeader'),
      send: jasmine.createSpy('send').and.callFake(function () {
        this.onload();
      }),
      status: 200,
      statusText: 'OK',
      response: JSON.stringify(mockResponseData),
      onload: null,
      onerror: null,
    };

    localStorage = {
      getItem: () => null
    }
    global.localStorage = localStorage;
    global.XMLHttpRequest = function () { return xhr };
  });

  afterEach(() => {
    delete global.localStorage;
    delete global.XMLHttpRequest;
  });

  it('should make a successful request', async () => {
    const method = 'GET';
    const response = await httpClient.request(method, url);

    expect(xhr.open).toHaveBeenCalledWith(method, `${baseUrl}${url}`);
    expect(xhr.send).toHaveBeenCalled();
    expect(response).toEqual(mockResponseData);
  });

  it('should make a successful request and read the "message" property in the response', async () => {
    const method = 'GET';
    xhr.response = JSON.stringify({ status: 200, message: "OK" });

    const response = await httpClient.request(method, url);

    expect(xhr.open).toHaveBeenCalledWith(method, `${baseUrl}${url}`);
    expect(xhr.send).toHaveBeenCalled();
    expect(response).toEqual("OK");
  });

  it('should handle server message during a bad request', async () => {
    const method = 'POST';
    const responseText = '"username can not be empty"';
    xhr.response = responseText;
    xhr.status = 400;
    xhr.statusText = 'Bad Request';

    await expectAsync(httpClient.request(method, url)).toBeRejectedWithError(BadRequestError, JSON.parse(responseText));
    expect(xhr.open).toHaveBeenCalledWith(method, `${baseUrl}${url}`);
    expect(xhr.send).toHaveBeenCalled();
  });

  it('should send a Authorization header durign a request', async () => {
    const method = 'GET';
    localStorage.getItem = (key) => {
      if (key == 'authentication') {
        return JSON.stringify({ access_token })
      } else {
        return null;
      }
    }

    const response = await httpClient.request(method, url);

    expect(xhr.open).toHaveBeenCalledBefore(xhr.setRequestHeader);
    expect(xhr.open).toHaveBeenCalledWith(method, `${baseUrl}${url}`);
    expect(xhr.setRequestHeader).toHaveBeenCalledWith("Authorization", `Bearer ${access_token}`);
    expect(xhr.setRequestHeader).toHaveBeenCalledBefore(xhr.send);
    expect(xhr.send).toHaveBeenCalled();
    expect(response).toEqual(mockResponseData);
  });

  it('should handle errors during request', async () => {
    const method = 'DELETE';
    const errorMessage = 'Not Found';
    xhr.response = '';
    xhr.status = 404;
    xhr.statusText = errorMessage;

    await expectAsync(httpClient.request(method, url)).toBeRejectedWithError(HttpError, `404: ${errorMessage}`);
    expect(xhr.open).toHaveBeenCalledWith(method, `${baseUrl}${url}`);
    expect(xhr.send).toHaveBeenCalled();
  });

  it('should handle network errors during request', async () => {
    const method = 'POST';
    xhr.status = 0;
    xhr.statusText = '';
    xhr.send = jasmine.createSpy().and.callFake(function () {
      this.onerror();
    });

    await expectAsync(httpClient.request(method, url)).toBeRejectedWithError(NetworkError);
    expect(xhr.open).toHaveBeenCalledWith(method, `${baseUrl}${url}`);
    expect(xhr.send).toHaveBeenCalled();
  });

  it('should handle JSON parser error during request', async () => {
    const method = 'PUT';
    xhr.response = xhr.response.slice(0, -1);

    await expectAsync(httpClient.request(method, url, mockBody)).toBeRejectedWithError(JsonError);
    expect(xhr.open).toHaveBeenCalledWith(method, `${baseUrl}${url}`);
    expect(xhr.send).toHaveBeenCalledWith(JSON.stringify(mockBody));
  });

  it('should make a successful POST request', async () => {
    const response = await httpClient.post(url, mockBody);

    expect(xhr.open).toHaveBeenCalledWith('POST', `${baseUrl}${url}`);
    expect(xhr.send).toHaveBeenCalledWith(JSON.stringify(mockBody));
    expect(response).toEqual(mockResponseData);
  });

  it('should make a successful PUT request', async () => {
    const response = await httpClient.put(url, mockBody);

    expect(xhr.open).toHaveBeenCalledWith('PUT', `${baseUrl}${url}`);
    expect(xhr.send).toHaveBeenCalledWith(JSON.stringify(mockBody));
    expect(response).toEqual(mockResponseData);
  });

  it('should make a successful GET request', async () => {
    const response = await httpClient.get(url);

    expect(xhr.open).toHaveBeenCalledWith('GET', `${baseUrl}${url}`);
    expect(xhr.send).toHaveBeenCalled();
    expect(response).toEqual(mockResponseData);
  });

  it('should make a successful DELET request', async () => {
    const response = await httpClient.delete(url);

    expect(xhr.open).toHaveBeenCalledWith('DELETE', `${baseUrl}${url}`);
    expect(xhr.send).toHaveBeenCalled();
    expect(response).toEqual(mockResponseData);
  });

});