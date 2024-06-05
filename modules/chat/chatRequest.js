const { OpenAI } = require("openai");

const openai = new OpenAI({
  apiKey: "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",
});

class ChatGptRequest {
  async chatQuery(message, prompt) {
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo-0125",
        messages: [
          { role: "system", content: prompt == undefined ? "" : prompt },
          { role: "user", content: message },
        ],
      });

      const answer = response.choices[0].message.content.trim();

      return answer;
    } catch (error) {
      return null;
    }
  }
}

module.exports = new ChatGptRequest();
