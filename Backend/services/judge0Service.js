const axios = require("axios");

const JUDGE0_URL = "https://ce.judge0.com/submissions";

const languageMap = {
  python: 71,
  javascript: 63,
  cpp: 54,
  java: 62
};

async function runCode(sourceCode, language, input) {
  const language_id = languageMap[language];

  if (!language_id) {
    throw new Error("Unsupported language");
  }

  const response = await axios.post(
    `${JUDGE0_URL}?base64_encoded=false&wait=true`,
    {
      source_code: sourceCode,
      language_id: language_id,
      stdin: input
    },
    {
      headers: {
        "Content-Type": "application/json"
      }
    }
  );

  return response.data;
}

module.exports = { runCode };
