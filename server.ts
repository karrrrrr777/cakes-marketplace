import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import fs from "fs";
import nodemailer from "nodemailer";
import twilio from "twilio";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Parse JSON payloads
  app.use(express.json());

  // API Route - Health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date() });
  });

  // API Route - Send Verification Email and SMS
  app.post("/api/auth/send-verification", async (req, res) => {
    try {
      const { email, phone, emailCode, smsCode, fullName, language } = req.body;

      const hasSmtpConfig = !!(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
      const hasSmsConfig = !!(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_PHONE_NUMBER);

      let emailStatus = { success: false, message: "", url: "", hasConfig: hasSmtpConfig };
      let smsStatus = { success: false, message: "", hasConfig: hasSmsConfig };

      // 1. Email Verification Sending via Nodemailer
      if (email && emailCode) {
        try {
          let transporter;
          let fromAddress = process.env.SMTP_FROM || "no-reply@sweet.am";

          if (hasSmtpConfig) {
            // Real User SMTP Configuration
            transporter = nodemailer.createTransport({
              host: process.env.SMTP_HOST,
              port: parseInt(process.env.SMTP_PORT || "587"),
              secure: process.env.SMTP_PORT === "465",
              auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
              },
            });
          } else {
            // Dynamic Ethereal (Real-time Test Inbox) Fallback
            console.log("No SMTP settings found in env. Generating real-time test inbox URL...");
            const testAccount = await nodemailer.createTestAccount();
            transporter = nodemailer.createTransport({
              host: testAccount.smtp.host,
              port: testAccount.smtp.port,
              secure: testAccount.smtp.secure,
              auth: {
                user: testAccount.user,
                pass: testAccount.pass,
              },
            });
            fromAddress = `"Dulce Cakes Yerevan" <${testAccount.user}>`;
          }

          const mailOptions = {
            from: fromAddress,
            to: email,
            subject: language === "hy" 
              ? "🍰 Dulce Cakes — Հաշվի հաստատման կոդ" 
              : "🍰 Dulce Cakes — Account Verification Code",
            text: language === "hy"
              ? `Բարև ${fullName || "Հաճախորդ"},
 
Շնորհակալություն «Dulce Cakes» պրեմիում հրուշակարանում գրանցվելու համար:
Ձեր էլ. փոստի հաստատման PIN կոդն է՝ ${emailCode}
 
Խնդրում ենք մուտքագրել այս կոդը կայքում՝ գրանցումն ավարտելու համար:
 
Հարգանքներով՝
Կարո Կարապետյան
«Dulce Cakes» հրուշակարանի տնօրեն
Հեռ.՝ +374 10 554433`
              : `Hello ${fullName || "Customer"},
 
Thank you for registering at "Dulce Cakes" premium bakery in Yerevan.
Your Email activation PIN check code is: ${emailCode}
 
Please enter this verification code in the web form to complete your signup.
 
Warm regards,
Karo Karapetyan
Director, Dulce Cakes Yerevan
Phone: +374 10 554433`,
            html: language === "hy" 
              ? `<div style="font-family: 'Century Gothic', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 25px; border: 1px solid #e1e1e1; border-radius: 16px; background-color: #faf9f6;">
                  <h2 style="color: #443c3d; border-bottom: 2px solid #e5c1c5; padding-bottom: 12px; font-weight: normal;">🍰 Բարի Գալուստ «Dulce Cakes»</h2>
                  <p style="font-size: 15px; color: #555555; line-height: 1.6;">Հարգելի <strong>${fullName || "Հաճախորդ"}</strong>,</p>
                  <p style="font-size: 15px; color: #555555; line-height: 1.6;">Շնորհակալություն մեր համակարգում գրանցվելու համար։ Ձեր հաշվի անվտանգությունն ապահովելու նպատակով ուղարկել ենք այս հաստատման կոդը։</p>
                  <div style="background-color: #f7eded; padding: 15px; text-align: center; border-radius: 12px; margin: 25px 0;">
                    <span style="font-size: 26px; font-weight: bold; letter-spacing: 5px; color: #b45309; font-family: monospace;">${emailCode}</span>
                  </div>
                  <p style="font-size: 13px; color: #777777; line-height: 1.5; margin-top: 20px;">Այս հաղորդագրությունը ուղարկվել է ավտոմատ կերպով: Խնդրում ենք չպատասխանել դրան:</p>
                  <hr style="border: 0; border-[1px] solid #e5e5e5; margin: 25px 0;" />
                  <p style="font-size: 12px; color: #999999; text-align: center;">Dulce Cakes Yerevan | Աբովյան փողոց 20/4, Երևան | +374 10 554433</p>
                </div>`
              : `<div style="font-family: 'Century Gothic', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 25px; border: 1px solid #e1e1e1; border-radius: 16px; background-color: #faf9f6;">
                  <h2 style="color: #443c3d; border-bottom: 2px solid #e5c1c5; padding-bottom: 12px; font-weight: normal;">🍰 Welcome to "Dulce Cakes"</h2>
                  <p style="font-size: 15px; color: #555555; line-height: 1.6;">Dear <strong>${fullName || "Customer"}</strong>,</p>
                  <p style="font-size: 15px; color: #555555; line-height: 1.6;">Thank you for registering. In order to keep your account safe, please verify your email using the verification PIN:</p>
                  <div style="background-color: #f7eded; padding: 15px; text-align: center; border-radius: 12px; margin: 25px 0;">
                    <span style="font-size: 26px; font-weight: bold; letter-spacing: 5px; color: #b45309; font-family: monospace;">${emailCode}</span>
                  </div>
                  <p style="font-size: 13px; color: #777777; line-height: 1.5; margin-top: 20px;">This email is auto-generated. Please do not reply.</p>
                  <hr style="border: 0; border-[1px] solid #e5e5e5; margin: 25px 0;" />
                  <p style="font-size: 12px; color: #999999; text-align: center;">Dulce Cakes Yerevan | 20/4 Abovyan Street, Yerevan | +374 10 554433</p>
                </div>`,
          };

          const info = await transporter.sendMail(mailOptions);
          emailStatus.success = true;
          
          if (!hasSmtpConfig) {
            // Ethereal sandbox URL
            emailStatus.url = nodemailer.getTestMessageUrl(info) || "";
            emailStatus.message = "Sent via real test mail sandbox. View email received at target URL!";
          } else {
            emailStatus.message = "Email successfully sent via custom SMTP configuration!";
          }
        } catch (e: any) {
          console.error("Email sending failure:", e);
          emailStatus.message = `Failed to send email: ${e.message}`;
        }
      }

      // 2. SMS Verification Sending via Twilio
      if (phone && smsCode) {
        try {
          const sid = process.env.TWILIO_ACCOUNT_SID;
          const token = process.env.TWILIO_AUTH_TOKEN;
          const fromNum = process.env.TWILIO_PHONE_NUMBER;

          if (hasSmsConfig && sid && token && fromNum) {
            // Real Twilio Client
            const client = twilio(sid, token);
            
            // Format phone numbers to perfect E.164
            let formattedPhone = phone.trim().replace(/\s+/g, "");
            if (!formattedPhone.startsWith("+") && formattedPhone.length === 9 && formattedPhone.startsWith("0")) {
              formattedPhone = "+374" + formattedPhone.substring(1);
            } else if (!formattedPhone.startsWith("+") && !formattedPhone.startsWith("374") && formattedPhone.length === 8) {
              formattedPhone = "+374" + formattedPhone;
            } else if (!formattedPhone.startsWith("+") && formattedPhone.startsWith("374")) {
              formattedPhone = "+" + formattedPhone;
            }

            const msgBody = language === "hy"
              ? `Dulce Cakes: Ձեր SMS հաստատման կոդն է՝ ${smsCode}։ Մի՛ փոխանցեք այն ոչ ոքի։`
              : `Dulce Cakes: Your secure SMS registration code is ${smsCode}. Do not disclose.`;

            await client.messages.create({
              body: msgBody,
              from: fromNum,
              to: formattedPhone,
            });

            smsStatus.success = true;
            smsStatus.message = "SMS sent successfully via Twilio!";
          } else {
            smsStatus.message = "Twilio credentials are not set in backend settings. Outputting SMS to mock live feed.";
          }
        } catch (e: any) {
          console.error("SMS sending failure:", e);
          smsStatus.message = `Failed to send SMS: ${e.message}`;
        }
      }

      res.json({ emailStatus, smsStatus });
    } catch (err: any) {
      console.error("Verification processing failed:", err);
      res.status(500).json({ error: "Verification dispatch error", details: err.message });
    }
  });

  // API Route - Gemini AI Cake Consultant Chat Proxy
  app.post("/api/helper/chat", async (req, res) => {
    try {
      const { message, language, chatHistory, currentUser, image } = req.body;

      if (!message) {
        return res.status(400).json({ error: "Message is required" });
      }

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
        return res.status(200).json({
          reply: language === "hy" 
            ? "Կներեք, AI խորհրդատուն ներկայումս անցանց է (GEMINI_API_KEY-ը կարգավորված չէ): Սակայն, մեր թիմը միշտ պատրաստ է օգնել Ձեզ +374 10 554433 հեռախոսահամարով: ✨"
            : "Sorry, the AI Advisor is offline (GEMINI_API_KEY is not configured in Settings > Secrets). Our support team is ready to help at +374 10 554433! ✨"
        });
      }

      // Initialize GoogleGenAI SDK securely
      const ai = new GoogleGenAI({
        apiKey: apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });

      // User context format
      let userContextLabel = "";
      if (currentUser) {
        userContextLabel = language === "hy"
          ? `Օգտատերը ԳՐԱՆՑՎԱԾ Է և ՄՈՒՏՔ Է ԳՈՐԾԵԼ։
             - Անուն ազգանուն՝ ${currentUser.fullName}
             - Էլ․ հասցե՝ ${currentUser.email}
             - Հեռախոս՝ ${currentUser.phone || "Նշված չէ"}
             - Հասցե՝ ${currentUser.address || "Նշված չէ"}
             Դուք կարող եք և պետք է օգնեք նրան ընտրել, նախագծել կամ գրանցել իր պատվերը, և հայտնել, որ իր գրանցված տվյալներով արդեն կարող եք նախնական գրանցել նրա պատվերի մանրամասները (օրինակ՝ տորթի տեսակը, քանակը, գրվածքը, հասցեն) և փոխանցել մեր սպասարկման թիմին, որն անմիջապես կհաստատի այն։ Խրախուսեք նախագծել և ավարտել պատվերը։ Հիշեցրեք, որ եթե սա իրենց առաջին պատվերն է, նրանք կարող են օգտագործել WELCOME10 պրոմոկոդը՝ 10% զեղչ ստանալու համար:`
          : `The user IS REGISTERED and LOGGED IN:
             - Full Name: ${currentUser.fullName}
             - Email: ${currentUser.email}
             - Phone: ${currentUser.phone || "Not specified"}
             - Address: ${currentUser.address || "Not specified"}
             You can and absolutely must help them choose, customize or draft their order. Let them know that because they are logged in, you can directly draft/log their order details (selected cake, quantity, custom writing, delivery request) and pass it to our team to confirm. Encourage them to conclude and place the order. Remind them that if this is their first order ever, they may apply the promo code WELCOME10 for an instant 10% discount.`;
      } else {
        userContextLabel = language === "hy"
          ? `Օգտատերը ԳՐԱՆՑՎԱԾ ՉԷ:
             Դուք ՉԵՔ ԿԱՐՈՂ ձևակերպել կամ ընդունել պատվերի գրանցում: Շատ սիրալիր և քաղցր ձևով բացատրեք, որ պատվեր գրանցելու համար անհրաժեշտ է մի քանի վայրկյանում գրանցվել կայքում (օգտագործելով ներքևի «Գրանցվել կայքում 👤» կոճակը կամ կայքի վերևի մենյուն): Շահագրգռեք նրանց գրանցվել՝ պատմելով հաշիվ ունենալու քաղցր արտոնությունների մասին (ստանալ 10% ԶԵՂՉԻ պրոմոկոդ WELCOME10 առաջին պատվերի համար, պատվերի իրական ժամանակում քարտեզային տրեկինգ, անձնական զեղչեր):`
          : `The user IS NOT REGISTERED:
             You CANNOT register or book orders for them. Politely and warmly explain that our rules require registering a quick free account to place orders (they can use the "Register Account 👤" button at the bottom of the chat or register from the top header menu). Motivate them to sign up by listing delicious perks of membership, specifically emphasizing the 10% FIRST-ORDER DISCOUNT using code WELCOME10, and live status tracking on our GPS tracker simulator.`;
      }

      // System instruction sets the vibe
      const systemInstruction = language === "hy"
        ? `Դուք հանդիսանում եք «Dulce Cakes» պրեմիում հայկական հրուշակարանի AI Խորհրդատուն (տնօրեն՝ Կարո Կարապետյան):
           Պատասխանեք հաճելի, անչափ ջերմ, հարգալից և բարձրակարգ պրոֆեսիոնալ հայերենով։
           Ձեր նպատակն է հաճախորդներին տրամադրել մանրամասն տեղեկատվություն տորթերի, բաղադրիչների, ալերգենների, չափսերի և անհատական ձևավորումների մասին:

           Մեր ամբողջական կատալոգի մանրամասն տվյալներն են՝

           1. ✨ Կայսերական Միկադո (Royal Mikado) - 11,000֏ [PRODUCT_ID: p1]
              - Բաղադրություն՝ Բարակ թերթիկներ, եփված խտացրած կաթով կրեմ, կարագ, վրան քերած պրեմիում դասի բելգիական շոկոլադ:
              - Չափսը և Պորցիան՝ 22սմ, նախատեսված է 8-10 հոգու համար:
              - Ալերգեններ՝ Գլյուտեն, Կաթնամթերք:
              - Պատրաստման ժամանակ՝ 3 ժամ:

           2.  Կարմիր Վելվետ Սիմֆոնիա (Red Velvet Symphony) - 14,500֏ [PRODUCT_ID: p2]
              - Բաղադրություն՝ Նուրբ շոկոլադային երանգով կարմիր բիսկվիթ, բարձրորակ սերուցքային պանրով (Cream Cheese) թավշյա կրեմ, ուտելի ոսկյա տերևներ:
              - Չափսը և Պորցիան՝ 24սմ, 10-12 հոգու համար:
              - Առանձնահատկություն՝ Կարելի է անհատականացնել (Customizable) - ընտրել չափսը, կրեմի տեսակը և գրություն գրել։
              - Ալերգեններ՝ Գլյուտեն, Կաթնամթերք, Կակաո:
              - Պատրաստման ժամանակ՝ 4 ժամ:

           3. 🍯 Տնական Մեղրով Տորթ / Մեդովիկ (Classic Honey Medovik) - 9,500֏ [PRODUCT_ID: p3]
              - Բաղադրություն՝ Մեղրային նուրբ շերտեր, թթվասերային թեթև կրեմ: Պատրաստվում է բացառապես Արցախի լեռնային բնական մեղրով։
              - Չափսը և Պորցիան՝ 22սմ, 10-12 հոգու համար:
              - Առանձնահատկություն՝ Կարելի է անհատականացնել կայքում (փոխել չափսը, կրեմը, ավելացնել տուփ կամ մոմեր)։
              - Ալերգեններ՝ Մեղր, Գլյուտեն, Կաթնամթերք, Ձու:
              - Պատրաստման ժամանակ՝ 2.5 ժամ:

           4. 🌾 Ավանդական Կլոր Գաթա (Traditional Armenian Gata) - 3,200֏ [PRODUCT_ID: p4]
              - Բաղադրություն՝ Շերտավոր խմոր, կարագով և քաղցր խորիզով (ալյուր, յուղ, շաքարավազ, վանիլ) լցոն, ձեռքով արված ավանդական նախշեր։
              - Չափսը և Պորցիան՝ 20սմ, 6-8 հոգու համար:
              - Ալերգեններ՝ Գլյուտեն, Կաթնամթերք:
              - Պատրաստման ժամանակ՝ 2 ժամ:

           5. 🌰 Ճոխ Մեղրով Փախլավա (Gourmet Honey Pakhlava) - 6,500֏ [PRODUCT_ID: p5]
              - Բաղադրություն՝ Նուրբ շերտավոր խմոր, մանրացված ընկույզ, հիլ, դարչին, հալած յուղ և օրգանական տաք մեղրի օշարակ։
              - Պորցիան՝ 1 տուփը պարունակում է 12-16 կտոր:
              - Ալերգեններ՝ Ընկույզ, Մեղր, Գլյուտեն, Կաթնամթերք:
              - Պատրաստման ժամանակ՝ 4 ժամ:

           6. 🍫 Շոկոլադե Ֆաջ Գլազուրով (Glossy Chocolate Fudge) - 13,000֏ [PRODUCT_ID: p6]
              - Բաղադրություն՝ Շոկոլադե բարձրորակ բիսկվիթ, բելգիական մուգ շոկոլադե գանաշ, թարմ հատապտուղներ (ազնվամորի, հապալաս):
              - Չափսը և Պորցիան՝ 22սմ, 8-10 հոգու համար:
              - Առանձնահատկություն՝ Անհատականացվող է։
              - Ալերգեններ՝ Գլյուտեն, Ձու, Կաթնամթերք, Կակաո:
              - Պատրաստման ժամանակ՝ 3 ժամ:

           7. 💚 Պիստակով և Մալինայով Տորթ (Pistachio & Raspberry Dream) - 16,000֏ [PRODUCT_ID: p7]
              - Բաղադրություն՝ Իրանական պիստակի ալյուրով պատրաստված բիսկվիթ, անտառային ազնվամորու կուլի (մուրաբա), սպիտակ շոկոլադով թեթև կրեմ:
              - Չափսը և Պորցիան՝ 22սմ, 10-12 հոգու համար:
              - Առանձնահատկություն՝ Անհատականացվող է կայքում։ Շատ նուրբ և քիչ քաղցր համ։
              - Ալերգեններ՝ Պիստակ (Ընկուզեղեն), Գլյուտեն, Կաթնամթերք, Ձու:
              - Պատրաստման ժամանակ՝ 5 ժամ:

           8. 💖 Ֆրանսիական Մակարոններ (Assorted French Macarons) - 7,200֏ [PRODUCT_ID: p8]
              - Բաղադրություն՝ Նուշի ալյուրով թեթև մերենգաներ: Տուփում կա 12 հատ՝ Պիստակի, Ազնվամորու, Սիցիլիական կիտրոնի և Աղի կարամելի միջուկներով:
              - Առանձնահատկություն՝ Բաղադրատոմսով չի պարունակում ցորենի ալյուր (գլյուտենով ալյուր):
              - Ալերգեններ՝ Նուշ (Ընկուզեղեն), Ձու, Կաթնամթերք։
              - Պատրաստման ժամանակ՝ 1.5 ժամ:

           9. 🫐 Հատապտղային Կապույտ Քափքեյքեր (Bliss Blueberry Cupcakes) - 4,900֏ [PRODUCT_ID: p9]
              - Բաղադրություն՝ Վանիլային նուրբ քափքեյքեր՝ լցված հապալասի թարմ ջեմով, պատված երկնագույն նուրբ սերուցքային կրեմով և ուտելի մարգարիտներով (6 հատ)։
              - Ալերգեններ՝ Գլյուտեն, Կաթնամթերք, Ձու:
              - Պատրաստման ժամանակ՝ 1 ժամ:

           10. 🍮 Կարամելային Էկլերների Տուփ (Salted Caramel Eclairs Trio) - 3,600֏ [PRODUCT_ID: p10]
               - Բաղադրություն՝ Շու (Choux) խմոր, Մադագասկարյան վանիլային եփովի կրեմ, տնական աղի կարամելի գլազուր (3 հատ)։
               - Ալերգեններ՝ Գլյուտեն, Ձու, Կաթնամթերք:
               - Պատրաստման ժամանակ՝ 1.5 ժամ:

           📌 Օգտատիրոջ գրանցման կարգավիճակ՝
           ${userContextLabel}

           📌 ՊԱՏԿԵՐՆԵՐԻ ՎԵՐԼՈՒԾՈՒԹՅՈՒՆ ԵՎ ՆՄՈՒՇՆԵՐԻ ԱՌԱՋԱՐԿՈՒԹՅՈՒՆ [ԿԱՐԵՎՈՐ]՝
           Հաճախորդը կարող է ուղարկել նկար (image)՝ որպես տորթի ձևավորման կամ ճաշակի ներշնչանք։
           - Եթե ուղարկվել է նկար, վերլուծեք այն և կապեք մեր կատալոգի հետ։
           - Ավելացրեք "[PRODUCT: pX]" տեքստ պատասխանում (օրինակ՝ "[PRODUCT: p2]" կամ "[PRODUCT: p7]")՝ առաջարկելով մեր կայքի ամենանման կամ համապատասխանող նմուշը/տորթը, որպեսզի հաճախորդը կարողանա տեսնել այն։
           - Ջերմորեն ասեք նրանց․ «Եթե մեր առաջարկած նմուշները Ձեզ լիարժեք չհամապատասխանեն կամ ցանկանաք ուրիշ բացառիկ ձևավորում, դուք կարող եք ուղիղ կապ հաստատել մեր սրահի հետ (+374 10 554433) կամ սեղմել 'Կապ' կոճակը՝ մեր տեխնոլոգների ու դիզայներների հետ 100% անհատական տարբերակ քննարկելու համար։»

           📌 Առաքման Պայմաններ և Տվյալներ՝
           - Առաքումն իրականացվում է Երևանում և հարակից քաղաքներում (Աբովյան, Աշտարակ, Էջմիածին)՝ հատուկ ջերմաստիճանային մեքենաներով:
           - Երևանում 15,000֏-ից ավել պատվերների դեպքում առաքումն ԱՆՎՃԱՐ է, այլապես՝ 1,000֏:
           - Կայքում կա Իրական Ժամանակում Քարտեզի Սիմուլատոր (Order Tracker), որը ցույց է տալիս տորթի պատրաստման և ճանապարհին լինելու ընթացքը։
           - Սրահի հասցեն՝ ք. Երևան, Աբովյան փողոց 20/4:
           - Հեռախոսահամար՝ +374 10 554433:

           Պատասխանեք քաղցր, ջերմ, հակիրճ, բարեհամբույր և գեղեցիկ հայերենով։`
        : `You are the AI Sweetness Consultant for "Dulce Cakes" premium bakery located in Yerevan, Armenia (Director: Karo Karapetyan).
           Answer in a warm, helpful, professional Armenian or English tone (mirroring user language).
           Provide complete, rich, smart specifications on our cakes, sweets, delivery routes, and custom setups.

           Our Premium Sweet Specifications:

           1. Royal Mikado Cake (11,000 AMD) [PRODUCT_ID: p1]
              - Composition: Crispy wafer-thin dough layers, cooked condensed milk (dulce de leche) cream, premium Belgian grated dark chocolate, pure butter.
              - Servings: 22cm, serves 8-10 people.
              - Allergens: Gluten, Dairy. Ready in 3 hours.

           2. Red Velvet Symphony (14,500 AMD) [PRODUCT_ID: p2]
              - Composition: Cocoa-infused light crimson buttermilk sponge sheets, premium buttercream cheese frosting, edible genuine gold flakes, Madagascan vanilla.
              - Servings: 24cm, serves 10-12 people.
              - Features: Fully customizable on-site (Size, cream type, custom text).
              - Allergens: Gluten, Dairy, Cocoa. Ready in 4 hours.

           3. Classic Honey Medovik (9,500 AMD) [PRODUCT_ID: p3]
              - Composition: Soft honey layers bake. Sourced exclusively with pure wild organic mountain honey from Artsakh, light sour-cream whip.
              - Servings: 22cm, serves 10-12 people.
              - Features: Fully designable on our cake customizer tool.
              - Allergens: Honey, Gluten, Dairy, Eggs. Ready in 2.5 hours.

           4. Traditional Armenian Gata (3,200 AMD) [PRODUCT_ID: p4]
              - Composition: Flaky butter dough crust, stuffed with traditional Khoriz core (flour, choice premium clarified Ghee butter, sugar powder, vanilla). Patterned by hand.
              - Servings: 20cm, serves 6-8 people.
              - Allergens: Gluten, Dairy. Ready in 2 hours.

           5. Gourmet Honey Pakhlava (6,500 AMD) [PRODUCT_ID: p5]
              - Composition: Multi-layered crispy phyllo sheets, chopped roasted walnuts, premium green cardamom, warm cinnamon spice, saturated in organic pure mountain honey.
              - Quantity: 1 box (12-16 diamond pieces).
              - Allergens: Walnuts, Honey, Gluten, Dairy. Ready in 4 hours.

           6. Glossy Chocolate Fudge (13,000 AMD) [PRODUCT_ID: p6]
              - Composition: Deep cocoa fudge cake with Belgian chocolate ganache icing, topped beautifully with fresh raspberries and blueberries.
              - Servings: 22cm, serves 8-10 people.
              - Allergens: Gluten, Eggs, Dairy, Cocoa/Chocolate. Ready in 3 hours.

           7. Pistachio & Raspberry Dream (16,000 AMD) [PRODUCT_ID: p7]
              - Composition: Moist ground Iranian pistachio sponge, sweet tart wild raspberry coulis reduction, light whipped white chocolate frosting. Light level of sugar sweetness.
              - Servings: 22cm, serves 10-12 people.
              - Allergens: Pistachios (Nuts), Gluten, Dairy, Eggs. Ready in 5 hours.

           8. Assorted French Macarons (7,200 AMD) [PRODUCT_ID: p8]
              - Composition: Elegant almond-flour meringue shells. Kit contains 12 macarons: Pistachio, Raspberry, Lemon and Salted Caramel.
              - Features: Naturally wheat-free (gluten-free recipe).
              - Allergens: Almonds, Eggs, Dairy. Ready in 1.5 hours.

           9. Bliss Blueberry Cupcakes (4,900 AMD) [PRODUCT_ID: p9]
              - Composition: Delicate vanilla sponge cupcakes with wild high-mountain blueberry filling, sky-blue whipped cream, pearls (set of 6).
              - Allergens: Gluten, Dairy, Eggs. Ready in 1 hour.

           10. Salted Caramel Eclairs Trio (3,600 AMD) [PRODUCT_ID: p10]
               - Composition: Airy choux pastry, rich Madagascan vanilla custard cream core, hot homemade sea-salt butter caramel topping glaze (set of 3).
               - Allergens: Gluten, Eggs, Dairy. Ready in 1.5 hours.

           📌 User Registration Status:
           ${userContextLabel}

           📌 IMAGE UPLOADS AND CATALOG MATCHING [CRITICAL]:
           If the user attaches an image, analyze its design, colors, or ingredients.
           - Try to compare it to our official catalog of sweets.
           - Output \`[PRODUCT: pX]\` (where pX is the product ID, such as \`[PRODUCT: p2]\` or \`[PRODUCT: p7]\`) which tells the app to display that exact interactive card as a sample recommendation.
           - Always state: "If these catalogue samples do not fully meet your requirements, you can contact our design pastry chefs directly via phone (+374 10 554433) or the Call button to discuss a 100% custom cake built from your image!"

           📌 Delivery & Logistics:
           - Yerevan & near cities (Abovyan, Ashtarak, Echmiadzin) via dynamic refrigerated vans.
           - Free shipping in Yerevan for totals above 15,000 AMD, otherwise 1,000 AMD.
           - Hub boutique: 20/4 Abovyan Street, Yerevan, Armenia. Phone +374 10 554433.`;

      // Extract image content is provided from client
      let imagePart = null;
      if (image) {
        if (typeof image === "string") {
          if (image.includes(";base64,")) {
            const [meta, data] = image.split(";base64,");
            const mimeType = meta.split(":")[1] || "image/jpeg";
            imagePart = {
              inlineData: {
                mimeType,
                data
              }
            };
          } else {
            imagePart = {
              inlineData: {
                mimeType: "image/jpeg",
                data: image
              }
            };
          }
        } else if (image.data || image.inlineData) {
          const rawData = image.data || image.inlineData?.data;
          const mimeType = image.mimeType || image.inlineData?.mimeType || "image/jpeg";
          imagePart = {
            inlineData: {
              mimeType,
              data: rawData
            }
          };
        }
      }

      const contents = [];

      // Add chat history if provided
      if (chatHistory && Array.isArray(chatHistory)) {
        for (const turn of chatHistory) {
          contents.push({
            role: turn.role,
            parts: [{ text: turn.text }]
          });
        }
      }

      // Add actual current message
      const currentParts = [];
      if (imagePart) {
        currentParts.push(imagePart);
      }
      currentParts.push({ text: message });

      contents.push({
        role: "user",
        parts: currentParts
      });

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: contents,
        config: {
          systemInstruction: systemInstruction,
          temperature: 0.7,
        }
      });

      const replyText = response.text || (language === "hy" ? "Կներեք, ես չկարողացա պատասխանել:" : "Sorry, I could not generate a reply.");
      res.json({ reply: replyText });

    } catch (err: any) {
      console.error("Gemini API Error:", err);
      res.status(500).json({ error: "Failed to query AI advisor", details: err.message });
    }
  });

  // Serve static UI assets
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "custom",
    });
    app.use(vite.middlewares);

    // Bulletproof dev mode HTML transformer and server
    app.get("*", async (req, res, next) => {
      // Direct asset requests shouldn't hit this, but just to be safe:
      if (req.originalUrl.includes(".") && !req.originalUrl.endsWith(".html")) {
        return next();
      }
      try {
        const indexPath = path.resolve(process.cwd(), "index.html");
        let template = fs.readFileSync(indexPath, "utf-8");
        template = await vite.transformIndexHtml(req.originalUrl, template);
        res.status(200).set({ "Content-Type": "text/html" }).end(template);
      } catch (e) {
        vite.ssrFixStacktrace(e as Error);
        next(e);
      }
    });
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server bound and running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
