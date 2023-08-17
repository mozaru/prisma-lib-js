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

    const backdrop = document.querySelector(`.backdrop.${customClass}`);
    expect(backdrop).toBeDefined();
  });

  it('should add modal', () => {
    const modal = document.querySelector('.modal');
    expect(modal).toBeDefined();
  });

  it('should add modal with diplay none', () => {
    const backdrop = document.querySelector('.backdrop');
    expect(backdrop.style.display).toEqual('none');
  });

  it('should set modal display to block', () => {
    alert.showAsync();

    const modal = document.querySelector('.modal');
    expect(modal.style.display).toEqual('block');
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

  it('should remove modal from document after click button', () => {
    alert.showAsync();
    
    const button = document.querySelector('.modal .btn');
    button.dispatchEvent(new Event('click'));

    const modal = document.querySelector('.modal')
    expect(modal).toBeUndefined();
  });

  it('should resolve show promise after click button', async () => {
    const button = document.querySelector('.modal .btn');
    setTimeout(() => {
      button.dispatchEvent(new Event('click'));
    }, 0)

    await expectAsync(alert.showAsync()).toBeResolved();
  });
});