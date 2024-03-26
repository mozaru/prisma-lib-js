import { showMessage } from './index.js';

export default class PrismaGeolocation {
  #watchId = null;
  #lastPosition = null;
  #positionOptions = {
    maximumAge: 0,
    timeout: 10 * 1000,
    enableHighAccuracy: true
  };
  currentPosition() {
    if (this.#lastPosition) {
      return Promise.resolve(this.#lastPosition);
    }
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, this.#positionOptions);
    });
  }
  startWatch(callback) {
    if (navigator.geolocation) {
      this.#watchId = navigator.geolocation.watchPosition((position) => {
        this.#lastPosition = position;
        callback(position);
      }, () => {
        showMessage("Error: The geolocation service failed.");
      }, this.#positionOptions);
    } else {
      showMessage("Error: Your browser doesn't support geolocation.");
    }
  }
  stopWatch() {
    if (this.#watchId) {
      navigator.geolocation.clearWatch(this.#watchId);
      this.#watchId = null;
      this.#lastPosition = null;
    }
  }
  distanceInMeters(p1, p2) {
    let dist = Math.sqrt(Math.pow(p1.lat - p2.lat, 2) + Math.pow(p1.lng - p2.lng, 2))
    dist = dist * 60;
    return dist * 1852;
  }
}