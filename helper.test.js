const sayHello = require("./helper");

test("string returning hello there jest", () => {
  expect(sayHello()).toMatch("hello there jest");
});
