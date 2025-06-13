let handler = async (m, { conn, text, participants}) => {
	
    let users = participants.map(u => u.id).filter(v => v !== conn.user.jid)
    if (!m.quoted) throw `✳️ Reply Message`
    conn.sendMessage(m.chat, { forward: m.quoted.fakeObj, mentions: users } )
}

handler.help = ['tag']
handler.tags = ['owner']
handler.command = /^(totag|tag)$/i
handler.admin = true
handler.group = true
export default handler
