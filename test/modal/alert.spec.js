import { MockWindow } from "../mock-dom.js";
import PrismaAlert from "prisma-js/alert";

describe('PrismaAlert', () => {
  let alert;

  beforeEach(() => {
    global.window = new MockWindow();
    alert = new PrismaAlert();
  });
  
  it('should add custom class at modal backdrop', async () => {
    const customClass = 'custom';
    alert = new PrismaAlert(customClass);
    alert.show();
    await alert.opened;

    const backdrop = document.querySelector(`.backdrop.${customClass}`);
    expect(backdrop).toBeDefined();
  });

  it('should add modal', async () => {
    alert.show();
    await alert.opened;

    const modal = document.querySelector('.modal');
    expect(modal).toBeDefined();
  });

  it('should set modal content text', async () => {
    const message = 'Alert message!!!';
    alert.show(message);
    await alert.opened;
    
    const content = document.querySelector('.modal .content');
    expect(content.innerText).toEqual(message);
  });

  it('should set modal button default text as Ok', async () => {
    alert.show();

    await alert.opened;

    const button = document.querySelector('.modal .btn');
    expect(button.innerText).toEqual('Ok');
  });

  it('should set modal button text', async () => {
    const btnText = 'Confirm';
    alert.show('Alert message!!!', btnText);
    await alert.opened;
    
    const button = document.querySelector('.modal .btn');
    expect(button.innerText).toEqual(btnText);
  });

  it('should remove modal from document after click button', async () => {
    alert.show();
    await alert.opened;
    
    const button = document.querySelector('.modal .btn');
    button.dispatchEvent(new Event('click'));

    await alert.closed;

    const modal = document.querySelector('.modal')
    expect(modal).toBeUndefined();
  });

  it('should resolve closed promise after click button', async () => {
    alert.show();
    await alert.opened;

    const button = document.querySelector('.modal .btn');
    button.dispatchEvent(new Event('click'));

    await expectAsync(alert.closed).toBeResolved();
  });

  it('should await transition time in seconds, to resolve the opened promise', async () => {
    const durationInSeconds = 0.2;
    const modal = alert.querySelector('.modal');
    const style = getComputedStyle(modal);
    style.setProperty('transition-duration', `${durationInSeconds}s`);

    let elapsedTime = performance.now();
    alert.show();
    await alert.opened;
    elapsedTime = (performance.now() - elapsedTime) / 1000;
    
    expect(elapsedTime).toBeGreaterThanOrEqual(durationInSeconds);
  });

  it('should await transition time in miliseconds, to resolve the opened promise', async () => {
    const durationInMiliseconds = 500;
    const modal = alert.querySelector('.modal');
    const style = getComputedStyle(modal);
    style.setProperty('transition-duration', `${durationInMiliseconds}ms`);

    let elapsedTime = performance.now();
    alert.show();
    await alert.opened;
    elapsedTime = (performance.now() - elapsedTime);
    
    expect(elapsedTime).toBeGreaterThanOrEqual(durationInMiliseconds);
  });

  it('should await animation time in seconds, to resolve the opened promise', async () => {
    const durationInSeconds = 0.3;
    const modal = alert.querySelector('.modal');
    const style = getComputedStyle(modal);
    style.setProperty('animation-duration', `${durationInSeconds}s`);

    let elapsedTime = performance.now();
    alert.show();
    await alert.opened;
    elapsedTime = (performance.now() - elapsedTime) / 1000;
    
    expect(elapsedTime).toBeGreaterThanOrEqual(durationInSeconds);
  });

  it('should await animation time in miliseconds, to resolve the opened promise', async () => {
    const durationInMiliseconds = 600;
    const modal = alert.querySelector('.modal');
    const style = getComputedStyle(modal);
    style.setProperty('animation-duration', `${durationInMiliseconds}ms`);

    let elapsedTime = performance.now();
    alert.show();
    await alert.opened;
    elapsedTime = (performance.now() - elapsedTime);
    
    expect(elapsedTime).toBeGreaterThanOrEqual(durationInMiliseconds);
  });

  it('should await transition, with a greater time, to resolve the opened promise', async () => {
    const durationInSeconds = 0.3;
    const modal = alert.querySelector('.modal');
    const style = getComputedStyle(modal);
    style.setProperty('transition-duration', `${durationInSeconds}s`);
    style.setProperty('animation-duration', `0.2s`);

    let elapsedTime = performance.now();
    alert.show();
    await alert.opened;
    elapsedTime = (performance.now() - elapsedTime) / 1000;
    
    expect(elapsedTime).toBeGreaterThanOrEqual(durationInSeconds);
  });

  it('should await animation, with a greater time, to resolve the opened promise', async () => {
    const durationInMiliseconds = 400;
    const modal = alert.querySelector('.modal');
    const style = getComputedStyle(modal);
    style.setProperty('animation-duration', `${durationInMiliseconds}ms`);
    style.setProperty('transition-duration', `300ms`);

    let elapsedTime = performance.now();
    alert.show();
    await alert.opened;
    elapsedTime = (performance.now() - elapsedTime);
    
    expect(elapsedTime).toBeGreaterThanOrEqual(durationInMiliseconds);
  });

  it('should await transition time in seconds, to resolve the closed promise', async () => {
    const durationInSeconds = 0.2;
    const modal = alert.querySelector('.modal');
    const style = getComputedStyle(modal);
    style.setProperty('transition-duration', `${durationInSeconds}s`);
    
    alert.show();
    await alert.opened;

    const button = document.querySelector('.modal .btn');
    button.dispatchEvent(new Event('click'));
    let elapsedTime = performance.now();
    await alert.closed
    elapsedTime = (performance.now() - elapsedTime) / 1000;
    
    expect(elapsedTime).toBeGreaterThanOrEqual(durationInSeconds);
  });

  it('should await transition time in miliseconds, to resolve the closed promise', async () => {
    const durationInMiliseconds = 500;
    const modal = alert.querySelector('.modal');
    const style = getComputedStyle(modal);
    style.setProperty('transition-duration', `${durationInMiliseconds}ms`);

    alert.show();
    await alert.opened;

    const button = document.querySelector('.modal .btn');
    button.dispatchEvent(new Event('click'));
    let elapsedTime = performance.now();
    await alert.closed
    elapsedTime = (performance.now() - elapsedTime);
    
    expect(elapsedTime).toBeGreaterThanOrEqual(durationInMiliseconds);
  });

  it('should await animation time in seconds, to resolve the closed promise', async () => {
    const durationInSeconds = 0.3;
    const modal = alert.querySelector('.modal');
    const style = getComputedStyle(modal);
    style.setProperty('animation-duration', `${durationInSeconds}s`);

    alert.show();
    await alert.opened;

    const button = document.querySelector('.modal .btn');
    button.dispatchEvent(new Event('click'));
    let elapsedTime = performance.now();
    await alert.closed
    elapsedTime = (performance.now() - elapsedTime) / 1000;
    
    expect(elapsedTime).toBeGreaterThanOrEqual(durationInSeconds);
  });

  it('should await animation time in miliseconds, to resolve the closed promise', async () => {
    const durationInMiliseconds = 600;
    const modal = alert.querySelector('.modal');
    const style = getComputedStyle(modal);
    style.setProperty('animation-duration', `${durationInMiliseconds}ms`);

    alert.show();
    await alert.opened;

    const button = document.querySelector('.modal .btn');
    button.dispatchEvent(new Event('click'));
    let elapsedTime = performance.now();
    await alert.closed
    elapsedTime = (performance.now() - elapsedTime);
    
    expect(elapsedTime).toBeGreaterThanOrEqual(durationInMiliseconds);
  });

  it('should await transition, with a greater time, to resolve the closed promise', async () => {
    const durationInSeconds = 0.3;
    const modal = alert.querySelector('.modal');
    const style = getComputedStyle(modal);
    style.setProperty('transition-duration', `${durationInSeconds}s`);
    style.setProperty('animation-duration', `0.2s`);

    alert.show();
    await alert.opened;

    const button = document.querySelector('.modal .btn');
    button.dispatchEvent(new Event('click'));
    let elapsedTime = performance.now();
    await alert.closed
    elapsedTime = (performance.now() - elapsedTime) / 1000;
    
    expect(elapsedTime).toBeGreaterThanOrEqual(durationInSeconds);
  });

  it('should await animation, with a greater time, to resolve the closed promise', async () => {
    const durationInMiliseconds = 400;
    const modal = alert.querySelector('.modal');
    const style = getComputedStyle(modal);
    style.setProperty('animation-duration', `${durationInMiliseconds}ms`);
    style.setProperty('transition-duration', `300ms`);

    alert.show();
    await alert.opened;

    const button = document.querySelector('.modal .btn');
    button.dispatchEvent(new Event('click'));
    let elapsedTime = performance.now();
    await alert.closed
    elapsedTime = (performance.now() - elapsedTime);
    
    expect(elapsedTime).toBeGreaterThanOrEqual(durationInMiliseconds);
  });
});