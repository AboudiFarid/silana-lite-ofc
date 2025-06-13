import axios from "axios";
const { generateWAMessageContent, generateWAMessageFromContent, proto } = (await import('@adiwajshing/baileys')).default;

let handler = async (m, { conn, text }) => {
  if (!m.isGroup) {
    return m.reply("هذا الأمر يعمل في المجموعات فقط!");
  }
  if (!text) {
    return m.reply("[!] مثال: \n *.deeplor-ai* girl");
  }
  try {
    m.reply("انتظر... جاري إنشاء الصور");

    let { result } = await generateImages(text);

    // Function to create image message
    async function createImage(url) {
      const { imageMessage } = await generateWAMessageContent(
        { image: { url } },
        { upload: conn.waUploadToServer }
      );
      return imageMessage;
    }

    // Prepare carousel cards
    let push = [];
    let i = 1;
    for (let res of result) {
      push.push({
        body: proto.Message.InteractiveMessage.Body.fromObject({
          text: `📌 *Model:* ${res.model}\n🔗 *URL:* ${res.url}`,
        }),
        footer: proto.Message.InteractiveMessage.Footer.fromObject({
          text: "乂 Generated by AI 🧠",
        }),
        header: proto.Message.InteractiveMessage.Header.fromObject({
          title: `Image ${i++}`,
          hasMediaAttachment: true,
          imageMessage: await createImage(res.url),
        }),
        nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.fromObject({
          buttons: [
            {
              name: "cta_url",
              buttonParamsJson: `{"display_text":"View Image","url":"${res.url}"}`,
            },
          ],
        }),
      });
    }

    // Create and send carousel message
    const bot = generateWAMessageFromContent(
      m.chat, // إرسال الرسالة إلى المجموعة
      {
        viewOnceMessage: {
          message: {
            messageContextInfo: {
              deviceListMetadata: {},
              deviceListMetadataVersion: 2,
            },
            interactiveMessage: proto.Message.InteractiveMessage.fromObject({
              body: proto.Message.InteractiveMessage.Body.create({
                text: "اكتملت نتائج إنشاء الصور...",
              }),
              footer: proto.Message.InteractiveMessage.Footer.create({
                text: "乂 Generated by AI 🧠",
              }),
              header: proto.Message.InteractiveMessage.Header.create({
                hasMediaAttachment: false,
              }),
              carouselMessage: proto.Message.InteractiveMessage.CarouselMessage.fromObject({
                cards: [...push],
              }),
            }),
          },
        },
      },
      {}
    );

    await conn.relayMessage(m.chat, bot.message, { messageId: bot.key.id }); // إرسال الرسالة إلى المجموعة
  } catch (e) {
    throw "خطأ: " + e.message;
  }
};

handler.help = handler.command = ["deeplor-ai"];
handler.tags = ["ai"];
handler.limit = true;
handler.group = true; // تقييد الأمر ليعمل في المجموعات فقط
export default handler;

async function generateImages(prompt) {
  try {
    const randomIP = `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;

    const userAgentList = [
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0.3 Safari/605.1.15",
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      "Mozilla/5.0 (Linux; Android 10; SM-G960U) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.77 Mobile Safari/537.36",
    ];

    const models = [
      "Glowing Forest",
      "Vector Art",
      "Princess",
      "LoL",
      "Realistic Anime",
      "West Coast",
      "Blue Rhapsody",
      "Graffiti",
      "Clown",
      "Elf",
    ];

    let pull = [];

    for (let i = 0; i < models.length; i++) {
      const randomUserAgent = userAgentList[Math.floor(Math.random() * userAgentList.length)];

      const source = await axios.post(
        "https://restapi.cutout.pro/web/ai/generateImage/generateAsync",
        {
          prompt: prompt,
          style: models[i],
          quantity: 1,
          width: 512,
          height: 512,
        },
        {
          headers: {
            "Content-Type": "application/json",
            "User-Agent": randomUserAgent,
            "X-Forwarded-For": randomIP,
            "Referer": "https://www.cutout.pro/zh-CN/ai-art-generation/upload",
          },
        }
      );

      if (!source.data.data || !source.data.data.batchId) {
        throw new Error(`Unable to retrieve batchId from POST response ${models[i]}`);
      }

      const batchId = source.data.data.batchId;

      let status = false;

      while (!status) {
        const txt2img = await axios.get(
          `https://restapi.cutout.pro/web/ai/generateImage/getGenerateImageTaskResult?batchId=${batchId}`,
          {
            headers: {
              Accept: "application/json, text/plain, */*",
              "User-Agent": randomUserAgent,
              "X-Forwarded-For": randomIP,
              "Referer": "https://www.cutout.pro/zh-CN/ai-art-generation/upload",
            },
          }
        );

        const image = txt2img.data.data.text2ImageVoList;

        status = image.every((image) => image.status === 1);

        if (status) {
          const model_result = image.map((image) => ({
            model: models[i],
            url: image.resultUrl,
            creator_scrape: "INS",
          }));

          pull = pull.concat(model_result);
        } else {
          await new Promise((resolve) => setTimeout(resolve, 0));
        }
      }
    }

    return { result: pull };
  } catch (error) {
    throw error;
  }
}
