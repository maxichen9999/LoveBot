import * as phoenixBaileys from 'phoenix-baileys-v3';
const content = await phoenixBaileys.generateWAMessageContent({
  text: 'Wähle einen süßen Test aus. 💗',
  title: '🎀 LOVE BOT · TESTMENÜ',
  footer: '🌸 Schatzi + Maxichen · iOS & Android',
  interactiveButtons: [{
    name: 'single_select',
    buttonParamsJson: {
      title: '✨ TEST AUSWÄHLEN',
      sections: [{ title: '💌 Verfügbare Tests', rows: [
        { title: '🎁 Produktkarte', description: 'Süße Produktnachricht ansehen', id: 'cmd:test9' }
      ]}]
    }
  }]
}, {});
console.log(JSON.stringify(content, null, 2));
