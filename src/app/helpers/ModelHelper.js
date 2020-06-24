class ModelHelper {
  generateId() {
    return Math.floor(Math.random() * (99999999 - 1)) + 0;
  }
}

export default new ModelHelper();