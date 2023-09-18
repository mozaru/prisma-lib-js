import { MockDocument } from "./mock-dom.js";
import PrismaAlert from "prisma-js/alert";

describe('PrismaAlert', () => {
  let alert;

  beforeEach(() => {
    global.document = new MockDocument();
    alert = new PrismaAlert();
  });
  
  it('should add custom class at modal backdrop', () => {
    const customClass = 'custom';
    alert = new PrismaAlert(customClass);
    alert.showAsync();

    const backdrop = document.querySelector(`.backdrop.${customClass}`);
    expect(backdrop).toBeDefined();
  });

  it('should add modal', () => {
    alert.showAsync();
    const modal = document.querySelector('.modal');
    expect(modal).toBeDefined();
  });

  it('should set modal content text', () => {
    const message = 'Alert message!!!';
    alert.showAsync(message);
    
    const content = document.querySelector('.modal .content');
    expect(content.innerText).toEqual(message);
  });

  it('should set modal button default text as Ok', () => {
    alert.showAsync('Alert message!!!');
    
    const button = document.querySelector('.modal .btn');
    expect(button.innerText).toEqual('Ok');
  });

  it('should set modal button text', () => {
    const btnText = 'Confirm';
    alert.showAsync('Alert message!!!', btnText);
    
    const button = document.querySelector('.modal .btn');
    expect(button.innerText).toEqual(btnText);
  });

  it('should remove modal from document after click button', async () => {
    const promise = alert.showAsync();
    
    const button = document.querySelector('.modal .btn');
    button.dispatchEvent(new Event('click'));

    await promise;

    const modal = document.querySelector('.modal')
    expect(modal).toBeUndefined();
  });

  it('should resolve show promise after click button', async () => {
    const promise = alert.showAsync();
    const button = document.querySelector('.modal .btn');
    button.dispatchEvent(new Event('click'));

    await expectAsync(promise).toBeResolved();
  });
});