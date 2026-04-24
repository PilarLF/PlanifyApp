/** @type {import("jest").Config} **/
module.exports = {
  testEnvironment: "node",
  transform: {
    "^.+\\.ts$": "ts-jest"
  },
  testMatch: ["**/tests/**/*.spec.ts"]
};