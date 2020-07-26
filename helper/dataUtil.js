function dataUtil(params) {

  function isoDate(params) {
    if(params) return  new Date(params).toISOString();
    return  new Date().toISOString();
  }

  return { isoDate }
}

module.exports = new dataUtil;