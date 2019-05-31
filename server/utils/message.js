const moment = require('moment');
const emoji = require('node-emoji')

const generateMessage = (from, text,) => {
  finalText = emoji.emojify(text)
  return {
    from,
    text,
    createdAt: moment().valueOf(),
  };
};

module.exports = { generateMessage };
