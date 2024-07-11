const { OpenAI } = require("openai");

const openai = new OpenAI({
  apiKey: process.env.CHAT_API_KEY,
});

class ChatGptRequest {
  async chatQuery(requestScope) {
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo-0125",
        messages: Array.isArray(requestScope)
          ? requestScope
          : [{ role: "user", content: requestScope }],
        temperature: 0.1,
      });

      const answer = response.choices[0].message.content.trim();

      return answer;
    } catch (error) {
      return null;
    }
  }
}

module.exports = new ChatGptRequest();
