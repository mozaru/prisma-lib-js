import { showMessage } from './index.js';

export default class PrismaGeolocation {
  #watchId = null;
  startWatch(callback) {
    if (navigator.geolocation) {
      this.#watchId = navigator.geolocation.watchPosition(
        callback,
        () => {
          showMessage("Error: The geolocation service failed.");
        }, {
        maximumAge: 0,
        timeout: 30 * 1000,
        enableHighAccuracy: true
      });
    } else {
      showMessage("Error: Your browser doesn't support geolocation.");
    }
  }
  stopWatch() {
    if (this.#watchId) {
      navigator.geolocation.clearWatch(this.#watchId);
      this.#watchId = null;
    }
  }
  distanceInMeters(p1, p2) {
    let dist = Math.sqrt(Math.pow(p1.lat - p2.lat, 2) + Math.pow(p1.lng - p2.lng, 2))
    dist = dist * 60;
    return dist * 1852;
  }
}