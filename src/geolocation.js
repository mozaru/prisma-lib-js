import { showMessage } from './index.js';
import { Geolocation } from '@capacitor/geolocation';

export default class PrismaGeolocation {
  #watchId = null;
  #lastPosition = null;
  #positionOptions = {
    maximumAge: 0,
    timeout: 30 * 1000,
    enableHighAccuracy: true
  };
  async currentPosition() {
    if (this.#lastPosition) {
      return this.#lastPosition;
    }
    return await Geolocation.getCurrentPosition(this.#positionOptions);
  }
  async startWatch(callback) {
    this.#watchId = await Geolocation.watchPosition(this.#positionOptions,
    (position, err) => {
      if (err) {
        showMessage(`Code: ${err.code}\nError: ${err.message}`);
      } else if (position && typeof callback === 'function') {
        this.#lastPosition = position;
        callback(position);
      }
    });
  }
  async stopWatch() {
    if (this.#watchId) {
      await Geolocation.clearWatch({id: this.#watchId});
      this.#watchId = null;
      this.#lastPosition = null;
    }
  }
  distanceInMeters (p1, p2) {
    let dist = Math.sqrt(Math.pow(p1.lat - p2.lat, 2) + Math.pow(p1.lng - p2.lng, 2))
    dist = dist * 60;
    return dist * 1852;
  };
}