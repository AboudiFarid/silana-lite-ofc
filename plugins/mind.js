import axios from "axios";
import FormData from "form-data";

async function mistralNemo(question) {
    let d = new FormData();
    d.append("content", `User: ${question}`);
    d.append("model", "@mistral/open-mistral-nemo");

    let head = {
        headers: {
            ...d.getHeaders()
        }
    };

    let { data: ak } = await axios.post("https://mind.hydrooo.web.id/v1/chat", d, head);
    return ak.result;
}

let handler = async (m, { args }) => {
    if (!args[0]) return m.reply("❌ | المرجو إدخال السؤال.");

    try {
        let response = await mistralNemo(args.join(" "));
        m.reply(`🤖 | الرد:\n${response}`);
    } catch (error) {
        console.error(error);
        m.reply("❌ | حدث خطأ أثناء جلب الرد، حاول مرة أخرى لاحقًا.");
    }
};

handler.help = ["mind"];
handler.tags = ["ai"];
handler.command = /^mind$/i;

export default handler;
