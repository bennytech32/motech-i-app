require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
const Groq = require('groq-sdk');

// WASHA EXPRESS APP
const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

// ==========================================
// 1. UNGANISHA SUPABASE ADMIN (DATABASE)
// ==========================================
const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// ==========================================
// 2. UNGANISHA GROQ AI (LLaMA 3.3)
// ==========================================
const GROQ_API_KEY = process.env.GROQ_API_KEY;
const groq = new Groq({ apiKey: GROQ_API_KEY });

// ==========================================
// ROUTE 1: KUPIMA KAMA SERVER IPO HEWANI
// ==========================================
app.get('/', (req, res) => {
  res.json({ message: '🚀 MoTECH-i Backend ipo Hewani! Master Diagnostician AI iko Active.' });
});

// ==========================================
// ROUTE 2: MOTECH-I AI ASSISTANT (MASTER DIAGNOSTICIAN)
// ==========================================
app.post('/api/ai/chat', async (req, res) => {
  try {
    const { message } = req.body;
    
    // TUNAITUMA MESEJI KWA GROQ NA MAAGIZO MAZITO YA KIUFUNDI
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        { 
          role: "system", 
          content: `Wewe ni 'MoTECH-i Master Diagnostician', Mhandisi Mkuu na Mtaalam wa Magari wa kiwango cha juu sana.

          SHERIA ZAKO MPYA (ZINGATIA SANA):
          1. USIJIBU KAWAIIDA (No generic answers). Nenda DEEP kiufundi. Taja majina ya sensors, vifaa (mf. MAF sensor, O2 sensor, Transmission Solenoids, Head Gasket), na namba za makosa (OBD2 codes) kama inafaa.
          2. KUULIZA MASWALI: Kama mteja hajataja gari, MUULIZE kwanza: "Tafadhali niambie Gari ni Model gani? Mwaka gani? Na inatumia Engine Code ipi (mfano 1NZ-FE, 2TR-FE) au ukubwa wa injini (mf. 2.0L)?". Usitoe jibu la jumla bila kujua aina ya gari.
          3. MUUNDO WA MAJIBU (CHART FORMAT): Panga majibu yako kwa muundo unaosomeka kwa urahisi, tumia alama hizi:
             🛑 DALILI ZINAZOWEZA KUWA SABABU: (Orodhesha kiufundi)
             🔧 UCHAMBUZI WA KINA: (Elezea kwanini inatokea)
             🛠️ HATUA ZA KUREKEBISHA: (Toa hatua 1, 2, 3...)
          4. LUGHA: Tumia Kiswahili fasaha na cha kiprofesa, lakini maneno ya kiufundi ya gari YAWE KWA KIINGEREZA (Mfano: Spark plugs, Throttle body, Injectors) ili isipoteze maana ya kiufundi.
          5. NJE YA MADA: Mteja akiuliza swali ambalo HALIHUSU magari, KATA KULIJIBU mara moja na umwambie wewe ni Mtaalam wa Magari wa MoTECH-i pekee.
          6. MWISHO WA JIBU: Mshauri mteja abonyeze kitufe cha 'Book Now' kwenye App yetu ili mafundi wa MoTECH-i waje na mashine ya Diagnostics (OBD2 Scanner) kusoma tatizo kwa kompyuta.` 
        },
        { 
          role: "user", 
          content: message 
        }
      ],
      model: "llama-3.3-70b-versatile", 
      temperature: 0.3, // Tumepunguza temperature iwe serious na ya kiufundi zaidi (sio ya kubuni mno)
    });

    // Pata jibu
    const aiReply = chatCompletion.choices[0]?.message?.content || "Samahani, nimeshindwa kuchakata jibu la kiufundi.";

    // Rudisha jibu kwenye App
    res.status(200).json({ reply: aiReply });

  } catch (error) {
    console.error('AI Error:', error);
    res.status(500).json({ error: 'Kuna tatizo kuwasiliana na Mfumo wa AI wa Groq.' });
  }
});

// ==========================================
// ROUTE 3: MFUMO WA MALIPO (SUBSCRIPTIONS WEBHOOK)
// ==========================================
app.post('/api/payments/subscribe', async (req, res) => {
  try {
    const { userId, plan, amount, paymentStatus, transactionId } = req.body;
    console.log(`💰 Pesa imeingia! Transaction: ${transactionId} | Kiasi: ${amount} | Kifurushi: ${plan}`);

    if (paymentStatus === 'SUCCESS') {
      const { data, error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
        user_metadata: { plan: plan }
      });
      if (error) throw error;
      return res.status(200).json({ message: 'Malipo yamekubaliwa.', user: data });
    } else {
      return res.status(400).json({ message: 'Malipo yamefeli.' });
    }
  } catch (error) {
    console.error('Payment Error:', error);
    res.status(500).json({ error: 'Mchakato wa malipo umekwama kwenye server' });
  }
});

// ==========================================
// WASHA SERVER KUSIKILIZA MAOMBI
// ==========================================
app.listen(PORT, '0.0.0.0', () => {
  console.log(`=======================================`);
  console.log(`🚘 MoTECH-i BACKEND INARUN KWENYE PORT ${PORT}`);
  console.log(`🧠 AI Engine: MASTER DIAGNOSTICIAN (Llama 3.3)`);
  console.log(`=======================================`);
});
