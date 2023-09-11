import { showMessage } from './index.js';
import { Geolocation } from '@capacitor/geolocation';

export default class PrismaGeolocation {
  #watchId = null;
  async startWatch(callback) {
    this.#watchId = await Geolocation.watchPosition({
      maximumAge: 0,
      timeout: 30 * 1000,
      enableHighAccuracy: true
    },
    (position, err) => {
      if (err) {
        showMessage(`Error: ${err}`);
      } else if (position && typeof callback === 'function') {
        callback(position);
      }
    });
  }
  async stopWatch() {
    if (this.#watchId) {
      await Geolocation.clearWatch({id: this.#watchId});
      this.#watchId = null;
    }
  }
  distanceInMeters (p1, p2) {
    let dist = Math.sqrt(Math.pow(p1.lat - p2.lat, 2) + Math.pow(p1.lng - p2.lng, 2))
    dist = dist * 60;
    return dist * 1852;
  };
}