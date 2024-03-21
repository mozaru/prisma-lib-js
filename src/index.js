import PrismaAlert from "./modal/alert.js";
import PrismaPrompt from "./modal/prompt.js";
import { BusinessError, UnauthorizedError } from "./utils/error.js";

export let showMessage = async function (message, buttonText, callback) {
  const alert = new PrismaAlert();
  await alert.showAsync(message, buttonText);
  if (callback) callback();
}

export let showError = async function (error, buttonText, callback) {
  let customClass;
  if (!(error instanceof BusinessError)) {
    customClass = 'error';
  }
  const alert = new PrismaAlert(customClass);
  await alert.showAsync(error.message, buttonText);
  if (callback) callback();
  if (error instanceof UnauthorizedError && error.authPage) {
    location.assign(error.authPage);
  }
}

export let prompt =  async function(message, value, resolveText, rejectText, callback) {
  const prompt = new PrismaPrompt();
	const result = await prompt.showAsync(message, value, resolveText, rejectText);
  if (callback) {
    callback(result);
  }
  return result;
}

export let getParamFromUrl = function (paramName) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(paramName);
}

export let paramInUrl = function (paramName) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.has(paramName);
}

export let progressBar = function (elementId, timeout, callback) {
  let progressbar = document.getElementById(elementId);
  const valor = progressbar.value;
  if (valor == 100 && callback && typeof callback == 'function') {
    callback();
  } else {
    progressbar.value = valor + 1;
    setTimeout(
      progressBar,
      timeout / 100,
      elementId,
      timeout,
      callback
    );
  }
}

export let onFileImageChange = function (fileElement, imageId) {
  const imageElement = document.getElementById(imageId);
  const [selectedFile] = fileElement.files;
  if (selectedFile) {
    const reader = new FileReader();
    reader.readAsArrayBuffer(selectedFile);
    reader.onloadend = function () {
      const imgBase64 = btoa(String.fromCharCode.apply(null, new Uint8Array(reader.result)));
      imageElement.src = `data:image/png;base64, ${imgBase64}`;
    };
  }
}

export let getImageValueInBase64 = function (imageId) {
  const imageElement = document.getElementById(imageId);
  const pos = imageElement.src.indexOf('base64');
  if (pos > -1)
    return imageElement.src.substr(pos + 8);
  else
    return '';
}