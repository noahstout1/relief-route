import type { Language } from '../types';
import type { StringKey } from './en';

// Non-English UI strings. Missing keys fall back to English.
// These are drafts covering the most important screens and MUST be reviewed by native speakers
// before real-world use. Guidance content (src/data/guidance.json) is English-only for now.
type Table = Partial<Record<StringKey, string>>;

const bn: Table = {
  tagline: 'দুর্যোগের সময় কোথায় যাবেন এবং কী করবেন তা জানুন।',
  next: 'পরবর্তী', back: 'পেছনে', save: 'সংরক্ষণ', finish: 'আমার পরিকল্পনা তৈরি করুন', yes: 'হ্যাঁ', no: 'না',
  stepWhere: 'আপনি কোথায় থাকেন?', stepHousehold: 'আপনার সাথে কে থাকে?', stepHome: 'আপনার বাড়ি সম্পর্কে', stepContacts: 'জরুরি যোগাযোগ',
  country: 'দেশ', district: 'জেলা / এলাকা', language: 'ভাষা',
  tabHome: 'হোম', tabPlan: 'আমার পরিকল্পনা', tabHelp: 'সাহায্য', tabProfile: 'প্রোফাইল',
  hz_cyclone: 'ঘূর্ণিঝড়', hz_flood: 'বন্যা', hz_earthquake: 'ভূমিকম্প', hz_landslide: 'ভূমিধস', hz_tsunami: 'সুনামি',
  dec_evacuate: 'এখনই সরে যান', dec_get_ready: 'সরে যাওয়ার প্রস্তুতি নিন', dec_stay: 'থাকুন এবং প্রস্তুতি নিন', whyThis: 'কারণ',
  ph_prepare: 'এখনই প্রস্তুতি নিন', ph_evacuate: 'সতর্কবার্তা এলে', ph_during: 'চলাকালীন', ph_after: 'পরে',
  yourShelter: 'আপনার জন্য সেরা আশ্রয়কেন্দ্র', goBag: 'জরুরি ব্যাগের তালিকা', programsForYou: 'আপনার জন্য সহায়তা কর্মসূচি',
  directions: 'পথনির্দেশ', call: 'কল করুন', emergencyNumbers: 'জরুরি নম্বর', whatToDo: 'আমি কী করব?', liveAlerts: 'দুর্যোগ সতর্কবার্তা',
  shelters: 'কাছের আশ্রয়কেন্দ্র', agencies: 'সংস্থা ও প্রতিষ্ঠান',
  privacyNote: 'আপনার তথ্য শুধু এই ফোনেই থাকে। কখনো আপলোড করা হয় না।',
};

const tl: Table = {
  tagline: 'Alamin kung saan pupunta at ano ang gagawin kapag may sakuna.',
  next: 'Susunod', back: 'Bumalik', save: 'I-save', finish: 'Gawin ang aking plano', yes: 'Oo', no: 'Hindi',
  stepWhere: 'Saan ka nakatira?', stepHousehold: 'Sino ang kasama mo sa bahay?', stepHome: 'Tungkol sa iyong bahay', stepContacts: 'Mga emergency contact',
  country: 'Bansa', district: 'Lugar / probinsya', language: 'Wika',
  tabHome: 'Home', tabPlan: 'Aking plano', tabHelp: 'Tulong', tabProfile: 'Profile',
  hz_cyclone: 'Bagyo', hz_flood: 'Baha', hz_earthquake: 'Lindol', hz_landslide: 'Pagguho ng lupa', hz_tsunami: 'Tsunami',
  dec_evacuate: 'Lumikas na', dec_get_ready: 'Maghanda sa paglikas', dec_stay: 'Manatili at maghanda', whyThis: 'Bakit',
  ph_prepare: 'Maghanda ngayon', ph_evacuate: 'Kapag may babala', ph_during: 'Habang nangyayari', ph_after: 'Pagkatapos',
  yourShelter: 'Pinakamainam na evacuation center', goBag: 'Go-bag checklist', programsForYou: 'Mga programa para sa iyo',
  directions: 'Direksyon', call: 'Tumawag', emergencyNumbers: 'Mga emergency number', whatToDo: 'Ano ang dapat kong gawin?', liveAlerts: 'Mga babala ng sakuna',
  shelters: 'Mga evacuation center malapit sa iyo', agencies: 'Mga ahensya at organisasyon',
  privacyNote: 'Ang iyong impormasyon ay nasa teleponong ito lamang. Hindi ito ina-upload.',
};

const ht: Table = {
  tagline: 'Konnen ki kote pou ale ak sa pou fè lè gen dezas.',
  next: 'Swivan', back: 'Retounen', save: 'Anrejistre', finish: 'Kreye plan mwen', yes: 'Wi', no: 'Non',
  stepWhere: 'Ki kote ou rete?', stepHousehold: 'Ki moun ki rete avè w?', stepHome: 'Sou kay ou', stepContacts: 'Kontak dijans',
  country: 'Peyi', district: 'Zòn / komin', language: 'Lang',
  tabHome: 'Akèy', tabPlan: 'Plan mwen', tabHelp: 'Èd', tabProfile: 'Pwofil',
  hz_cyclone: 'Siklòn', hz_flood: 'Inondasyon', hz_earthquake: 'Tranblemanntè', hz_landslide: 'Glisman tè', hz_tsunami: 'Tsunami',
  dec_evacuate: 'Evakye kounye a', dec_get_ready: 'Pare pou kite kay la', dec_stay: 'Rete epi prepare', whyThis: 'Poukisa',
  ph_prepare: 'Prepare kounye a', ph_evacuate: 'Lè gen alèt', ph_during: 'Pandan', ph_after: 'Apre',
  yourShelter: 'Pi bon abri pou ou', goBag: 'Lis sak dijans', programsForYou: 'Pwogram pou ou',
  directions: 'Direksyon', call: 'Rele', emergencyNumbers: 'Nimewo dijans', whatToDo: 'Kisa pou m fè?', liveAlerts: 'Alèt dezas',
  shelters: 'Abri toupre w', agencies: 'Ajans ak òganizasyon',
  privacyNote: 'Enfòmasyon ou rete sou telefòn sa a sèlman. Yo pa janm voye l.',
};

const fr: Table = {
  tagline: 'Savoir où aller et quoi faire en cas de catastrophe.',
  next: 'Suivant', back: 'Retour', save: 'Enregistrer', finish: 'Créer mon plan', yes: 'Oui', no: 'Non',
  stepWhere: 'Où habitez-vous ?', stepHousehold: 'Qui vit avec vous ?', stepHome: 'Votre logement', stepContacts: "Contacts d'urgence",
  country: 'Pays', district: 'Zone / commune', language: 'Langue',
  tabHome: 'Accueil', tabPlan: 'Mon plan', tabHelp: 'Aide', tabProfile: 'Profil',
  hz_cyclone: 'Cyclone / ouragan', hz_flood: 'Inondation', hz_earthquake: 'Séisme', hz_landslide: 'Glissement de terrain', hz_tsunami: 'Tsunami',
  dec_evacuate: 'Évacuez', dec_get_ready: 'Préparez-vous à partir', dec_stay: 'Restez et préparez-vous', whyThis: 'Pourquoi',
  ph_prepare: 'Préparez-vous maintenant', ph_evacuate: "En cas d'alerte", ph_during: 'Pendant', ph_after: 'Après',
  yourShelter: 'Votre meilleur abri', goBag: "Liste du sac d'urgence", programsForYou: 'Programmes pour vous',
  directions: 'Itinéraire', call: 'Appeler', emergencyNumbers: "Numéros d'urgence", whatToDo: 'Que dois-je faire ?', liveAlerts: 'Alertes catastrophes',
  shelters: 'Abris près de chez vous', agencies: 'Agences et organisations',
  privacyNote: 'Vos informations restent sur ce téléphone. Elles ne sont jamais envoyées.',
};

const pt: Table = {
  tagline: 'Saiba para onde ir e o que fazer quando acontece um desastre.',
  next: 'Seguinte', back: 'Voltar', save: 'Guardar', finish: 'Criar o meu plano', yes: 'Sim', no: 'Não',
  stepWhere: 'Onde vive?', stepHousehold: 'Quem vive consigo?', stepHome: 'Sobre a sua casa', stepContacts: 'Contactos de emergência',
  country: 'País', district: 'Distrito / zona', language: 'Língua',
  tabHome: 'Início', tabPlan: 'O meu plano', tabHelp: 'Ajuda', tabProfile: 'Perfil',
  hz_cyclone: 'Ciclone', hz_flood: 'Cheia / inundação', hz_earthquake: 'Sismo', hz_landslide: 'Deslizamento de terra', hz_tsunami: 'Tsunami',
  dec_evacuate: 'Evacue agora', dec_get_ready: 'Prepare-se para sair', dec_stay: 'Fique e prepare-se', whyThis: 'Porquê',
  ph_prepare: 'Prepare-se agora', ph_evacuate: 'Quando houver alerta', ph_during: 'Durante', ph_after: 'Depois',
  yourShelter: 'O melhor centro de acomodação', goBag: 'Lista da mochila de emergência', programsForYou: 'Programas para si',
  directions: 'Direções', call: 'Ligar', emergencyNumbers: 'Números de emergência', whatToDo: 'O que devo fazer?', liveAlerts: 'Alertas de desastres',
  shelters: 'Centros de acomodação perto de si', agencies: 'Agências e organizações',
  privacyNote: 'A sua informação fica apenas neste telefone. Nunca é enviada.',
};

const ne: Table = {
  tagline: 'विपद् आउँदा कहाँ जाने र के गर्ने थाहा पाउनुहोस्।',
  next: 'अर्को', back: 'पछाडि', save: 'सुरक्षित गर्नुहोस्', finish: 'मेरो योजना बनाउनुहोस्', yes: 'हो', no: 'होइन',
  stepWhere: 'तपाईं कहाँ बस्नुहुन्छ?', stepHousehold: 'तपाईंसँग को बस्छन्?', stepHome: 'तपाईंको घरबारे', stepContacts: 'आपतकालीन सम्पर्क',
  country: 'देश', district: 'जिल्ला / क्षेत्र', language: 'भाषा',
  tabHome: 'गृह', tabPlan: 'मेरो योजना', tabHelp: 'सहायता', tabProfile: 'प्रोफाइल',
  hz_cyclone: 'चक्रवात', hz_flood: 'बाढी', hz_earthquake: 'भूकम्प', hz_landslide: 'पहिरो', hz_tsunami: 'सुनामी',
  dec_evacuate: 'अहिले नै सर्नुहोस्', dec_get_ready: 'सर्न तयार हुनुहोस्', dec_stay: 'बस्नुहोस् र तयारी गर्नुहोस्', whyThis: 'किन',
  ph_prepare: 'अहिले तयारी गर्नुहोस्', ph_evacuate: 'चेतावनी आएपछि', ph_during: 'घटनाको बेला', ph_after: 'पछि',
  yourShelter: 'तपाईंको लागि उत्तम आश्रयस्थल', goBag: 'आपतकालीन झोला सूची', programsForYou: 'तपाईंका लागि कार्यक्रमहरू',
  directions: 'बाटो', call: 'फोन गर्नुहोस्', emergencyNumbers: 'आपतकालीन नम्बर', whatToDo: 'मैले के गर्ने?', liveAlerts: 'विपद् चेतावनी',
  shelters: 'नजिकका आश्रयस्थल', agencies: 'निकाय र संस्थाहरू',
  privacyNote: 'तपाईंको जानकारी यही फोनमा मात्र रहन्छ। कहिल्यै अपलोड गरिँदैन।',
};

export const partial: Partial<Record<Language, Table>> = { bn, tl, ht, fr, pt, ne };
