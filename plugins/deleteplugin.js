import { tmpdir } from "os";
import path, { join } from "path";
import {
  readdirSync,
  statSync,
  unlinkSync,
  existsSync,
  readFileSync,
  watch,
} from "fs";
let handler = async (
  m,
  { conn, usedPrefix, usedPrefix: _p, __dirname, args, text, command },
) => {
  let ar = Object.keys(plugins);
  let ar1 = ar.map((v) => v.replace(".js", ""));
  if (!text) throw `where the text?\n\n example:\n${usedPrefix + command} info`;
  if (!ar1.includes(args[0]))
    return m.reply(
      `*Not found*\n==================================\n\n${ar1.map((v) => " " + v).join`\n`}`,
    );
  const file = join(__dirname, "../plugins/" + args[0] + ".js");
  unlinkSync(file);
  conn.reply(m.chat, `Succes deleted "plugins/${args[0]}.js"`, m);
};
handler.help = ["deleteplugin", "df"];
handler.tags = ["owner"];
handler.command = /^(df|deleteplugin)$/i;
handler.mods = true;
export default handler;
