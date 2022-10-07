import createSlot from '../createSlot';

describe('createSlot', () => {
  test('must return a slot element', () => {
    const slot = createSlot(document.body, 300, 200);

    expect(slot).toBeInstanceOf(HTMLDivElement);
    expect(slot).toMatchSnapshot();

    slot.parentElement.removeChild(slot);
  });
});
