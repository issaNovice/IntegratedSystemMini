export default {
  testEnvironment: "node",
  verbose: true,
  setupFilesAfterEnv: ["<rootDir>/tests/setup.js"],
  transform: {}, // prevent Jest from trying to transpile ESM
};
