import { MockWindow } from "../mock-dom.js";
import { PrismaPrompt } from "prisma-js/modal";

describe('PrismaPrompt', () => {
  let prompt;

  beforeEach(() => {
    global.window = new MockWindow();
    prompt = new PrismaPrompt();
  });
  
  it('should add custom class at modal backdrop', async () => {
    const customClass = 'custom';
    prompt = new PrismaPrompt(customClass);
    prompt.show();
    await prompt.opened;

    const backdrop = document.querySelector(`.backdrop.${customClass}`);
    expect(backdrop).toBeDefined();
  });

  it('should add modal', async () => {
    prompt.show();
    await prompt.opened;

    const modal = document.querySelector('.modal');
    expect(modal).toBeDefined();
  });

  it('should set modal comfirm button default text as Ok', async () => {
    prompt.show();

    await prompt.opened;

    const button = document.querySelector('.modal .btn.btnDefault');
    expect(button.innerText).toEqual('Ok');
  });

  it('should set modal cancel button default text as Cancel', async () => {
    prompt.show();

    await prompt.opened;

    const button = document.querySelector('.modal .btn:not(.btnDefault)');
    expect(button.innerText).toEqual('Cancel');
  });

  it('should set modal content text', async () => {
    const message = 'Prompt message!!!';
    prompt.show(message);
    await prompt.opened;
    
    const content = document.querySelector('.modal .content label');
    expect(content.innerText).toEqual(message);
  });

  it('should set input value', async () => {
    const providedValue = 'Testing value set';
    prompt.show(undefined, providedValue);

    await prompt.opened;

    const input = document.querySelector('.modal input');
    expect(input.value).toEqual(providedValue);
  });

  it('should set modal confirm button text', async () => {
    const btnText = 'Confirm';
    prompt.show(undefined, undefined, btnText);
    await prompt.opened;
    
    const button = document.querySelector('.modal .btn.btnDefault');
    expect(button.innerText).toEqual(btnText);
  });

  it('should set modal cancel button text', async () => {
    const btnText = 'Abort';
    prompt.show(undefined, undefined, undefined, btnText);
    await prompt.opened;
    
    const button = document.querySelector('.modal .btn:not(.btnDefault)');
    expect(button.innerText).toEqual(btnText);
  });

  it('should remove modal from document after click confirm button', async () => {
    prompt.show();
    await prompt.opened;
    
    const button = document.querySelector('.modal .btn.btnDefault');
    button.dispatchEvent(new Event('click'));

    await prompt.closed;

    const modal = document.querySelector('.modal')
    expect(modal).toBeUndefined();
  });

  it('should remove modal from document after click cancel button', async () => {
    prompt.show();
    await prompt.opened;
    
    const button = document.querySelector('.modal .btn:not(.btnDefault)');
    button.dispatchEvent(new Event('click'));

    await prompt.closed;

    const modal = document.querySelector('.modal')
    expect(modal).toBeUndefined();
  });

  it('should resolve closed promise after click confirm button', async () => {
    prompt.show();
    await prompt.opened;

    const button = document.querySelector('.modal .btn.btnDefault');
    button.dispatchEvent(new Event('click'));

    await expectAsync(prompt.closed).toBeResolved();
  });

  it('should resolve closed promise after click cancel button', async () => {
    prompt.show();
    await prompt.opened;

    const button = document.querySelector('.modal .btn:not(.btnDefault)');
    button.dispatchEvent(new Event('click'));

    await expectAsync(prompt.closed).toBeResolved();
  });

  it('should await transition time in seconds, to resolve the opened promise', async () => {
    const durationInSeconds = 0.2;
    const modal = prompt.querySelector('.modal');
    const style = getComputedStyle(modal);
    style.setProperty('transition-duration', `${durationInSeconds}s`);

    let elapsedTime = performance.now();
    prompt.show();
    await prompt.opened;
    elapsedTime = (performance.now() - elapsedTime) / 1000;
    
    expect(elapsedTime).toBeGreaterThanOrEqual(durationInSeconds);
  });

  it('should await transition time in miliseconds, to resolve the opened promise', async () => {
    const durationInMiliseconds = 500;
    const modal = prompt.querySelector('.modal');
    const style = getComputedStyle(modal);
    style.setProperty('transition-duration', `${durationInMiliseconds}ms`);

    let elapsedTime = performance.now();
    prompt.show();
    await prompt.opened;
    elapsedTime = (performance.now() - elapsedTime);
    
    expect(elapsedTime).toBeGreaterThanOrEqual(durationInMiliseconds);
  });

  it('should await animation time in seconds, to resolve the opened promise', async () => {
    const durationInSeconds = 0.3;
    const modal = prompt.querySelector('.modal');
    const style = getComputedStyle(modal);
    style.setProperty('animation-duration', `${durationInSeconds}s`);

    let elapsedTime = performance.now();
    prompt.show();
    await prompt.opened;
    elapsedTime = (performance.now() - elapsedTime) / 1000;
    
    expect(elapsedTime).toBeGreaterThanOrEqual(durationInSeconds);
  });

  it('should await animation time in miliseconds, to resolve the opened promise', async () => {
    const durationInMiliseconds = 600;
    const modal = prompt.querySelector('.modal');
    const style = getComputedStyle(modal);
    style.setProperty('animation-duration', `${durationInMiliseconds}ms`);

    let elapsedTime = performance.now();
    prompt.show();
    await prompt.opened;
    elapsedTime = (performance.now() - elapsedTime);
    
    expect(elapsedTime).toBeGreaterThanOrEqual(durationInMiliseconds);
  });

  it('should await transition, with a greater time, to resolve the opened promise', async () => {
    const durationInSeconds = 0.3;
    const modal = prompt.querySelector('.modal');
    const style = getComputedStyle(modal);
    style.setProperty('transition-duration', `${durationInSeconds}s`);
    style.setProperty('animation-duration', `0.2s`);

    let elapsedTime = performance.now();
    prompt.show();
    await prompt.opened;
    elapsedTime = (performance.now() - elapsedTime) / 1000;
    
    expect(elapsedTime).toBeGreaterThanOrEqual(durationInSeconds);
  });

  it('should await animation, with a greater time, to resolve the opened promise', async () => {
    const durationInMiliseconds = 400;
    const modal = prompt.querySelector('.modal');
    const style = getComputedStyle(modal);
    style.setProperty('animation-duration', `${durationInMiliseconds}ms`);
    style.setProperty('transition-duration', `300ms`);

    let elapsedTime = performance.now();
    prompt.show();
    await prompt.opened;
    elapsedTime = (performance.now() - elapsedTime);
    
    expect(elapsedTime).toBeGreaterThanOrEqual(durationInMiliseconds);
  });
});