import React,{useState,useEffect,useRef,useMemo,useCallback} from 'react';
import {createRoot} from 'react-dom/client';
import './styles.css';
import {useBackend} from './backend.js';

const QUOTES=[
  {q:"Marriage is not about finding the right person, but creating the right relationship.",a:"— Unknown"},
  {q:"A successful marriage requires falling in love many times, always with the same person.",a:"— Mignon McLaughlin"},
  {q:"The best thing to hold onto in life is each other.",a:"— Audrey Hepburn"},
  {q:"In all the world, there is no heart for me like yours.",a:"— Maya Angelou"},
  {q:"A great marriage is not when the 'perfect couple' comes together, but when an imperfect couple learns to enjoy their differences.",a:"— Dave Meurer"}
];

const RELIGION_FIELDS={
  Hindu:{fields:[
    {key:"gotra",label:"Gotra",type:"text",placeholder:"e.g. Bharadwaja"},
    {key:"caste",label:"Caste",type:"text",placeholder:"e.g. Brahmin"},
    {key:"subCaste",label:"Sub-Caste",type:"text",placeholder:"Optional"},
    {key:"manglik",label:"Manglik Status",type:"select",options:["Non-Manglik","Manglik","Anshik Manglik"]},
    {key:"rashi",label:"Rashi (Moon Sign)",type:"select",options:["Mesha","Vrishabha","Mithuna","Karka","Simha","Kanya","Tula","Vrishchika","Dhanu","Makara","Kumbha","Meena"]},
    {key:"nakshatra",label:"Nakshatra",type:"text",placeholder:"e.g. Rohini"},
    {key:"kuldevta",label:"Kuldevta",type:"text",placeholder:"Family deity"},
  ]},
  Muslim:{fields:[
    {key:"sect",label:"Sect",type:"select",options:["Sunni","Shia","Ahmadiyya","Ismaili","Other"]},
    {key:"maslak",label:"Maslak",type:"text",placeholder:"e.g. Hanafi, Deobandi"},
    {key:"namaz",label:"Namaz Regularity",type:"select",options:["5 Times Daily","3 Times Daily","Occasionally","Fridays Only","Not Regular"]},
  ]},
  Christian:{fields:[
    {key:"denomination",label:"Denomination",type:"select",options:["Roman Catholic","Protestant","Anglican","Orthodox","Baptist","Methodist","Evangelical","Other"]},
    {key:"baptism",label:"Baptism Status",type:"select",options:["Baptised","Not Baptised"]},
    {key:"church",label:"Church/Parish",type:"text",placeholder:"Name of church"},
  ]},
  Sikh:{fields:[
    {key:"gursikh",label:"Gursikh / Amritdhari",type:"select",options:["Amritdhari","Gursikh","Sehajdhari","Mona"]},
    {key:"sikhCaste",label:"Sikh Caste",type:"select",options:["Jatt","Ramgarhia","Khatri","Arora","Saini","Lubana","Other"]},
    {key:"rehat",label:"Follows Rehat Maryada",type:"select",options:["Yes","No","Partially"]},
  ]},
  Jain:{fields:[
    {key:"sect",label:"Sect",type:"select",options:["Digambar","Shwetambar","Sthanakvasi","Terapanthi"]},
    {key:"tirthankar",label:"Primary Tirthankar",type:"text",placeholder:"e.g. Mahavira"},
    {key:"dietary",label:"Dietary Restrictions",type:"text",placeholder:"e.g. No root vegetables"},
  ]},
  Parsi:{fields:[
    {key:"lineage",label:"Parsi-Zoroastrian Lineage",type:"text",placeholder:"Paternal lineage"},
    {key:"athornan",label:"Athornan (Priestly Class)",type:"select",options:["Yes","No"]},
    {key:"navjote",label:"Navjote Performed",type:"select",options:["Yes","No"]},
  ]},
  Buddhist:{fields:[
    {key:"tradition",label:"Buddhist Tradition",type:"select",options:["Theravada","Mahayana","Vajrayana","Zen","Tibetan","Other"]},
    {key:"ordination",label:"Ordination Status",type:"select",options:["Lay Practitioner","Novice","Fully Ordained","Not Applicable"]},
  ]},
  Jewish:{fields:[
    {key:"denomination",label:"Denomination",type:"select",options:["Orthodox","Conservative","Reform","Reconstructionist","Secular"]},
    {key:"synagogue",label:"Synagogue",type:"text",placeholder:"Name of synagogue"},
    {key:"bar_bat",label:"Bar/Bat Mitzvah",type:"select",options:["Yes","No"]},
  ]},
  Other:{fields:[{key:"religionDetail",label:"Religion Details",type:"textarea",placeholder:"Please specify your religion and practices"}]}
};

const PROFESSIONS=["Software Engineer","Data Engineer","Doctor (MBBS)","Doctor (MD/MS)","Chartered Accountant","Civil Services (IAS/IPS)","Lawyer","Architect","Professor / Academic","Business Owner","Financial Analyst","Designer (UI/UX)","Marketing Professional","Journalist","Teacher","Chef","Researcher","Pharmacist","Dentist","Other"];
const CITIES=["Mumbai","Delhi","Bangalore","Hyderabad","Chennai","Pune","Kolkata","Jaipur","Ahmedabad","Surat","Lucknow","Chandigarh","Kochi","Bhopal","Indore","Nagpur","Visakhapatnam","Coimbatore","Outside India","Other"];
const DEGREES=["B.Tech/B.E","MBBS","B.Com","B.Sc","BA","BCA","B.Arch","M.Tech/M.E","MBA","MS","M.Sc","MD/MS (Medical)","CA","LLB/LLM","PhD","Diploma","Other"];
const INCOME_RANGES=["Below ₹5 LPA","₹5–10 LPA","₹10–20 LPA","₹20–35 LPA","₹35–50 LPA","₹50–75 LPA","₹75L–1 Cr+","Prefer not to say"];
const HEIGHTS=[];for(let i=145;i<=195;i+=1)HEIGHTS.push(i+"cm");

const RELIGIONS=["Hindu","Muslim","Christian","Sikh","Jain","Buddhist","Parsi","Jewish","Other"];
const RELIGION_COLORS={Hindu:"#c9783a",Muslim:"#2d6a4f",Christian:"#3a6ac9",Sikh:"#c9a83a",Jain:"#a83ac9",Buddhist:"#c9b83a",Parsi:"#3ab8c9",Jewish:"#6a6ac9",Other:"#888"};

const SAMPLE_PROFILES=[
  {id:1,name:"Ananya Sharma",age:27,height:"162cm",religion:"Hindu",caste:"Brahmin",gotra:"Bharadwaja",rashi:"Kanya",nakshatra:"Chitra",profession:"Software Engineer",company:"Google",degree:"B.Tech Computer Science, IIT Bombay",income:"₹50–75 LPA",city:"Bangalore",marital:"Never Married",diet:"Vegetarian",about:"I believe in the magic of quiet mornings with chai and a good book, and the energy of dancing to old Bollywood songs at midnight. As an engineer by profession and a dreamer by nature, I look for depth in conversations and laughter in ordinary moments. My family is my anchor — we're a close-knit Brahmin household from Jaipur. I seek a partner who balances ambition with humility, and who knows that home isn't a place but the person you build it with.",hobbies:["Reading","Hiking","Classical Dance","Cooking"],langs:["Hindi","English","Kannada"],smoking:"No",drinking:"No",familyType:"Nuclear",siblings:"1 Sister",fatherOcc:"Retired IAS Officer",motherOcc:"Homemaker",partnerPrefs:{minAge:27,maxAge:33,religions:["Hindu"],minHeight:"170cm",education:"Post-Graduate"},photos:"AS",color:"#c9783a",verified:true,featured:true},
  {id:2,name:"Arjun Mehta",age:30,height:"178cm",religion:"Hindu",caste:"Khatri",gotra:"Shandilya",rashi:"Vrishabha",nakshatra:"Rohini",profession:"Chartered Accountant",company:"Deloitte India",degree:"CA Final, B.Com (Hons) Delhi University",income:"₹20–35 LPA",city:"Delhi",marital:"Never Married",diet:"Vegetarian",about:"Finance is my profession, but philosophy is my passion. I spend weekends at the Lodhi Garden thinking about ancient texts — the Gita taught me that action without attachment is the highest wisdom. I come from a joint family in Delhi where Sunday lunches are a production and cricket arguments never end. I'm looking for someone grounded, intellectually curious, and who can hold their own in a debate about Rumi vs Kabir. Bonus if you love Mughal architecture.",hobbies:["Chess","Photography","Yoga","Travelling"],langs:["Hindi","English","Punjabi"],smoking:"No",drinking:"Occasionally",familyType:"Joint",siblings:"1 Brother, 1 Sister",fatherOcc:"Business",motherOcc:"Teacher",partnerPrefs:{minAge:26,maxAge:30,religions:["Hindu"],minHeight:"155cm",education:"Graduate+"},photos:"AM",color:"#c9783a",verified:true},
  {id:3,name:"Priya Thomas",age:28,height:"160cm",religion:"Christian",denomination:"Roman Catholic",church:"Sacred Heart Parish, Chennai",profession:"Doctor (MBBS)",company:"Apollo Hospitals",degree:"MBBS, MD Internal Medicine",income:"₹20–35 LPA",city:"Chennai",marital:"Never Married",diet:"Non-Vegetarian",about:"Healing people isn't just what I do — it's who I am. Twelve-hour hospital shifts have taught me that life is fragile and love is urgent. Between ICU rounds and Sunday Mass, I find peace in long beach walks at Marina and old Tamil film music. My family is Keralite-Tamil, warm to the point of overwhelming. I want someone who takes their career seriously but never takes themselves too seriously — someone who can make me laugh after a hard night on call.",hobbies:["Swimming","Church Music","Cooking","Reading Medical Journals"],langs:["Tamil","English","Malayalam"],smoking:"No",drinking:"No",familyType:"Nuclear",siblings:"1 Brother",fatherOcc:"Retired Bank Manager",motherOcc:"Nurse",partnerPrefs:{minAge:28,maxAge:35,religions:["Christian"],minHeight:"168cm",education:"Post-Graduate"},photos:"PT",color:"#3a6ac9",verified:true},
  {id:4,name:"Harpreet Singh",age:32,height:"183cm",religion:"Sikh",gursikh:"Amritdhari",sikhCaste:"Jatt",rehat:"Yes",profession:"Business Owner",company:"Singh Agro Exports",degree:"MBA Finance, MDI Gurgaon",income:"₹75L–1 Cr+",city:"Chandigarh",marital:"Never Married",diet:"Non-Vegetarian",about:"Our family has farmed Punjab's soil for five generations and now exports to twenty countries. I grew up watching my father build something from nothing, so I respect hard work over inheritance. Evenings in Chandigarh are best spent at Sukhna Lake watching the sun disappear behind the Shivaliks. I'm Amritdhari and my faith is central to my life — I look for someone who respects that even if they walk their own spiritual path. Laughter, loyalty, and an ability to eat unlimited sarson da saag are non-negotiables.",hobbies:["Kabaddi","Gurmat Sangeet","Horse Riding","Business Travel"],langs:["Punjabi","Hindi","English"],smoking:"No",drinking:"No",familyType:"Joint",siblings:"2 Brothers",fatherOcc:"Farmer & Exporter",motherOcc:"Homemaker",partnerPrefs:{minAge:26,maxAge:32,religions:["Sikh"],minHeight:"155cm",education:"Graduate+"},photos:"HS",color:"#c9a83a",verified:true},
  {id:5,name:"Zara Khan",age:26,height:"163cm",religion:"Muslim",sect:"Sunni",maslak:"Hanafi",namaz:"5 Times Daily",profession:"Designer (UI/UX)",company:"Razorpay",degree:"B.Des, NID Ahmedabad",income:"₹20–35 LPA",city:"Mumbai",marital:"Never Married",diet:"Non-Vegetarian",about:"I design things for a living and wonder about things always. There's something about Mumbai at 2am — the city never pretends to be anything other than exactly what it is. I pray five times a day and I paint on weekends; both feel like the same conversation with something larger than me. My family is originally from Lucknow, which means we take tehzeeb and biryani equally seriously. I'm searching for a partner with curiosity, kindness, and strong opinions about fonts.",hobbies:["Painting","Street Food Hunting","Calligraphy","Football"],langs:["Urdu","Hindi","English"],smoking:"No",drinking:"No",familyType:"Nuclear",siblings:"1 Sister",fatherOcc:"Architect",motherOcc:"Urdu Teacher",partnerPrefs:{minAge:26,maxAge:32,religions:["Muslim"],minHeight:"170cm",education:"Graduate+"},photos:"ZK",color:"#2d6a4f",verified:true},
  {id:6,name:"Rahul Joshi",age:34,height:"176cm",religion:"Hindu",caste:"Brahmin",gotra:"Kashyapa",rashi:"Simha",nakshatra:"Uttara Phalguni",profession:"Professor / Academic",company:"IIT Hyderabad",degree:"PhD Computer Science, University of Toronto",income:"₹20–35 LPA",city:"Hyderabad",marital:"Divorced",diet:"Vegetarian",about:"Academia chose me as much as I chose it — I was the child who read encyclopaedias for fun. After a brief marriage that ended mutually and respectfully, I believe in second chapters. I teach AI and philosophy of mind; my students say I'm the only professor who starts lectures by citing both Turing and the Upanishads. I hike in Araku Valley on weekends and grow tomatoes on my balcony. I want someone secure in themselves, patient with complexity, and unbothered by the fact that I will correct your grammar.",hobbies:["Research","Mountain Hiking","Growing Plants","Classical Music"],langs:["Hindi","English","Telugu (Basic)"],smoking:"No",drinking:"Occasionally",familyType:"Nuclear",siblings:"1 Brother",fatherOcc:"Journalist",motherOcc:"Doctor",partnerPrefs:{minAge:28,maxAge:38,religions:["Any"],minHeight:"155cm",education:"Post-Graduate"},photos:"RJ",color:"#c9783a",verified:true},
  {id:7,name:"Meera Subramaniam",age:29,height:"158cm",religion:"Hindu",caste:"Iyengar",gotra:"Atreya",rashi:"Meena",nakshatra:"Revati",profession:"Lawyer",company:"AZB & Partners",degree:"B.A. LL.B (Hons), NLSIU Bangalore",income:"₹35–50 LPA",city:"Bangalore",marital:"Never Married",diet:"Vegetarian",about:"I argue for a living and I'm very good at it. Corporate law is exhilarating and exhausting in equal measure; I balance it with Bharatanatyam practice three times a week and obsessive re-reads of Agatha Christie. I'm Tamil Iyengar — our family's rules about food could fill a constitution, but we'd feed you like royalty. I want someone who understands that my career isn't a phase but a calling, who thinks complex women are interesting rather than intimidating.",hobbies:["Bharatanatyam","Reading Crime Fiction","Cooking South Indian","Moot Court Coaching"],langs:["Tamil","English","Kannada","Hindi"],smoking:"No",drinking:"No",familyType:"Nuclear",siblings:"0",fatherOcc:"Judge (Retired)",motherOcc:"Professor",partnerPrefs:{minAge:29,maxAge:36,religions:["Hindu"],minHeight:"170cm",education:"Post-Graduate"},photos:"MS",color:"#c9783a",verified:true},
  {id:8,name:"Rohan Kapoor",age:31,height:"180cm",religion:"Hindu",caste:"Arora",gotra:"Vashishtha",rashi:"Karka",nakshatra:"Pushya",profession:"Business Owner",company:"KapoorKitchen Foods",degree:"B.Com, Delhi University + Culinary Institute",income:"₹50–75 LPA",city:"Pune",marital:"Never Married",diet:"Non-Vegetarian",about:"I left investment banking to follow the smell of my grandmother's kitchen, and I've never looked back. KapoorKitchen now has three restaurants in Pune and we're expanding. I believe food is memory — every dish I make is a letter to someone I love. Weekends mean farmers markets, recipe testing, and very loud family cricket matches. I travel to eat, not to Instagram. Looking for someone who values warmth over status, good conversation over good appearances, and who genuinely wants to build something — a home, a business, a life.",hobbies:["Cooking","Cricket","Travelling (Food Tourism)","Photography"],langs:["Hindi","English","Marathi (Learning)"],smoking:"No",drinking:"Socially",familyType:"Joint",siblings:"2 Sisters",fatherOcc:"Retired Banker",motherOcc:"Home Chef",partnerPrefs:{minAge:26,maxAge:32,religions:["Hindu","Sikh"],minHeight:"155cm",education:"Graduate+"},photos:"RK",color:"#c9783a",verified:true},
  {id:9,name:"Nadia Fernandes",age:25,height:"165cm",religion:"Christian",denomination:"Protestant",church:"New Life Assembly, Goa",profession:"Marketing Professional",company:"Zomato",degree:"BMS Marketing, Mumbai University",income:"₹10–20 LPA",city:"Mumbai",marital:"Never Married",diet:"Non-Vegetarian",about:"I grew up in Goa where life moves slower and the sunsets are always worth stopping for. Marketing found me when I realized I could talk about things I love all day. At Zomato I've run campaigns that reached thirty million people, which still amazes me. I sing in my church choir every Sunday, which is the only appointment I never miss. I'm practical about life but romantic about love — I believe in growing with someone, not just growing alongside them.",hobbies:["Singing","Beach Volleyball","Travel","Social Media Content"],langs:["English","Konkani","Hindi","Portuguese (Basic)"],smoking:"No",drinking:"Occasionally",familyType:"Nuclear",siblings:"1 Brother",fatherOcc:"Fisherman (Business Owner)",motherOcc:"School Principal",partnerPrefs:{minAge:25,maxAge:32,religions:["Christian","Any Open-Minded"],minHeight:"168cm",education:"Graduate+"},photos:"NF",color:"#3a6ac9",verified:true},
  {id:10,name:"Vikram Agarwal",age:33,height:"175cm",religion:"Jain",sect:"Shwetambar",dietary:"No root vegetables, strictly vegetarian",profession:"Financial Analyst",company:"Goldman Sachs Mumbai",degree:"B.Tech + MBA (Finance), IIM Ahmedabad",income:"₹75L–1 Cr+",city:"Mumbai",marital:"Never Married",diet:"Vegan",about:"Numbers are my language, meditation is my anchor. Jainism taught me ahimsa — non-violence extends to how I treat people, my investments, and the planet. I manage a sustainable investment portfolio and genuinely believe you can do well by doing good. I wake at 5am for Samayik, and I'm usually asleep by 10:30. Early riser, yes; boring, I hope not. I read three books simultaneously, debate loudly about economics, and make an excellent thepla. I want a partner who's as intentional about life as I am.",hobbies:["Meditation","Chess","Sustainable Investing","Trekking"],langs:["Gujarati","Hindi","English"],smoking:"No",drinking:"No",familyType:"Joint",siblings:"1 Sister",fatherOcc:"Diamond Merchant",motherOcc:"Social Worker",partnerPrefs:{minAge:27,maxAge:33,religions:["Jain","Hindu"],minHeight:"155cm",education:"Post-Graduate"},photos:"VA",color:"#a83ac9",verified:true},
  {id:11,name:"Kavya Reddy",age:26,height:"161cm",religion:"Hindu",caste:"Kamma",gotra:"Kaundilya",rashi:"Dhanu",nakshatra:"Mula",profession:"Civil Services (IAS/IPS)",company:"Government of Telangana",degree:"BA Political Science + UPSC AIR 47",income:"₹10–20 LPA",city:"Hyderabad",marital:"Never Married",diet:"Non-Vegetarian",about:"I cracked UPSC on my second attempt at 25, and the first person I called was my grandmother who always said public service is worship. As a sub-collector in Nalgonda district, I travel to villages, solve land disputes, and fall asleep thinking about water pipelines. It's the hardest and most meaningful thing I've ever done. I come from a political family — strong opinions are our love language. I want someone secure enough to not be threatened by what I do, curious enough to discuss policy over dinner.",hobbies:["Running","Telugu Literature","Debating","District Field Visits"],langs:["Telugu","Hindi","English"],smoking:"No",drinking:"No",familyType:"Joint",siblings:"1 Brother",fatherOcc:"MLA (Politician)",motherOcc:"Homemaker",partnerPrefs:{minAge:27,maxAge:35,religions:["Hindu"],minHeight:"168cm",education:"Graduate+"},photos:"KR",color:"#c9783a",verified:true},
  {id:12,name:"Aarav Singhania",age:29,height:"177cm",religion:"Hindu",caste:"Marwari",gotra:"Gautama",rashi:"Vrishabha",nakshatra:"Mrigashira",profession:"Business Owner",company:"Singhania Textiles Group",degree:"B.Com, SRCC + Family Business Training",income:"₹75L–1 Cr+",city:"Kolkata",marital:"Never Married",diet:"Vegetarian",about:"There's a saying in our family: cloth is memory, and we've woven four generations of it. Singhania Textiles started with my great-grandfather's handloom in Rajasthan and we now export to twenty-three countries from Kolkata. I'm proud of the legacy but more interested in building its next chapter — sustainable fashion, artisan partnerships, direct trade. I love Rabindra Sangeet, which surprises people from outside Bengal. I visit Jaipur four times a year and call both cities home. I want someone who understands that family and ambition aren't in conflict.",hobbies:["Rabindra Sangeet","Textile Art","Business Travel","Philanthropy"],langs:["Hindi","Bengali","English","Marwari"],smoking:"No",drinking:"No",familyType:"Joint",siblings:"1 Brother",fatherOcc:"Chairman, Singhania Textiles",motherOcc:"Social Entrepreneur",partnerPrefs:{minAge:24,maxAge:30,religions:["Hindu","Jain"],minHeight:"155cm",education:"Graduate+"},photos:"AS2",color:"#c9783a",verified:true},
];

const TESTIMONIALS=[
  {quote:"We matched on Vivah and I knew from the first conversation that this was different. Six months later he proposed at the exact coffee shop I'd mentioned in my 'About Me'. We got married last February.",names:"Pooja & Siddharth",city:"Bangalore • Married Feb 2025"},
  {quote:"I was skeptical about matrimonial sites after two disappointing experiences elsewhere. Vivah's detailed profiles meant I could find someone aligned in faith, family values, and life direction. Alhamdulillah.",names:"Zoya & Imran",city:"Hyderabad • Married Nov 2024"},
  {quote:"As an NRI coming back to India, I was worried about cultural gaps. Vivah's community-specific fields helped us verify real compatibility before the first phone call. We're now planning our wedding.",names:"Preethi & Karthik",city:"Chennai & San Jose • Engaged 2026"},
  {quote:"The biodata builder helped me articulate who I actually am instead of the generic template my relatives handed me. That honesty attracted Rahul — he said my 'About Me' read like a letter to him.",names:"Divya & Rahul",city:"Mumbai • Married Aug 2025"},
];

function computeCompat(profileA,profileB){
  let score=50;
  if(profileA.religion===profileB.religion)score+=25;
  const ageDiff=Math.abs((profileA.age||0)-(profileB.age||0));
  if(ageDiff<=4)score+=10;else if(ageDiff<=7)score+=5;
  if(profileA.diet===profileB.diet)score+=8;
  if(profileA.familyType===profileB.familyType)score+=7;
  return Math.min(99,score);
}

function Avatar({initials,color,size=56,photoUrl}){
  const bg=color||"#b5485a";
  if(photoUrl)return React.createElement("div",{style:{width:size,height:size,borderRadius:"50%",overflow:"hidden",border:"3px solid rgba(255,255,255,.6)",boxShadow:"0 2px 8px rgba(0,0,0,.15)",flexShrink:0,background:bg}},
    React.createElement("img",{src:photoUrl,alt:"",style:{width:"100%",height:"100%",objectFit:"cover"},onError:e=>{e.target.style.display="none";}}));
  return React.createElement("div",{style:{width:size,height:size,borderRadius:"50%",background:`linear-gradient(135deg,${bg},${bg}cc)`,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontFamily:"var(--serif)",fontSize:size*.28,fontWeight:600,border:"3px solid rgba(255,255,255,.6)",boxShadow:"0 2px 8px rgba(0,0,0,.15)",flexShrink:0}},initials);
}

function Toast({msg,type,onDone}){
  useEffect(()=>{const t=setTimeout(onDone,3200);return()=>clearTimeout(t)},[]);
  const icons={success:"✓",info:"ℹ",error:"✕"};
  return React.createElement("div",{className:`toast ${type}`},icons[type]||"ℹ",msg);
}

function Confetti(){
  const colors=["#b5485a","#c9973a","#2d6a4f","#f0d9a8","#e8b4bc","#fff"];
  const pieces=Array.from({length:60},(_,i)=>({
    id:i,color:colors[i%colors.length],
    left:Math.random()*100,delay:Math.random()*1.5,
    duration:2+Math.random()*2,size:6+Math.random()*6
  }));
  return React.createElement(React.Fragment,null,...pieces.map(p=>
    React.createElement("div",{key:p.id,className:"confetti-piece",style:{
      left:`${p.left}%`,background:p.color,width:p.size,height:p.size,
      animationDuration:`${p.duration}s`,animationDelay:`${p.delay}s`
    }})
  ));
}

const h=React.createElement;
const pid=p=>String(p.id);
const initialsOf=n=>(n||"?").trim().split(/\s+/).map(w=>w[0]).slice(0,2).join("").toUpperCase();
const CONTACT_KEYS=["contactName","contactPhone","contactEmail","phonePrivacy","emailPrivacy","photoPref"];

function fromMember(d){
  return {...d,id:"m_"+d._uid,member:true,photos:initialsOf(d.name),photoUrl:d.photoUrl||null,color:RELIGION_COLORS[d.religion]||"#b5485a",
    age:d.age||"—",height:d.height||"—",income:d.income||"Prefer not to say",familyType:d.familyType||"—",
    profession:d.profession||"—",city:d.city||"—",about:d.about||"",marital:d.marital||"—",diet:d.diet||"—",
    hobbies:d.hobbies||[],langs:d.langs||[],
    partnerPrefs:{minAge:d.partnerMinAge||22,maxAge:d.partnerMaxAge||35,religions:[d.partnerReligion||"Any"],minHeight:d.partnerHeight||"Any",education:d.partnerEducation||"Any"}};
}

function HeartIcon({filled}){
  return h("svg",{width:16,height:16,viewBox:"0 0 24 24",fill:filled?"currentColor":"none",stroke:"currentColor",strokeWidth:2,"aria-hidden":true},
    h("path",{d:"M19.5 12.6 12 20l-7.5-7.4A5 5 0 0 1 12 6a5 5 0 0 1 7.5 6.6z"}));
}
function BookmarkIcon({filled}){
  return h("svg",{width:16,height:16,viewBox:"0 0 24 24",fill:filled?"currentColor":"none",stroke:"currentColor",strokeWidth:2,"aria-hidden":true},
    h("path",{d:"M6 3h12v18l-6-4-6 4z"}));
}

function ProfileCard({profile,onView,onCompare,compareSet,isSaved,onSave,me}){
  const id=pid(profile);
  const isComparing=compareSet.includes(id);
  const compat=computeCompat(profile,me||SAMPLE_PROFILES[0]);
  return h("div",{className:"profile-card"},
    h("div",{className:"card-header"},
      profile.mine?h("div",{className:"compat-badge",style:{background:"var(--emerald)"}},"You"):h("div",{className:"compat-badge"},compat+"% match"),
      !profile.mine&&h("button",{className:`heart-btn ${isSaved?"liked":""}`,onClick:()=>onSave(profile),"aria-label":isSaved?"Saved — manage collections":"Save profile",title:"Save to collection"},h(BookmarkIcon,{filled:isSaved})),
      h(Avatar,{initials:profile.photos,color:profile.color,size:72,photoUrl:profile.photoUrl}),
      h("div",{className:"card-name"},profile.name),
      h("div",{className:"card-tagline"},profile.age," yrs • ",profile.height," • ",profile.city)
    ),
    h("div",{className:"card-body"},
      h("div",{style:{marginBottom:10,display:"flex",gap:6,flexWrap:"wrap"}},
        h("span",{className:"religion-badge",style:{background:(RELIGION_COLORS[profile.religion]||"#888")+"22",color:RELIGION_COLORS[profile.religion]||"#888",border:`1px solid ${(RELIGION_COLORS[profile.religion]||"#888")}44`}},"✦ ",profile.religion||"—"),
        profile.member&&h("span",{className:"religion-badge",style:{background:"var(--emerald-light)",color:"var(--emerald)"}},"Member")
      ),
      h("div",{className:"quick-stats"},
        h("div",{className:"stat-item"},h("div",{className:"stat-val"},String(profile.profession).split(" ")[0]),h("div",{className:"stat-key"},"Profession")),
        h("div",{className:"stat-item"},h("div",{className:"stat-val"},String(profile.income).split("–")[0].replace("₹","")),h("div",{className:"stat-key"},"Income")),
        h("div",{className:"stat-item"},h("div",{className:"stat-val"},profile.familyType),h("div",{className:"stat-key"},"Family"))
      ),
      h("div",{className:"card-about"},profile.about||"No bio yet.")
    ),
    h("div",{className:"card-footer"},
      h("button",{className:"btn-sm btn-view",onClick:()=>onView(profile)},"View profile"),
      h("button",{className:`btn-sm btn-compare ${isComparing?"selected":""}`,onClick:()=>onCompare(id)},isComparing?"✓ Selected":"Compare")
    )
  );
}

function SaveSheet({profile,saved,onChange,onClose,onToast,loggedIn}){
  const [newName,setNewName]=useState("");
  const [err,setErr]=useState("");
  const id=pid(profile);
  const inAll=saved.all.includes(id);
  const toggleAll=()=>{
    if(inAll)onChange({all:saved.all.filter(x=>x!==id),collections:saved.collections.map(c=>({...c,ids:c.ids.filter(x=>x!==id)}))}),onToast("Removed from saved","info");
    else onChange({...saved,all:[...saved.all,id]}),onToast("Saved","success");
  };
  const toggleCol=cid=>{
    const cols=saved.collections.map(c=>c.id!==cid?c:{...c,ids:c.ids.includes(id)?c.ids.filter(x=>x!==id):[...c.ids,id]});
    onChange({all:inAll?saved.all:[...saved.all,id],collections:cols});
  };
  const create=()=>{
    const n=newName.trim();
    if(!n){setErr("Enter a collection name");return;}
    if(saved.collections.some(c=>c.name.toLowerCase()===n.toLowerCase())){setErr("That name already exists");return;}
    const c={id:"c"+Date.now().toString(36),name:n.slice(0,40),ids:[id]};
    onChange({all:inAll?saved.all:[...saved.all,id],collections:[...saved.collections,c]});
    setNewName("");onToast(`Saved to "${c.name}"`,"success");
  };
  return h("div",{className:"modal-overlay",onClick:e=>{if(e.target===e.currentTarget)onClose()}},
    h("div",{className:"modal-box",style:{maxWidth:420}},
      h("div",{className:"modal-header"},
        h("div",null,h("h3",{style:{fontSize:"1.4rem",color:"var(--rose-deep)"}},"Save to"),h("div",{style:{fontSize:".82rem",color:"var(--text-3)"}},profile.name)),
        h("button",{className:"modal-close",onClick:onClose,"aria-label":"Close"},"×")),
      h("div",{className:"modal-body"},
        !loggedIn&&h("div",{className:"note"},"You're not signed in — saves last only for this visit."),
        h("label",{className:"col-row"},h("input",{type:"checkbox",checked:inAll,onChange:toggleAll}),h("span",{style:{flex:1}},"All saved"),h("span",{className:"col-count"},saved.all.length)),
        ...saved.collections.map(c=>h("label",{key:c.id,className:"col-row"},
          h("input",{type:"checkbox",checked:c.ids.includes(id),onChange:()=>toggleCol(c.id)}),h("span",{style:{flex:1}},c.name),h("span",{className:"col-count"},c.ids.length))),
        h("div",{style:{display:"flex",gap:8,marginTop:14}},
          h("input",{className:"form-input",placeholder:"New collection, e.g. Shortlist",value:newName,maxLength:40,onChange:e=>{setNewName(e.target.value);setErr("");},onKeyDown:e=>{if(e.key==="Enter")create();}}),
          h("button",{className:"btn-next",onClick:create},"Create")),
        err&&h("div",{className:"validation-err"},err)
      )
    )
  );
}

function BiodataSheet({profile,contact}){
  const relFields=RELIGION_FIELDS[profile.religion]?.fields||[];
  const pp=profile.partnerPrefs||{};
  return h("div",{className:"biodata-preview"},
    h("div",{className:"bp-header"},h("div",{className:"bp-title"},profile.name),h("div",{className:"bp-subtitle"},"Matrimonial Biodata • ",profile.religion||"")),
    h("div",{className:"bp-content"},
      profile.headline&&h("p",{style:{fontFamily:"var(--serif)",fontStyle:"italic",fontSize:"1.1rem",color:"var(--rose-deep)",marginBottom:16,textAlign:"center"}},profile.headline),
      BpSection("Personal Details",[["Full Name",profile.name],["Age",profile.age&&profile.age!=="—"?profile.age+" years":""],["Height",profile.height],["Complexion",profile.complexion],["Blood Group",profile.bloodGroup],["City",profile.city],["Marital Status",profile.marital]]),
      BpSection("Education & Career",[["Degree",profile.degree],["College",profile.college],["Profession",profile.profession],["Company",profile.company],["Income",profile.income]]),
      relFields.length>0&&BpSection((profile.religion||"")+" Details",relFields.map(f=>[f.label,profile[f.key]])),
      BpSection("Family",[["Family Type",profile.familyType],["Family Values",profile.familyValues],["Siblings",profile.siblings],["Father's Occupation",profile.fatherOcc],["Mother's Occupation",profile.motherOcc]]),
      BpSection("Lifestyle",[["Diet",profile.diet],["Smoking",profile.smoking],["Drinking",profile.drinking],["Languages",(profile.langs||[]).join(", ")],["Hobbies",(profile.hobbies||[]).join(", ")]]),
      profile.about&&h("div",{className:"bp-section"},h("div",{className:"bp-sec-title"},"About Me"),h("p",{style:{fontSize:".88rem",lineHeight:1.7,color:"var(--text-2)"}},profile.about)),
      BpSection("Partner Preferences",[["Age Range",pp.minAge?`${pp.minAge}–${pp.maxAge} years`:""],["Min Height",pp.minHeight],["Religions",Array.isArray(pp.religions)?pp.religions.join(", "):pp.religions],["Education",pp.education]]),
      contact&&BpSection("Contact (private — only you see this)",[["Name",contact.contactName],["Phone",contact.contactPhone],["Email",contact.contactEmail]])
    )
  );
}

function ProfileModal({profile,onClose,isSaved,onSave}){
  if(!profile)return null;
  return h("div",{className:"modal-overlay",onClick:e=>{if(e.target===e.currentTarget)onClose()}},
    h("div",{className:"modal-box"},
      h("div",{className:"modal-header"},
        h("div",{style:{display:"flex",gap:16,alignItems:"center"}},
          h(Avatar,{initials:profile.photos,color:profile.color,size:64,photoUrl:profile.photoUrl}),
          h("div",null,
            h("h2",{style:{fontSize:"1.6rem",color:"var(--rose-deep)"}},profile.name),
            h("div",{style:{color:"var(--text-3)",fontSize:".88rem"}},profile.age," yrs • ",profile.height," • ",profile.city))),
        h("div",{style:{display:"flex",gap:8}},
          !profile.mine&&onSave&&h("button",{className:`modal-close ${isSaved?"liked":""}`,style:{color:isSaved?"var(--rose)":undefined},onClick:()=>onSave(profile),"aria-label":"Save"},h(BookmarkIcon,{filled:isSaved})),
          h("button",{className:"modal-close",onClick:()=>window.print(),"aria-label":"Print or save as PDF",title:"Print / PDF"},"⎙"),
          h("button",{className:"modal-close",onClick:onClose,"aria-label":"Close"},"×"))),
      h("div",{className:"modal-body"},h(BiodataSheet,{profile}))
    )
  );
}

function BpSection(title,fields){
  return React.createElement("div",{className:"bp-section"},
    React.createElement("div",{className:"bp-sec-title"},title),
    React.createElement("div",{className:"bp-grid"},
      ...fields.filter(([,v])=>v).map(([k,v])=>
        React.createElement("div",{className:"bp-field",key:k},
          React.createElement("div",{className:"bp-label"},k),
          React.createElement("div",{className:"bp-value"},v||"—")
        )
      )
    )
  );
}

function CompareModal({profiles,onClose}){
  const keys=[
    ["Age","age","years"],["Height","height",""],["Religion","religion",""],
    ["City","city",""],["Profession","profession",""],["Income","income",""],
    ["Degree","degree",""],["Family Type","familyType",""],["Diet","diet",""],
    ["Drinking","drinking",""],["Smoking","smoking",""]
  ];
  return React.createElement("div",{className:"modal-overlay",onClick:e=>{if(e.target===e.currentTarget)onClose()}},
    React.createElement("div",{className:"modal-box",style:{maxWidth:900}},
      React.createElement("div",{className:"modal-header"},
        React.createElement("h2",{style:{fontFamily:"var(--serif)",color:"var(--rose-deep)"}},`Comparison — ${profiles.length} Profiles`),
        React.createElement("button",{className:"modal-close",onClick:onClose},"×")
      ),
      React.createElement("div",{className:"modal-body"},
        React.createElement("div",{style:{overflowX:"auto"}},
          React.createElement("table",{className:"compare-table"},
            React.createElement("thead",null,
              React.createElement("tr",null,
                React.createElement("th",null,"Attribute"),
                ...profiles.map(p=>React.createElement("th",{key:p.id},
                  React.createElement("div",{style:{display:"flex",flexDirection:"column",alignItems:"center",gap:6}},
                    React.createElement(Avatar,{initials:p.photos,color:p.color,size:40}),
                    p.name.split(" ")[0]
                  )
                ))
              )
            ),
            React.createElement("tbody",null,
              keys.map(([label,key])=>{
                const vals=profiles.map(p=>String(p[key]||"—"));
                const allSame=vals.every(v=>v===vals[0]);
                return React.createElement("tr",{key:key},
                  React.createElement("td",null,label),
                  ...vals.map((v,i)=>React.createElement("td",{key:i,className:!allSame?"compare-diff":""},v))
                );
              })
            )
          )
        )
      )
    )
  );
}

const WIZARD_STEPS=[
  {title:"Personal Details",sub:"Tell us about yourself — the basics that form your identity."},
  {title:"Religion & Community",sub:"Your faith and community form an important part of compatibility."},
  {title:"Education & Career",sub:"Your academic and professional journey."},
  {title:"Family Background",sub:"Family is the foundation of every meaningful relationship."},
  {title:"Lifestyle & Interests",sub:"How you live shapes who you'll connect with."},
  {title:"Partner Preferences",sub:"Describe the qualities you seek in a life partner."},
  {title:"Contact & Privacy",sub:"Control how your information is shared."},
  {title:"About Me",sub:"In your own words — the most important section."},
  {title:"Review & Publish",sub:"Preview your biodata before sharing it with the world."},
];

function WizardStep({step,data,onChange,errors,uploadPhoto,uid}){
  const field=(key,label,type="text",opts={})=>{
    const placeholder=opts.placeholder||"";
    const options=opts.options||[];
    const err=errors&&errors[key];
    return React.createElement("div",{className:`form-group${opts.full?" full":""}`},
      React.createElement("label",{className:"form-label"},label),
      type==="select"?
        React.createElement("select",{className:"form-select",value:data[key]||"",onChange:e=>onChange(key,e.target.value)},
          React.createElement("option",{value:""},"— Select —"),
          ...options.map(o=>React.createElement("option",{key:o,value:o},o))
        ):
      type==="textarea"?
        React.createElement(React.Fragment,null,
          React.createElement("textarea",{className:"form-textarea",value:data[key]||"",onChange:e=>onChange(key,e.target.value),placeholder,rows:4}),
          React.createElement("div",{className:"char-counter"},(data[key]||"").length," / 600 characters")
        ):
      type==="range"?
        React.createElement("div",{className:"range-wrap"},
          React.createElement("input",{type:"range",min:opts.min,max:opts.max,value:data[key]||opts.min,onChange:e=>onChange(key,e.target.value)}),
          React.createElement("div",{className:"range-val"},data[key]||opts.min,opts.unit||"")
        ):
      type==="pills"?
        React.createElement("div",{className:"radio-group"},
          ...options.map(o=>React.createElement("div",{key:o,className:`radio-pill ${(data[key]||[]).includes(o)?"selected":""}`,onClick:()=>{
            const cur=data[key]||[];
            onChange(key,cur.includes(o)?cur.filter(x=>x!==o):[...cur,o]);
          }},o))
        ):
        React.createElement("input",{type:type||"text",className:"form-input",value:data[key]||"",onChange:e=>onChange(key,e.target.value),placeholder}),
      err&&React.createElement("div",{className:"validation-err"},err)
    );
  };

  const pill=(key,label,options)=>React.createElement("div",{className:"form-group"},
    React.createElement("label",{className:"form-label"},label),
    React.createElement("div",{className:"radio-group"},
      ...options.map(o=>React.createElement("div",{key:o,className:`radio-pill ${data[key]===o?"selected":""}`,onClick:()=>onChange(key,o)},o))
    )
  );

  if(step===0)return React.createElement("div",{className:"form-grid"},
    field("name","Full Name","text",{placeholder:"Your full name"}),
    field("dob","Date of Birth","date"),
    field("age","Age (auto-calculated)","text",{placeholder:"Will fill from DOB"}),
    field("height","Height","select",{options:HEIGHTS}),
    field("complexion","Complexion","select",{options:["Fair","Wheatish","Dusky","Dark"]}),
    field("bloodGroup","Blood Group","select",{options:["A+","A-","B+","B-","O+","O-","AB+","AB-"]}),
    field("marital","Marital Status","select",{options:["Never Married","Divorced","Widowed","Awaiting Divorce"]}),
    field("city","City","select",{options:CITIES})
  );

  if(step===1){
    const relFields=RELIGION_FIELDS[data.religion]?.fields||[];
    return React.createElement("div",{className:"form-grid"},
      field("religion","Religion","select",{options:RELIGIONS}),
      ...relFields.map(f=>
        f.type==="select"?field(f.key,f.label,"select",{options:f.options,placeholder:f.placeholder}):
        f.type==="textarea"?field(f.key,f.label,"textarea",{placeholder:f.placeholder,full:true}):
        field(f.key,f.label,"text",{placeholder:f.placeholder})
      )
    );
  }

  if(step===2)return React.createElement("div",{className:"form-grid"},
    field("degree","Highest Degree","select",{options:DEGREES}),
    field("college","College / University","text",{placeholder:"e.g. IIT Bombay, Delhi University"}),
    field("profession","Profession","select",{options:PROFESSIONS}),
    field("company","Current Company / Organisation","text",{placeholder:"Your employer"}),
    field("workCity","Work Location","select",{options:CITIES}),
    field("income","Annual Income","select",{options:INCOME_RANGES})
  );

  if(step===3)return React.createElement("div",{className:"form-grid"},
    field("fatherOcc","Father's Occupation","text",{placeholder:"e.g. Retired IAS, Business"}),
    field("motherOcc","Mother's Occupation","text",{placeholder:"e.g. Homemaker, Doctor"}),
    field("siblings","Siblings","text",{placeholder:"e.g. 1 Brother, 2 Sisters"}),
    field("familyType","Family Type","select",{options:["Nuclear","Joint","Extended","Living Abroad"]}),
    field("familyValues","Family Values","select",{options:["Traditional","Moderate","Liberal","Very Liberal"]}),
    field("familyStatus","Family Status","select",{options:["Middle Class","Upper Middle Class","Affluent","High Net Worth"]})
  );

  if(step===4)return React.createElement("div",{className:"form-grid"},
    field("diet","Diet","select",{options:["Vegetarian","Eggetarian","Non-Vegetarian","Vegan","Jain Vegetarian"]}),
    field("smoking","Smoking","select",{options:["No","Yes","Occasionally","Quit"]}),
    field("drinking","Drinking","select",{options:["No","Socially","Occasionally","Yes"]}),
    field("hobbies","Hobbies & Interests","pills",{options:["Reading","Travel","Music","Cooking","Fitness","Cricket","Photography","Art","Dance","Yoga","Gaming","Movies","Theatre","Trekking","Cycling"],full:true}),
    field("langs","Languages Known","pills",{options:["Hindi","English","Tamil","Telugu","Kannada","Malayalam","Bengali","Marathi","Gujarati","Punjabi","Urdu","Other"],full:true})
  );

  if(step===5)return React.createElement("div",{className:"form-grid"},
    React.createElement("div",{className:"form-group"},
      React.createElement("label",{className:"form-label"},"Partner Min Age"),
      React.createElement("div",{className:"range-wrap"},
        React.createElement("input",{type:"range",min:18,max:50,value:data.partnerMinAge||22,step:1,onChange:e=>onChange("partnerMinAge",+e.target.value)}),
        React.createElement("div",{className:"range-val"},data.partnerMinAge||22," yrs")
      )
    ),
    React.createElement("div",{className:"form-group"},
      React.createElement("label",{className:"form-label"},"Partner Max Age"),
      React.createElement("div",{className:"range-wrap"},
        React.createElement("input",{type:"range",min:18,max:60,value:data.partnerMaxAge||35,step:1,onChange:e=>onChange("partnerMaxAge",+e.target.value)}),
        React.createElement("div",{className:"range-val"},data.partnerMaxAge||35," yrs")
      )
    ),
    field("partnerHeight","Min Height Preference","select",{options:HEIGHTS}),
    field("partnerEducation","Min Education","select",{options:["Any","Undergraduate","Graduate","Post-Graduate","Doctorate"]}),
    field("partnerCity","Preferred City","select",{options:["Any",...CITIES]}),
    field("partnerReligion","Religion Preference","select",{options:["Any",...RELIGIONS]})
  );

  if(step===6){
    const[uploading,setUploading]=React.useState(false);
    const[uploadErr,setUploadErr]=React.useState("");
    const handlePhoto=async e=>{
      const file=e.target.files[0];
      if(!file)return;
      if(file.size>5*1024*1024){setUploadErr("Photo must be under 5 MB");return;}
      if(!file.type.startsWith("image/")){setUploadErr("Please select an image file");return;}
      if(!uploadPhoto){setUploadErr("Sign in to upload a photo");return;}
      setUploading(true);setUploadErr("");
      try{
        const url=await uploadPhoto(file);
        onChange("photoUrl",url);
      }catch(e2){setUploadErr("Upload failed: "+(e2.message||"try again"));}
      finally{setUploading(false);}
    };
    return React.createElement("div",{className:"form-grid"},
      React.createElement("div",{className:"form-group full"},
        React.createElement("label",{className:"form-label"},"Profile Photo"),
        React.createElement("div",{style:{display:"flex",gap:16,alignItems:"center",flexWrap:"wrap"}},
          React.createElement(Avatar,{initials:initialsOf(data.name||"?"),color:RELIGION_COLORS[data.religion]||"#b5485a",size:80,photoUrl:data.photoUrl}),
          React.createElement("div",null,
            React.createElement("input",{type:"file",accept:"image/*",id:"photo-upload",style:{display:"none"},onChange:handlePhoto}),
            React.createElement("label",{htmlFor:"photo-upload",className:"btn-next",style:{display:"inline-block",padding:"9px 20px",cursor:"pointer",borderRadius:20,fontSize:".85rem"}},uploading?"Uploading…":"Choose photo"),
            data.photoUrl&&React.createElement("button",{className:"btn-back",style:{marginLeft:8},onClick:()=>onChange("photoUrl",""),"aria-label":"Remove photo"},"Remove"),
            React.createElement("div",{style:{fontSize:".75rem",color:"var(--text-3)",marginTop:4}},"JPG, PNG or WEBP • max 5 MB"),
            uploadErr&&React.createElement("div",{className:"validation-err"},uploadErr)
          )
        )
      ),
      field("contactName","Contact Name","text",{placeholder:"Who should they ask for?",full:true}),
      field("contactPhone","Contact Phone","text",{placeholder:"Will be masked publicly"}),
      field("contactEmail","Contact Email","text",{placeholder:"Will be masked publicly"}),
      pill("phonePrivacy","Phone Visibility",["Visible to All","Visible to Matches","Hidden"]),
      pill("emailPrivacy","Email Visibility",["Visible to All","Visible to Matches","Hidden"]),
      pill("photoPref","Photo Visibility",["Visible to All","Visible to Matches Only","Hidden"])
    );
  }

  if(step===7)return React.createElement("div",{className:"form-grid single"},
    field("about","About Me","textarea",{placeholder:"Write 3–6 sentences. What makes you you? What are you looking for? What does home mean to you?",full:true}),
    React.createElement("div",{className:"form-group full"},
      React.createElement("label",{className:"form-label"},"Profile Headline"),
      React.createElement("input",{type:"text",className:"form-input",value:data.headline||"",onChange:e=>onChange("headline",e.target.value),placeholder:"One line that says it all, e.g. 'Engineer by day, chef by night, building something real'",maxLength:80}),
      React.createElement("div",{className:"char-counter"},(data.headline||"").length," / 80")
    )
  );

  if(step===8){
    const completedFields=["name","dob","height","religion","profession","income","city","about","familyType","diet"].filter(k=>data[k]);
    const pct=Math.round((completedFields.length/10)*100);
    const tips=[
      {done:!!data.name,text:"Add your full name"},
      {done:!!data.about&&data.about.length>100,text:"Write a detailed About Me (100+ chars)"},
      {done:!!data.profession,text:"Add profession and income"},
      {done:!!data.religion,text:"Complete religion & community fields"},
      {done:!!data.fatherOcc,text:"Add family background"},
      {done:!!(data.hobbies&&data.hobbies.length>2),text:"Add 3+ hobbies"},
    ];
    const circ=Math.PI*2*44;
    return React.createElement("div",{style:{display:"flex",flexDirection:"column",gap:24}},
      React.createElement("div",{style:{display:"flex",gap:24,flexWrap:"wrap",alignItems:"flex-start"}},
        React.createElement("div",{className:"completion-wrap",style:{position:"relative",width:120,height:120,flexShrink:0}},
          React.createElement("svg",{className:"ring-svg",width:120,height:120,viewBox:"0 0 120 120"},
            React.createElement("circle",{cx:60,cy:60,r:44,fill:"none",stroke:"var(--border)",strokeWidth:10}),
            React.createElement("circle",{cx:60,cy:60,r:44,fill:"none",stroke:"var(--rose)",strokeWidth:10,
              strokeDasharray:`${circ*(pct/100)} ${circ}`,strokeLinecap:"round",style:{transition:"stroke-dasharray .6s ease"}})
          ),
          React.createElement("div",{className:"ring-pct",style:{position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-50%)"}},pct+"%")
        ),
        React.createElement("div",{style:{flex:1}},
          React.createElement("h4",{style:{fontFamily:"var(--serif)",fontSize:"1.1rem",color:"var(--rose-deep)",marginBottom:8}},"Profile Completion Tips"),
          React.createElement("ul",{className:"tips-list"},
            ...tips.map((t,i)=>React.createElement("li",{key:i,className:"tip-item"},
              React.createElement("div",{className:`tip-dot ${t.done?"done":"todo"}`}),t.text
            ))
          )
        )
      ),
      selectedTemplate&&React.createElement("div",{style:{background:selectedTemplate.palette.card,border:"1px solid "+selectedTemplate.palette.border,borderRadius:12,padding:"16px 20px",marginBottom:0}},
        React.createElement("div",{style:{fontFamily:"var(--serif)",fontSize:"1rem",color:selectedTemplate.palette.accent,marginBottom:10}},selectedTemplate.name+" — Template Preview"),
        React.createElement("div",{style:{transform:"scale(.6)",transformOrigin:"top left",width:"167%",height:140,overflow:"hidden",pointerEvents:"none",borderRadius:8}},
          React.createElement(MiniPreview,{template:selectedTemplate,profile:{name:data.name||"Your Name",age:data.age||"—",height:data.height||"—",religion:data.religion||"",profession:data.profession||"—",city:data.city||"—",about:data.about||"Your story goes here.",photos:(data.name||"YN").split(" ").map(w=>w[0]).join("").toUpperCase().slice(0,2),color:selectedTemplate.palette.accent}}))),
      React.createElement("div",{style:{background:"var(--rose-light)",border:"1px solid var(--rose-mid)",borderRadius:12,padding:"16px 20px"}},
        React.createElement("div",{style:{fontFamily:"var(--serif)",fontSize:"1.1rem",color:"var(--rose-deep)",marginBottom:8}},"Your Biodata Preview"),
        data.name&&React.createElement("div",{style:{fontSize:".88rem",color:"var(--text-2)",lineHeight:1.6}},
          React.createElement("strong",null,data.name)," • ",data.age||"—"," yrs • ",data.city||"—","",React.createElement("br",null),
          data.religion||"—"," • ",data.profession||"—","",React.createElement("br",null),
          data.about?data.about.slice(0,180)+"…":"No bio added yet."
        )
      )
    );
  }
  return null;
}

function Wizard({initial,editing,onSubmit,onCancel,onToast,uploadPhoto,selectedTemplate}){
  const [step,setStep]=useState(0);
  const [data,setData]=useState(()=>({...(initial||{})}));
  const [errors,setErrors]=useState({});
  const [busy,setBusy]=useState(false);
  const [showConfetti,setShowConfetti]=useState(false);

  function onChange(key,val){
    if(key==="dob"&&val){
      const b=new Date(val),n=new Date();
      let age=n.getFullYear()-b.getFullYear();
      if(n<new Date(n.getFullYear(),b.getMonth(),b.getDate()))age--;
      setData(d=>({...d,dob:val,age}));
    }else setData(d=>({...d,[key]:val}));
    setErrors(e=>({...e,[key]:undefined}));
  }
  function validate(s=step){
    const errs={};
    if(s===0){if(!data.name)errs.name="Name is required";if(!data.city)errs.city="City is required";if(data.age&&(data.age<18||data.age>80))errs.dob="Age must be 18–80";}
    if(s===1&&!data.religion)errs.religion="Select a religion";
    if(s===2&&!data.profession)errs.profession="Profession is required";
    setErrors(errs);return Object.keys(errs).length===0;
  }
  async function nextStep(){
    if(!validate())return;
    if(step<WIZARD_STEPS.length-1){setStep(s=>s+1);return;}
    for(let s=0;s<3;s++)if(!validate(s)){setStep(s);return;}
    setBusy(true);
    try{
      await onSubmit(data);
      if(!editing){setShowConfetti(true);setTimeout(()=>setShowConfetti(false),3500);}
      onToast(editing?"Profile updated":"Biodata published","success");
    }catch(e){
      onToast(e&&e.message==="signed_out"?"Sign in to save your biodata":"Couldn't save. Try again.","error");
    }finally{setBusy(false);}
  }
  const pct=Math.round((step/(WIZARD_STEPS.length-1))*100);
  return h(React.Fragment,null,
    showConfetti&&h(Confetti),
    h("div",{className:"wizard-wrap"},
      h("div",{className:"wizard-progress"},
        h("div",{className:"progress-steps"},
          ...WIZARD_STEPS.map((s,i)=>h("div",{key:i,className:"prog-step"},
            h("button",{className:`prog-dot ${i<step?"done":i===step?"active":"pending"}`,title:s.title,"aria-label":s.title,
              onClick:()=>{if(editing||i<step)setStep(i);}},i<step?"✓":i+1),
            i<WIZARD_STEPS.length-1&&h("div",{className:`prog-line ${i<step?"done":""}`})))),
        h("div",{style:{marginTop:12,fontSize:".75rem",color:"var(--text-3)"}},`Step ${step+1} of ${WIZARD_STEPS.length} — ${pct}%`,editing?" • click any step to jump":""),
        h("div",{className:"progress-bar-wrap",style:{marginTop:6}},h("div",{className:"progress-bar-fill",style:{width:pct+"%"}}))),
      h("div",{className:"wizard-body"},
        h("h2",{className:"wizard-step-title"},WIZARD_STEPS[step].title),
        h("div",{className:"wizard-step-sub"},WIZARD_STEPS[step].sub),
        step===6&&h("div",{className:"note"},"Contact details are stored privately — other members never see them."),
        h(WizardStep,{step,data,onChange,errors})),
      h("div",{className:"wizard-footer"},
        h("div",{style:{display:"flex",gap:8}},
          step>0&&h("button",{className:"btn-back",onClick:()=>setStep(s=>s-1)},"← Back"),
          onCancel&&h("button",{className:"btn-back",onClick:onCancel},"Cancel")),
        h("div",{style:{display:"flex",gap:8}},
          editing&&step<WIZARD_STEPS.length-1&&h("button",{className:"btn-back",disabled:busy,onClick:()=>setStep(WIZARD_STEPS.length-1)},"Review"),
          h("button",{className:"btn-next",disabled:busy,onClick:nextStep},busy?"Saving…":step===WIZARD_STEPS.length-1?(editing?"Save changes":"Publish biodata ✦"):"Continue →")))
    )
  );
}


function LoginModal({onClose,signIn,configured}){
  const [email,setEmail]=useState("");
  const [state,setState]=useState("idle");
  const [err,setErr]=useState("");
  const submit=async()=>{
    if(!/^\S+@\S+\.\S+$/.test(email.trim())){setErr("Enter a valid email address");return;}
    setState("sending");setErr("");
    try{await signIn(email.trim());setState("sent");}
    catch(e){setState("idle");setErr(e.message==="not_configured"?"Sign-in isn't configured on this deployment.":"Couldn't send the link. Try again.");}
  };
  return h("div",{className:"modal-overlay",onClick:e=>{if(e.target===e.currentTarget)onClose()}},
    h("div",{className:"modal-box",style:{maxWidth:420}},
      h("div",{className:"modal-header"},h("h3",{style:{fontSize:"1.5rem",color:"var(--rose-deep)"}},"Sign in"),h("button",{className:"modal-close",onClick:onClose,"aria-label":"Close"},"×")),
      h("div",{className:"modal-body"},
        !configured&&h("div",{className:"note"},"Backend not configured: set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY."),
        state==="sent"?h("p",{style:{fontSize:".92rem",color:"var(--text-2)",lineHeight:1.6}},"Check ",h("strong",null,email),". Click the sign-in link in that email."):
        h(React.Fragment,null,
          h("p",{style:{fontSize:".85rem",color:"var(--text-3)",marginBottom:12}},"We'll email you a sign-in link. No password needed."),
          h("input",{className:"form-input",type:"email",autoFocus:true,placeholder:"name@example.com",value:email,onChange:e=>{setEmail(e.target.value);setErr("");},onKeyDown:e=>{if(e.key==="Enter")submit();}}),
          err&&h("div",{className:"validation-err"},err),
          h("button",{className:"btn-next",style:{width:"100%",marginTop:12},disabled:state==="sending",onClick:submit},state==="sending"?"Sending…":"Email me a sign-in link")))));
}

function useCompare(onToast){
  const [compareSet,setCompareSet]=useState([]);
  const toggle=useCallback(id=>setCompareSet(s=>{
    if(s.includes(id))return s.filter(x=>x!==id);
    if(s.length>=3){onToast("Compare up to 3 profiles","error");return s;}
    return [...s,id];
  }),[onToast]);
  return [compareSet,toggle];
}

function ProfileGrid({list,ctx,empty}){
  if(!list.length)return h("div",{className:"empty"},h("div",{style:{fontSize:"2rem",marginBottom:10}},"✦"),empty);
  const {view,toggleCompare,compareSet,saved,openSave,me}=ctx;
  return h("div",{className:"profile-grid"},...list.map(p=>h(ProfileCard,{key:pid(p),profile:p,onView:view,onCompare:toggleCompare,compareSet:compareSet,isSaved:(saved&&saved.all||[]).includes(pid(p)),onSave:openSave,me:me})));
}

function DirectorySection({profiles,ctx}){
  const [query,setQuery]=useState("");
  const [filterRel,setFilterRel]=useState("");
  const [filterCity,setFilterCity]=useState("");
  const [filterDiet,setFilterDiet]=useState("");
  const [sortBy,setSortBy]=useState("featured");
  const cities=useMemo(()=>[...new Set(profiles.map(p=>p.city).filter(c=>c&&c!=="—"))].sort(),[profiles]);
  const filtered=useMemo(()=>{
    const q=query.toLowerCase().trim();
    let list=profiles.filter(p=>{
      if(filterRel&&p.religion!==filterRel)return false;
      if(filterCity&&p.city!==filterCity)return false;
      if(filterDiet&&p.diet!==filterDiet)return false;
      if(q)return [p.name,p.profession,p.religion,p.city,p.about].some(v=>String(v||"").toLowerCase().includes(q));
      return true;
    });
    if(sortBy==="compat")list=[...list].sort((a,b)=>computeCompat(b,ctx.me||SAMPLE_PROFILES[0])-computeCompat(a,ctx.me||SAMPLE_PROFILES[0]));
    else if(sortBy==="newest")list=[...list].sort((a,b)=>(b.updatedAt||0)-(a.updatedAt||0));
    return list;
  },[profiles,query,filterRel,filterCity,filterDiet,sortBy,ctx.me]);
  const sel=(label,val,set,opts)=>h("div",{className:"filter-group"},h("label",null,label),
    h("select",{value:val,onChange:e=>set(e.target.value)},h("option",{value:""},"All"),...opts.map(o=>h("option",{key:o,value:o},o))));
  return h("div",null,
    h("div",{className:"filter-bar"},
      h("div",{className:"filter-row"},
        h("div",{className:"search-wrap"},h("input",{type:"text","aria-label":"Search profiles",placeholder:"Search name, profession, city, religion…",value:query,onChange:e=>setQuery(e.target.value),style:{width:"100%",pointerEvents:"auto"}}),h("span",{className:"search-icon"},"⌕")),
        sel("Religion",filterRel,setFilterRel,RELIGIONS),
        sel("City",filterCity,setFilterCity,cities),
        sel("Diet",filterDiet,setFilterDiet,["Vegetarian","Non-Vegetarian","Vegan","Eggetarian","Jain Vegetarian"])),
      h("div",{style:{display:"flex",alignItems:"center",gap:8,marginTop:12,flexWrap:"wrap"}},
        h("span",{style:{fontSize:".78rem",color:"var(--text-3)"}},filtered.length," profiles • Sort:"),
        h("div",{className:"sort-tabs"},[{k:"featured",l:"Featured"},{k:"newest",l:"Newest"},{k:"compat",l:"Best match"}].map(({k,l})=>
          h("button",{key:k,className:`sort-tab ${sortBy===k?"active":""}`,onClick:()=>setSortBy(k)},l))))),
    h(ProfileGrid,{list:filtered,ctx,empty:"No profiles match your filters."})
  );
}

function SavedView({profiles,ctx}){
  const [active,setActive]=useState("all");
  const [renaming,setRenaming]=useState(false);
  const [nameVal,setNameVal]=useState("");
  const {saved}=ctx;
  const byId=useMemo(()=>Object.fromEntries(profiles.map(p=>[pid(p),p])),[profiles]);
  const col=saved.collections.find(c=>c.id===active);
  const ids=active==="all"?saved.all:(col?col.ids:[]);
  const list=ids.map(i=>byId[i]).filter(Boolean);
  useEffect(()=>{if(active!=="all"&&!col)setActive("all");},[active,col]);
  const cover=cids=>{const p=byId[cids[cids.length-1]];return p?h(Avatar,{initials:p.photos,color:p.color,size:34}):h("div",{className:"col-empty-cover"},"✦");};
  return h("div",null,
    !ctx.loggedIn&&h("div",{className:"note"},"Not signed in — saved profiles won't persist after you leave. Sign in to keep them."),
    h("div",{className:"col-tabs"},
      h("button",{className:`col-tab ${active==="all"?"active":""}`,onClick:()=>setActive("all")},cover(saved.all),h("div",null,h("div",{className:"col-tab-name"},"All saved"),h("div",{className:"col-tab-n"},saved.all.length," profiles"))),
      ...saved.collections.map(c=>h("button",{key:c.id,className:`col-tab ${active===c.id?"active":""}`,onClick:()=>{setActive(c.id);setRenaming(false);}},cover(c.ids),h("div",null,h("div",{className:"col-tab-name"},c.name),h("div",{className:"col-tab-n"},c.ids.length," profiles"))))),
    col&&h("div",{style:{display:"flex",gap:8,margin:"0 0 16px",flexWrap:"wrap",alignItems:"center"}},
      renaming?h(React.Fragment,null,
        h("input",{className:"form-input",style:{maxWidth:260},value:nameVal,maxLength:40,onChange:e=>setNameVal(e.target.value)}),
        h("button",{className:"btn-next",onClick:()=>{const n=nameVal.trim();if(!n)return;ctx.writeSaved({...saved,collections:saved.collections.map(c=>c.id===col.id?{...c,name:n}:c)});setRenaming(false);}},"Save"),
        h("button",{className:"btn-back",onClick:()=>setRenaming(false)},"Cancel")):
      h(React.Fragment,null,
        h("button",{className:"btn-back",onClick:()=>{setNameVal(col.name);setRenaming(true);}},"Rename"),
        h("button",{className:"btn-back",onClick:()=>{if(!confirm(`Delete collection "${col.name}"? Profiles stay in All saved.`))return;ctx.writeSaved({...saved,collections:saved.collections.filter(c=>c.id!==col.id)});ctx.toast("Collection deleted","info");}},"Delete collection"))),
    h(ProfileGrid,{list,ctx:{...ctx,view:ctx.view,toggleCompare:ctx.toggleCompare,compareSet:ctx.compareSet,saved:ctx.saved,openSave:ctx.openSave,me:ctx.me},empty:active==="all"?"Tap the bookmark on any profile to save it here.":"Nothing in this collection yet."})
  );
}

function MyProfileView({ctx,myProfile,onEdit,onCreate}){
  if(!ctx.ready)return h("div",{className:"empty"},"Loading your account…");
  if(!ctx.loggedIn)return h("div",{className:"empty"},h("h3",{style:{fontSize:"1.4rem",color:"var(--rose-deep)",marginBottom:8}},"Sign in to create your biodata"),
    h("p",{style:{marginBottom:16}},"Sign in with your email to publish, edit, and save profiles."),h("button",{className:"btn-primary",onClick:()=>ctx.openLogin()},"Sign in"));
  if(!myProfile)return h("div",{className:"empty"},h("h3",{style:{fontSize:"1.4rem",color:"var(--rose-deep)",marginBottom:8}},"You haven't created a biodata yet"),
    h("p",{style:{marginBottom:16}},"It takes about five minutes. You can edit it any time."),h("button",{className:"btn-primary",onClick:onCreate},"Create your biodata ✦"));
  return h("div",null,
    h("div",{style:{display:"flex",gap:8,flexWrap:"wrap",marginBottom:16}},
      h("button",{className:"btn-next",onClick:onEdit},"Edit profile"),
      h("button",{className:"btn-back",onClick:()=>window.print()},"Print / save PDF"),
      h("button",{className:"btn-back",onClick:()=>{navigator.clipboard&&navigator.clipboard.writeText(location.href).then(()=>ctx.toast("Link copied","success"),()=>ctx.toast("Copy failed","error"));}},"Copy link"),
      h("button",{className:"btn-back",style:{marginLeft:"auto",color:"#c0392b"},onClick:async()=>{if(!confirm("Delete your published biodata? This can't be undone."))return;try{await ctx.deleteProfile();ctx.toast("Profile deleted","info");}catch(e){ctx.toast("Couldn't delete. Try again.","error");}}},"Delete profile")),
    h(BiodataSheet,{profile:myProfile,contact:ctx.contact})
  );
}


// ─── TEMPLATE SYSTEM ─────────────────────────────────────────────────────────
const TEMPLATES=[
  {id:"royal-maroon",name:"Royal Maroon",category:"traditional",featured:true,palette:{bg:"#2a0a0f",fg:"#f5e6d3",accent:"#c9a83a",border:"#8a6520",muted:"#7a4a2a",card:"#3d1520",header:"#1a0507"},font:"serif",layout:"centered",motifs:["gold-border"]},
  {id:"ivory-elegance",name:"Ivory Elegance",category:"traditional",featured:false,palette:{bg:"#fdfaf5",fg:"#2a1a1a",accent:"#b5485a",border:"#e8c4cb",muted:"#888",card:"#fff",header:"#f5f0e8"},font:"serif",layout:"two-col",motifs:["rose-divider"]},
  {id:"heritage-gold",name:"Heritage Gold",category:"traditional",featured:false,palette:{bg:"#1a1200",fg:"#f5e6c8",accent:"#d4a017",border:"#8a6500",muted:"#9a8040",card:"#2a1e00",header:"#0d0a00"},font:"serif",layout:"centered",motifs:["saffron"]},
  {id:"sanctum",name:"Sanctum",category:"traditional",featured:false,palette:{bg:"#1a0500",fg:"#f5e0c8",accent:"#c94a1a",border:"#8a3a10",muted:"#8a5a3a",card:"#2a0e00",header:"#0d0200"},font:"serif",layout:"centered",motifs:["temple-arch"]},
  {id:"nordic-clean",name:"Nordic Clean",category:"modern",featured:false,palette:{bg:"#f8f9fa",fg:"#1a1a2e",accent:"#4a6fa5",border:"#dee2e6",muted:"#6c757d",card:"#fff",header:"#e9ecef"},font:"sans",layout:"two-col",motifs:[]},
  {id:"editorial",name:"Editorial",category:"modern",featured:true,palette:{bg:"#0a0a0a",fg:"#f0f0f0",accent:"#e8b4bc",border:"#333",muted:"#666",card:"#141414",header:"#050505"},font:"sans",layout:"editorial",motifs:[]},
  {id:"bento",name:"Bento",category:"modern",featured:false,palette:{bg:"#f0f4f8",fg:"#1a202c",accent:"#667eea",border:"#e2e8f0",muted:"#718096",card:"#fff",header:"#ebf4ff"},font:"sans",layout:"bento",motifs:[]},
  {id:"mono",name:"Mono",category:"modern",featured:false,palette:{bg:"#fff",fg:"#000",accent:"#000",border:"#000",muted:"#666",card:"#f5f5f5",header:"#000"},font:"mono",layout:"two-col",motifs:[]},
  {id:"nikkah",name:"Nikkah",category:"religious",featured:false,palette:{bg:"#0a1a0a",fg:"#e8f5e8",accent:"#4caf50",border:"#2d6a2d",muted:"#4a7a4a",card:"#0f240f",header:"#050f05"},font:"serif",layout:"centered",motifs:["geometric","crescent"]},
  {id:"khalsa",name:"Khalsa",category:"religious",featured:false,palette:{bg:"#1a1200",fg:"#fff8e8",accent:"#ff8c00",border:"#1a3a6a",muted:"#7a6a3a",card:"#241800",header:"#0d0900"},font:"serif",layout:"centered",motifs:["khanda"]},
  {id:"christened",name:"Christened",category:"religious",featured:false,palette:{bg:"#f0f5ff",fg:"#1a2a4a",accent:"#4a7abf",border:"#c0d0e8",muted:"#6a8aaa",card:"#fff",header:"#e0eaf8"},font:"serif",layout:"two-col",motifs:["cross"]},
  {id:"jain-serenity",name:"Jain Serenity",category:"religious",featured:false,palette:{bg:"#fffff8",fg:"#2a2a1a",accent:"#8a7a3a",border:"#e8e0c0",muted:"#8a8a6a",card:"#fff",header:"#f8f8f0"},font:"serif",layout:"centered",motifs:["lotus"]},
  {id:"gilded",name:"Gilded",category:"premium",featured:true,palette:{bg:"#0a0800",fg:"#f5e8c0",accent:"#ffd700",border:"#b8960c",muted:"#9a8030",card:"#150f00",header:"#050400"},font:"serif",layout:"centered",motifs:["gold-foil"]},
  {id:"pastel-bloom",name:"Pastel Bloom",category:"premium",featured:false,palette:{bg:"#fff5f8",fg:"#3a1a2a",accent:"#e8739a",border:"#f0c0d0",muted:"#b07080",card:"#fff",header:"#ffe8f0"},font:"serif",layout:"two-col",motifs:["floral"]},
  {id:"midnight",name:"Midnight",category:"premium",featured:false,palette:{bg:"#050812",fg:"#e8eaf8",accent:"#c9a83a",border:"#1a2040",muted:"#4a5080",card:"#0a0f22",header:"#020408"},font:"sans",layout:"editorial",motifs:[]},
  {id:"rose-script",name:"Rose Script",category:"premium",featured:false,palette:{bg:"#fff8f5",fg:"#2a1a15",accent:"#c06040",border:"#e8c0b0",muted:"#9a7060",card:"#fff",header:"#fdf0eb"},font:"serif",layout:"centered",motifs:["rose-border"]},
];
const GALLERY_PROFILES=[
  {name:"Priya Sharma",age:27,height:"162cm",religion:"Hindu",profession:"Software Engineer",city:"Bangalore",about:"Engineer by day, classical dancer by evening. Looking for someone who loves chai and conversation.",photos:"PS",color:"#c9783a"},
  {name:"Arjun Mehta",age:30,height:"178cm",religion:"Hindu",profession:"Chartered Accountant",city:"Delhi",about:"Finance is my craft, philosophy my passion. Seeking depth over surface.",photos:"AM",color:"#c9783a"},
  {name:"Zara Khan",age:26,height:"163cm",religion:"Muslim",profession:"UI/UX Designer",city:"Mumbai",about:"I design things for a living and wonder about them always.",photos:"ZK",color:"#2d6a4f"},
  {name:"Harpreet Singh",age:32,height:"183cm",religion:"Sikh",profession:"Business Owner",city:"Chandigarh",about:"Four generations of farmers, now exporting to 20 countries. Faith first.",photos:"HS",color:"#c9a83a"},
];
function Motif({type,size=40,color="#c9a83a"}){
  const c=color;
  if(type==="khanda")return h("svg",{width:size,height:size,viewBox:"0 0 40 40",fill:"none","aria-hidden":true},h("path",{d:"M20 4L20 36M14 10C10 14 10 26 14 30L20 36L26 30C30 26 30 14 26 10L20 4Z",stroke:c,strokeWidth:1.5}),h("circle",{cx:20,cy:20,r:5,stroke:c,strokeWidth:1.5}),h("path",{d:"M8 20L32 20",stroke:c,strokeWidth:1.5}));
  if(type==="lotus")return h("svg",{width:size,height:size,viewBox:"0 0 40 40",fill:"none","aria-hidden":true},h("path",{d:"M20 32C20 32 10 24 10 16C10 10 15 8 20 12C25 8 30 10 30 16C30 24 20 32 20 32Z",stroke:c,strokeWidth:1.2}),h("path",{d:"M20 32C20 32 6 22 8 14C10 8 14 10 20 16",stroke:c,strokeWidth:1,opacity:.7}),h("path",{d:"M20 32C20 32 34 22 32 14C30 8 26 10 20 16",stroke:c,strokeWidth:1,opacity:.7}));
  if(type==="cross")return h("svg",{width:size,height:size,viewBox:"0 0 40 40",fill:"none","aria-hidden":true},h("path",{d:"M20 8L20 32M10 18L30 18",stroke:c,strokeWidth:2,strokeLinecap:"round"}));
  if(type==="crescent")return h("svg",{width:size,height:size,viewBox:"0 0 40 40",fill:"none","aria-hidden":true},h("path",{d:"M24 10A12 12 0 1 0 24 30A8 8 0 1 1 24 10Z",fill:c}),h("circle",{cx:28,cy:14,r:2,fill:c}));
  if(type==="geometric")return h("svg",{width:size,height:size,viewBox:"0 0 40 40",fill:"none","aria-hidden":true},h("rect",{x:8,y:8,width:24,height:24,stroke:c,strokeWidth:1,transform:"rotate(45 20 20)"}),h("rect",{x:12,y:12,width:16,height:16,stroke:c,strokeWidth:1}),h("circle",{cx:20,cy:20,r:3,fill:c}));
  if(type==="floral")return h("svg",{width:size,height:size,viewBox:"0 0 40 40",fill:"none","aria-hidden":true},...[0,60,120,180,240,300].map(a=>h("ellipse",{key:a,cx:20+8*Math.cos(a*Math.PI/180),cy:20+8*Math.sin(a*Math.PI/180),rx:4,ry:7,transform:`rotate(${a} ${20+8*Math.cos(a*Math.PI/180)} ${20+8*Math.sin(a*Math.PI/180)})`,fill:c,opacity:.7})),h("circle",{cx:20,cy:20,r:4,fill:c}));
  return null;
}
function MiniPreview({template,profile}){
  const{palette:p,font,layout,motifs}=template;
  const ff=font==="mono"?"'Courier New',monospace":font==="sans"?"var(--sans)":"var(--serif)";
  const base={background:p.bg,color:p.fg,fontFamily:ff,padding:16,minHeight:220,position:"relative",overflow:"hidden"};
  if(layout==="bento")return h("div",{style:{...base,display:"grid",gridTemplateColumns:"1fr 1fr",gap:6}},...[["Name",profile.name],["Age",profile.age+" yrs"],["City",profile.city],["Job",profile.profession.split(" ")[0]]].map(([k,v])=>h("div",{key:k,style:{background:p.card,borderRadius:6,padding:"6px 8px",border:`1px solid ${p.border}`}},h("div",{style:{fontSize:8,color:p.muted,textTransform:"uppercase",letterSpacing:1}},k),h("div",{style:{fontSize:10,fontWeight:600,color:p.fg}},v))));
  if(layout==="editorial")return h("div",{style:{...base,display:"flex",flexDirection:"column",gap:8}},h("div",{style:{fontSize:22,fontWeight:700,color:p.accent,lineHeight:1.1,fontFamily:ff}},profile.name),h("div",{style:{fontSize:9,color:p.muted,letterSpacing:2,textTransform:"uppercase"}},profile.profession+" • "+profile.city),h("div",{style:{flex:1,borderTop:`1px solid ${p.border}`,marginTop:4,paddingTop:8,fontSize:9,color:p.fg,opacity:.8,lineHeight:1.5}},profile.about.slice(0,80)+"…"));
  return h("div",{style:{...base,display:"flex",flexDirection:"column",alignItems:"center",gap:8,textAlign:"center"}},motifs[0]&&h("div",{style:{position:"absolute",top:8,right:8,opacity:.4}},h(Motif,{type:motifs[0],size:28,color:p.accent})),h("div",{style:{width:44,height:44,borderRadius:"50%",background:`linear-gradient(135deg,${p.accent},${p.border})`,display:"flex",alignItems:"center",justifyContent:"center",color:p.bg,fontSize:14,fontWeight:700,fontFamily:ff,border:`2px solid ${p.accent}`}},profile.photos),h("div",{style:{fontSize:13,fontWeight:700,color:p.accent,fontFamily:ff}},profile.name),h("div",{style:{fontSize:9,color:p.muted}},profile.age+" yrs • "+profile.height+" • "+profile.city),h("div",{style:{fontSize:9,color:p.fg,opacity:.7,maxWidth:160,lineHeight:1.4}},profile.about.slice(0,60)+"…"),h("div",{style:{display:"flex",gap:6,justifyContent:"center",marginTop:4}},h("span",{style:{background:p.accent+"22",color:p.accent,fontSize:8,padding:"2px 8px",borderRadius:10,border:`1px solid ${p.accent}44`}},profile.religion),h("span",{style:{background:p.accent+"22",color:p.accent,fontSize:8,padding:"2px 8px",borderRadius:10,border:`1px solid ${p.accent}44`}},profile.profession.split(" ")[0])));
}
function TemplatePreviewModal({template,profile,onClose,onUse}){
  const{palette:p,font,layout,motifs,name}=template;
  const ff=font==="mono"?"'Courier New',monospace":font==="sans"?"var(--sans)":"var(--serif)";
  return h("div",{className:"modal-overlay",onClick:e=>{if(e.target===e.currentTarget)onClose()},style:{zIndex:1100}},
    h("div",{className:"modal-box",style:{maxWidth:640,background:p.bg,color:p.fg}},
      h("div",{style:{background:p.header,padding:"20px 24px",display:"flex",justifyContent:"space-between",alignItems:"center"}},
        h("div",null,h("div",{style:{fontFamily:ff,fontSize:"1.3rem",color:p.accent,fontWeight:600}},name),h("div",{style:{fontSize:".75rem",color:p.muted,marginTop:2}},template.category+" template")),
        h("div",{style:{display:"flex",gap:8}},
          h("button",{onClick:()=>window.print(),style:{background:p.accent+"22",border:`1px solid ${p.accent}44`,color:p.accent,padding:"7px 14px",borderRadius:20,fontSize:".78rem",cursor:"pointer"}},"⎙ PDF"),
          h("button",{onClick:onUse,style:{background:p.accent,color:p.bg,border:"none",padding:"8px 20px",borderRadius:20,fontSize:".85rem",fontWeight:600,cursor:"pointer"}},"Use this template"),
          h("button",{className:"modal-close",onClick:onClose,style:{background:"rgba(255,255,255,.1)",color:p.fg}},"×"))),
      h("div",{style:{padding:"24px",maxHeight:"60vh",overflowY:"auto"}},
        h("div",{style:{background:p.card,border:`1px solid ${p.border}`,borderRadius:12,padding:28,fontFamily:ff}},
          motifs.length>0&&h("div",{style:{display:"flex",justifyContent:"center",gap:12,marginBottom:16,opacity:.6}},motifs.slice(0,2).map((m,i)=>h(Motif,{key:i,type:m,size:36,color:p.accent}))),
          h("div",{style:{textAlign:"center",marginBottom:20}},
            h("div",{style:{width:80,height:80,borderRadius:"50%",background:`linear-gradient(135deg,${p.accent},${p.border})`,display:"flex",alignItems:"center",justifyContent:"center",color:p.bg,fontSize:22,fontWeight:700,fontFamily:ff,border:`3px solid ${p.accent}`,margin:"0 auto 12px"}},(profile.photos||"PS")),
            h("h2",{style:{fontFamily:ff,fontSize:"1.6rem",color:p.accent,margin:"0 0 4px"}},profile.name),
            h("div",{style:{color:p.muted,fontSize:".85rem"}},profile.age+" yrs • "+profile.height+" • "+profile.city)),
          h("div",{style:{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,marginBottom:16}},...[["Religion",profile.religion],["Profession",profile.profession],["City",profile.city],["Age",profile.age+" yrs"],["Height",profile.height],["Diet","Vegetarian"]].map(([k,v])=>h("div",{key:k,style:{padding:"8px 10px",background:p.header,borderRadius:8,border:`1px solid ${p.border}`,textAlign:"center"}},h("div",{style:{fontSize:".6rem",color:p.muted,textTransform:"uppercase",letterSpacing:1,marginBottom:2}},k),h("div",{style:{fontSize:".82rem",fontWeight:600,color:p.fg}},v)))),
          h("div",{style:{marginTop:16,padding:14,background:p.header,borderRadius:8,border:`1px solid ${p.border}`}},h("div",{style:{fontSize:".7rem",color:p.accent,textTransform:"uppercase",letterSpacing:1,marginBottom:6}},"About Me"),h("p",{style:{fontSize:".88rem",lineHeight:1.7,color:p.fg,margin:0}},profile.about))))));
}
function TemplateGallery({onSelectTemplate}){
  const[filter,setFilter]=useState("all");
  const[search,setSearch]=useState("");
  const[favorites,setFavorites]=useState(new Set());
  const[showFavOnly,setShowFavOnly]=useState(false);
  const[recentlyViewed,setRecentlyViewed]=useState([]);
  const[previewTpl,setPreviewTpl]=useState(null);
  const[compareSet,setCompareSet]=useState([]);
  const[showCompare,setShowCompare]=useState(false);
  const[profileIdx,setProfileIdx]=useState(0);
  const[skeleton,setSkeleton]=useState(true);
  const[hoveredId,setHoveredId]=useState(null);
  useEffect(()=>{const t=setTimeout(()=>setSkeleton(false),500);return()=>clearTimeout(t);},[]);
  useEffect(()=>{const t=setInterval(()=>setProfileIdx(i=>(i+1)%GALLERY_PROFILES.length),3000);return()=>clearInterval(t);},[]);
  const cats={all:"All",traditional:"Traditional",modern:"Modern",religious:"Religious",premium:"Premium"};
  const counts=useMemo(()=>{const c={all:TEMPLATES.length};TEMPLATES.forEach(t=>{c[t.category]=(c[t.category]||0)+1;});return c;},[]);
  const filtered=useMemo(()=>{const q=search.toLowerCase();return TEMPLATES.filter(t=>{if(filter!=="all"&&t.category!==filter)return false;if(showFavOnly&&!favorites.has(t.id))return false;if(q&&!t.name.toLowerCase().includes(q)&&!t.category.includes(q))return false;return true;});},[filter,search,favorites,showFavOnly]);
  function openPreview(tpl){setPreviewTpl(tpl);setRecentlyViewed(r=>[tpl,...r.filter(x=>x.id!==tpl.id)].slice(0,4));}
  function toggleFav(id,e){e.stopPropagation();setFavorites(s=>{const n=new Set(s);n.has(id)?n.delete(id):n.add(id);return n;});}
  function toggleCompare(id,e){e.stopPropagation();setCompareSet(s=>{if(s.includes(id))return s.filter(x=>x!==id);if(s.length>=3)return s;return[...s,id];});}
  function surpriseMe(){openPreview(TEMPLATES[Math.floor(Math.random()*TEMPLATES.length)]);}
  function useTemplate(tpl){setPreviewTpl(null);if(onSelectTemplate)onSelectTemplate(tpl);}
  const curProfile=GALLERY_PROFILES[profileIdx];
  return h("div",{id:"template-gallery",style:{background:"var(--ivory-2)",padding:"56px 0 80px"}},
    h("div",{className:"container"},
      h("div",{style:{display:"flex",justifyContent:"space-between",alignItems:"flex-end",flexWrap:"wrap",gap:16,marginBottom:32}},
        h("div",null,
          h("div",{style:{fontSize:".75rem",color:"var(--text-3)",letterSpacing:".15em",textTransform:"uppercase",marginBottom:6}},"Vivah ✦ Designs"),
          h("h2",{style:{fontFamily:"var(--serif)",fontSize:"clamp(1.8rem,4vw,3rem)",color:"var(--rose-deep)",margin:0}},"Choose Your Biodata Design"),
          h("p",{style:{color:"var(--text-3)",marginTop:8,maxWidth:480}},"Every design is a live preview — pick one and your biodata comes out in that style.")),
        h("div",{style:{display:"flex",gap:8,flexWrap:"wrap"}},
          h("button",{onClick:surpriseMe,style:{padding:"9px 20px",border:"1.5px solid var(--rose)",color:"var(--rose)",borderRadius:20,background:"none",fontSize:".85rem",cursor:"pointer",fontWeight:500}},"✦ Surprise me"),
          compareSet.length>=2&&h("button",{onClick:()=>setShowCompare(true),style:{padding:"9px 20px",background:"var(--rose)",color:"#fff",border:"none",borderRadius:20,fontSize:".85rem",cursor:"pointer",fontWeight:500}},`Compare (${compareSet.length})`))),
      recentlyViewed.length>0&&h("div",{style:{marginBottom:24}},
        h("div",{style:{fontSize:".72rem",color:"var(--text-3)",textTransform:"uppercase",letterSpacing:".08em",marginBottom:8}},"Recently viewed"),
        h("div",{style:{display:"flex",gap:10,overflowX:"auto",paddingBottom:4}},recentlyViewed.map(t=>h("button",{key:t.id,onClick:()=>openPreview(t),style:{flexShrink:0,padding:"6px 14px",borderRadius:20,border:`1.5px solid ${t.palette.accent}`,background:t.palette.bg,color:t.palette.accent,fontSize:".78rem",cursor:"pointer",fontWeight:500}},t.name)))),
      h("div",{style:{display:"flex",gap:8,flexWrap:"wrap",alignItems:"center",marginBottom:20}},
        Object.entries(cats).map(([k,l])=>h("button",{key:k,onClick:()=>setFilter(k),style:{padding:"7px 16px",borderRadius:20,border:`1px solid ${filter===k?"var(--rose)":"var(--border-2)"}`,background:filter===k?"var(--rose)":"transparent",color:filter===k?"#fff":"var(--text-2)",fontSize:".82rem",cursor:"pointer",fontWeight:filter===k?500:400,transition:"all .15s"}},`${l} (${counts[k]||0})`)),
        h("div",{style:{marginLeft:"auto",display:"flex",gap:8,alignItems:"center"}},
          h("div",{style:{position:"relative"}},
            h("input",{type:"text",placeholder:"Search…",value:search,onChange:e=>setSearch(e.target.value),style:{padding:"7px 36px 7px 12px",border:"1px solid var(--border-2)",borderRadius:20,fontSize:".82rem",background:"var(--ivory)",color:"var(--text)",width:140}}),
            h("span",{style:{position:"absolute",right:10,top:"50%",transform:"translateY(-50%)",color:"var(--text-3)",pointerEvents:"none"}},"⌕")),
          favorites.size>0&&h("button",{onClick:()=>setShowFavOnly(f=>!f),style:{padding:"7px 14px",borderRadius:20,border:`1px solid ${showFavOnly?"var(--rose)":"var(--border-2)"}`,background:showFavOnly?"var(--rose-light)":"transparent",color:showFavOnly?"var(--rose)":"var(--text-3)",fontSize:".78rem",cursor:"pointer"}},`♥ ${favorites.size}`))),
      skeleton?
        h("div",{style:{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))",gap:20}},Array.from({length:6}).map((_,i)=>h("div",{key:i,style:{height:280,borderRadius:12,background:"linear-gradient(90deg,var(--border) 25%,var(--ivory) 50%,var(--border) 75%)",backgroundSize:"200% 100%",animation:"shimmer 1.2s infinite"}}))) :
      filtered.length===0?
        h("div",{style:{textAlign:"center",padding:"64px 0",color:"var(--text-3)"}},h("div",{style:{fontSize:"2.5rem",marginBottom:12}},"✦"),h("div",{style:{fontSize:"1.1rem",fontFamily:"var(--serif)",color:"var(--rose-deep)",marginBottom:6}},showFavOnly?"No favourites yet":"No templates match"),h("button",{onClick:()=>{setSearch("");setFilter("all");setShowFavOnly(false);},style:{marginTop:16,padding:"8px 20px",background:"var(--rose)",color:"#fff",border:"none",borderRadius:20,cursor:"pointer",fontSize:".85rem"}},"Clear filters")):
        h("div",{style:{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))",gap:20}},
          ...filtered.map(tpl=>{
            const isHov=hoveredId===tpl.id,isFav=favorites.has(tpl.id),inCmp=compareSet.includes(tpl.id);
            return h("div",{key:tpl.id,style:{borderRadius:12,overflow:"hidden",border:`1px solid ${tpl.featured?"var(--rose-mid)":"var(--border)"}`,boxShadow:tpl.featured?"0 0 0 2px var(--rose-mid),var(--shadow-lg)":"var(--shadow)",cursor:"pointer",transition:"transform .25s,box-shadow .25s",transform:isHov?"translateY(-5px)":"translateY(0)"},onClick:()=>openPreview(tpl),onMouseEnter:()=>setHoveredId(tpl.id),onMouseLeave:()=>setHoveredId(null)},
              h("div",{style:{height:200,overflow:"hidden",position:"relative"}},
                h("div",{style:{transform:"scale(.55) translateY(-40%)",transformOrigin:"top center",width:"182%",marginLeft:"-41%",pointerEvents:"none"}},h(MiniPreview,{template:tpl,profile:curProfile})),
                isHov&&h("div",{style:{position:"absolute",inset:0,background:"rgba(0,0,0,.55)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:8}},
                  h("button",{onClick:e=>{e.stopPropagation();openPreview(tpl);},style:{padding:"8px 20px",background:"var(--rose)",color:"#fff",border:"none",borderRadius:20,fontSize:".82rem",fontWeight:500,cursor:"pointer"}},"Preview"),
                  h("button",{onClick:e=>{e.stopPropagation();useTemplate(tpl);},style:{padding:"8px 20px",background:"rgba(255,255,255,.15)",color:"#fff",border:"1.5px solid rgba(255,255,255,.4)",borderRadius:20,fontSize:".82rem",cursor:"pointer"}},"Use Template")),
                tpl.featured&&h("div",{style:{position:"absolute",top:8,left:8,background:"var(--rose)",color:"#fff",fontSize:".65rem",padding:"2px 8px",borderRadius:10,fontWeight:600}},"Featured")),
              h("div",{style:{padding:"12px 16px",background:"var(--card)",borderTop:"1px solid var(--border)",display:"flex",justifyContent:"space-between",alignItems:"center"}},
                h("div",null,h("div",{style:{fontWeight:600,fontSize:".9rem",color:"var(--text)"}},tpl.name),h("div",{style:{fontSize:".7rem",color:"var(--text-3)",marginTop:1}},tpl.category.charAt(0).toUpperCase()+tpl.category.slice(1))),
                h("div",{style:{display:"flex",gap:8}},
                  h("button",{onClick:e=>toggleCompare(tpl.id,e),style:{width:28,height:28,borderRadius:6,border:`1px solid ${inCmp?"var(--rose)":"var(--border)"}`,background:inCmp?"var(--rose-light)":"transparent",color:inCmp?"var(--rose)":"var(--text-3)",fontSize:".7rem",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"},title:"Compare"},"⇆"),
                  h("button",{onClick:e=>toggleFav(tpl.id,e),style:{width:28,height:28,borderRadius:"50%",border:`1px solid ${isFav?"var(--rose)":"var(--border)"}`,background:isFav?"var(--rose-light)":"transparent",color:isFav?"var(--rose)":"var(--text-3)",fontSize:".9rem",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"},title:"Favourite"},isFav?"♥":"♡"))));
          })),
      previewTpl&&h(TemplatePreviewModal,{template:previewTpl,profile:curProfile,onClose:()=>setPreviewTpl(null),onUse:()=>useTemplate(previewTpl)}),
      showCompare&&compareSet.length>=2&&h("div",{className:"modal-overlay",onClick:e=>{if(e.target===e.currentTarget)setShowCompare(false)},style:{zIndex:1200}},
        h("div",{className:"modal-box",style:{maxWidth:900}},
          h("div",{className:"modal-header"},h("h3",{style:{fontFamily:"var(--serif)",color:"var(--rose-deep)"}},`Comparing ${compareSet.length} templates`),h("button",{className:"modal-close",onClick:()=>setShowCompare(false)},"×")),
          h("div",{className:"modal-body",style:{display:"grid",gridTemplateColumns:`repeat(${compareSet.length},1fr)`,gap:16}},
            compareSet.map(id=>{const t=TEMPLATES.find(x=>x.id===id);if(!t)return null;return h("div",{key:id,style:{border:`1px solid ${t.palette.border}`,borderRadius:10,overflow:"hidden"}},h("div",{style:{height:200,overflow:"hidden"}},h("div",{style:{transform:"scale(.55) translateY(-40%)",transformOrigin:"top center",width:"182%",marginLeft:"-41%",pointerEvents:"none"}},h(MiniPreview,{template:t,profile:curProfile}))),h("div",{style:{padding:"10px 14px",background:t.palette.bg,color:t.palette.fg}},h("div",{style:{fontWeight:600,color:t.palette.accent,marginBottom:4}},t.name),h("button",{onClick:()=>{setShowCompare(false);useTemplate(t);},style:{width:"100%",padding:"7px",background:t.palette.accent,color:t.palette.bg,border:"none",borderRadius:8,cursor:"pointer",fontSize:".8rem",fontWeight:600}},"Use this")));})))))
  );
}


function App(){
  const [tab,setTab]=useState("browse");
  const [selectedTemplate,setSelectedTemplate]=useState(null);
  const [editing,setEditing]=useState(false);
  const [showWelcome,setShowWelcome]=useState(true);
  const [toastMsg,setToastMsg]=useState(null);
  const [quoteIdx,setQuoteIdx]=useState(0);
  const [lang,setLang]=useState("en");
  const [counters,setCounters]=useState({profiles:0,matches:0,weddings:0});
  const [viewProfile,setViewProfile]=useState(null);
  const [saveTarget,setSaveTarget]=useState(null);
  const [showCompare,setShowCompare]=useState(false);
  const [showLogin,setShowLogin]=useState(false);
  const be=useBackend();
  const toast=useCallback((msg,type="info")=>setToastMsg({msg,type,key:Date.now()}),[]);
  const [compareSet,toggleCompare]=useCompare(toast);

  useEffect(()=>{const t=setInterval(()=>setQuoteIdx(i=>(i+1)%QUOTES.length),6000);return()=>clearInterval(t);},[]);
  useEffect(()=>{
    const T={profiles:50000,matches:180000,weddings:12400};let f=0;
    const id=setInterval(()=>{f++;const e=1-Math.pow(1-Math.min(f/60,1),3);
      setCounters({profiles:Math.round(T.profiles*e),matches:Math.round(T.matches*e),weddings:Math.round(T.weddings*e)});if(f>=60)clearInterval(id);},25);
    return()=>clearInterval(id);
  },[]);

  const myProfile=useMemo(()=>be.myRaw?{...fromMember(be.myRaw),mine:true}:null,[be.myRaw]);
  const profiles=useMemo(()=>[
    ...(myProfile?[myProfile]:[]),
    ...be.members.filter(m=>m._uid!==be.uid).map(fromMember),
    ...SAMPLE_PROFILES],[be.members,be.uid,myProfile]);
  const openLogin=useCallback(()=>setShowLogin(true),[]);
  const view=useCallback(p=>setViewProfile(p),[]);
  const openSave=useCallback(p=>setSaveTarget(p),[]);
  const ctx=useMemo(()=>({...be,openLogin,toast,compareSet,toggleCompare,view,openSave,me:myProfile}),[be,openLogin,toast,compareSet,toggleCompare,view,openSave,myProfile]);
  const compareProfiles=compareSet.map(i=>profiles.find(p=>pid(p)===i)).filter(Boolean);

  const go=t=>{setTab(t);setEditing(false);window.scrollTo({top:document.getElementById("main").offsetTop-60,behavior:"smooth"});};
  const startCreate=()=>{
    setShowWelcome(false);
    if(!be.loggedIn){setShowLogin(true);return;}
    setTab("me");setEditing(true);
    setTimeout(()=>window.scrollTo({top:document.getElementById("main").offsetTop-60,behavior:"smooth"}),50);
  };

  const L={en:{create:"Create your biodata",edit:"Edit my biodata",browse:"Browse",designs:"Designs",saved:"Saved",me:"My profile",title:"Find your life partner",sub:"A thoughtful matrimonial platform that respects faith, family, and individuality."},
           hi:{create:"अपना बायोडाटा बनाएं",edit:"बायोडाटा संपादित करें",browse:"प्रोफ़ाइल",designs:"डिज़ाइन",saved:"सहेजे गए",me:"मेरी प्रोफ़ाइल",title:"अपना जीवनसाथी खोजें",sub:"विश्वास, परिवार और व्यक्तित्व का सम्मान करने वाला विवाह मंच।"}}[lang];

  const initialForm=be.myRaw?{...be.myRaw,...(be.contact||{})}:{name:(be.me&&be.me.name)||""};

  return h("div",null,
    showWelcome&&h("div",{className:"modal-overlay",style:{zIndex:2000},onClick:e=>{if(e.target===e.currentTarget){setShowWelcome(false);}}},
      h("div",{className:"modal-box",style:{maxWidth:500}},
        h("div",{className:"welcome-art",style:{position:"relative"}},
          h("button",{className:"modal-close",style:{position:"absolute",top:12,right:12,background:"rgba(255,255,255,.15)",border:"none",color:"#fff"},onClick:()=>setShowWelcome(false),"aria-label":"Close"},"×"),
          h("h2",null,"Welcome to Vivah ✦"),h("p",null,"Matrimonial biodata, crafted with care.")),
        h("div",{className:"welcome-body"},
          h("p",{style:{fontSize:".88rem",color:"var(--text-2)",marginBottom:14}},be.ready?(be.loggedIn?`Signed in${be.me&&be.me.name?" as "+be.me.name:""}. Your profile and saved lists sync to your account.`:"You're browsing signed out. Sign in with your email to publish a biodata and keep saved lists."):"Checking your account…"),
          h("ul",{className:"feature-list"},
            [["✦","Publish a biodata and edit it any time"],["◈","Save profiles into your own collections"],["⊛","Religion-specific fields across 9 faiths"],["⇆","Compare up to 3 profiles side by side"],["⎙","Print-ready A4 biodata"]].map(([i,t],k)=>
              h("li",{key:k},h("div",{className:"feature-icon",style:{color:"var(--rose)"}},i),t))),
          h("div",{style:{display:"flex",gap:10}},
            h("button",{className:"btn-primary",style:{flex:1,borderRadius:10},onClick:startCreate},myProfile?L.edit:L.create),
            h("button",{style:{flex:1,border:"1px solid var(--border-2)",borderRadius:10,padding:"10px 0",fontSize:".88rem",color:"var(--text-2)"},onClick:()=>{setShowWelcome(false);go("browse");}},L.browse))))),

    h("div",{className:"hero"},h("div",{style:{position:"relative",zIndex:1}},
      h("div",{style:{fontSize:".8rem",color:"rgba(255,255,255,.4)",letterSpacing:".15em",textTransform:"uppercase",marginBottom:16}},"Vivah ✦ Matrimonial"),
      h("h1",{className:"hero-title"},L.title.split(" ").slice(0,3).join(" ")," ",h("span",null,L.title.split(" ").slice(3).join(" "))),
      h("p",{className:"hero-sub"},L.sub),
      h("div",{className:"hero-stats"},
        [["profiles","Verified profiles"],["matches","Matches made"],["weddings","Weddings"]].map(([k,l])=>h("div",{key:k,className:"hero-stat"},h("div",{className:"num"},counters[k].toLocaleString()+"+"),h("div",{className:"lbl"},l)))),
      h("div",{className:"hero-btns"},
        h("button",{className:"btn-primary",onClick:startCreate},(myProfile?L.edit:L.create)+" ✦"),
        h("button",{className:"btn-outline",onClick:()=>go("browse")},L.browse+" →")))),

    h("div",{className:"quote-banner","aria-live":"polite"},`"${QUOTES[quoteIdx].q}"`,h("span",null,QUOTES[quoteIdx].a)),

    h("nav",{className:"topnav"},
      h("div",{className:"container topnav-in"},
        h("div",{className:"brand"},"Vivah ✦"),
        h("div",{className:"nav-tabs",role:"tablist"},
          [["browse",L.browse],["designs",L.designs],["saved",L.saved+(be.saved.all.length?` (${be.saved.all.length})`:"")],["me",L.me]].map(([k,l])=>
            h("button",{key:k,role:"tab","aria-selected":tab===k,className:`nav-tab ${tab===k?"active":""}`,onClick:()=>go(k)},l))),
        h("div",{className:"acct"},
          h("button",{className:"lang-btn",onClick:()=>setLang(l=>l==="en"?"hi":"en"),style:{minWidth:52,flexShrink:0}},lang==="en"?"हिन्दी":"EN"),
          be.loggedIn?h(React.Fragment,null,h("div",{className:"acct-chip",title:be.me.email},h(Avatar,{initials:initialsOf(be.me.name),color:"#b5485a",size:26}),h("span",null,be.me.name)),
            h("button",{className:"lang-btn",onClick:async()=>{await be.signOut();toast("Signed out","info");}},"Sign out")):
          h("button",{className:"btn-next",style:{padding:"7px 16px",flexShrink:0},onClick:()=>setShowLogin(true)},be.ready?"Sign in":"…")))),

    h("div",{id:"main",className:"section",style:{background:"var(--ivory-2)",minHeight:400}},
      h("div",{className:"container"},
        tab==="designs"&&h(TemplateGallery,{onSelectTemplate:t=>{setSelectedTemplate(t);setTab("me");setEditing(true);setTimeout(()=>window.scrollTo({top:document.getElementById("main").offsetTop-60,behavior:"smooth"}),50);}}),
        tab==="browse"&&h(React.Fragment,null,h("h2",{className:"section-title"},"Browse profiles"),h("p",{className:"section-sub"},be.loggedIn?"Members and curated sample profiles. Save the ones you like into collections.":"Sample profiles shown. Sign in to see real member profiles."),h(DirectorySection,{profiles,ctx})),
        tab==="saved"&&h(React.Fragment,null,h("h2",{className:"section-title"},"Saved"),h("p",{className:"section-sub"},"Private to you. Organise profiles into collections like Shortlist or Family review."),h(SavedView,{profiles,ctx})),
        tab==="me"&&h(React.Fragment,null,
          h("h2",{className:"section-title"},editing?(myProfile?"Edit your biodata":"Create your biodata"):"My profile"),
          editing?(be.ready&&!be.loggedIn?h(MyProfileView,{ctx,myProfile}):
            h(Wizard,{key:be.myRaw?"edit":"new",initial:initialForm,editing:!!myProfile,onToast:toast,uploadPhoto:be.uploadPhoto,selectedTemplate,onCancel:()=>setEditing(false),
              onSubmit:async d=>{await be.saveProfile(d);setEditing(false);}})):
          h(MyProfileView,{ctx,myProfile,onEdit:()=>setEditing(true),onCreate:()=>setEditing(true)})))),

    h("div",{className:"stats-strip"},h("div",{className:"stats-strip-grid"},
      [{n:"9",l:"Faith communities"},{n:"30+",l:"Cities"},{n:String(be.members.length),l:"Members here"},{n:"Free",l:"Always"}].map(({n,l})=>h("div",{key:l,className:"stat-block"},h("div",{className:"n"},n),h("div",{className:"l"},l))))),

    h("div",{className:"testimonials"},h("div",{style:{maxWidth:1100,margin:"0 auto"}},
      h("h2",{style:{fontSize:"clamp(1.5rem,3vw,2.2rem)",textAlign:"center",marginBottom:"0.4rem"}},"Stories of togetherness"),
      h("p",{style:{textAlign:"center",color:"rgba(255,255,255,.45)",fontSize:".88rem",marginBottom:32}},"Illustrative stories."),
      h("div",{className:"test-grid"},...TESTIMONIALS.map((t,i)=>h("div",{key:i,className:"test-card"},
        h("div",{className:"test-hearts"},"♥ ♥ ♥ ♥ ♥"),h("p",{className:"test-quote"},'"',t.quote,'"'),h("div",{className:"test-names"},t.names),h("div",{className:"test-city"},t.city)))))),

    h("footer",{style:{background:"var(--ivory-2)",padding:"32px 24px 100px",textAlign:"center",borderTop:"1px solid var(--border)"}},
      h("div",{style:{fontFamily:"var(--serif)",fontSize:"1.4rem",color:"var(--rose-deep)",marginBottom:6}},"Vivah ✦"),
      h("p",{style:{fontSize:".78rem",color:"var(--text-3)",maxWidth:420,margin:"0 auto"}},"Sample profiles are fictional. Member profiles are visible only to signed-in members; contact details and saved lists stay private to you.")),

    !(tab==="me"&&editing)&&h("div",{className:"float-cta"},h("button",{onClick:startCreate},myProfile?L.edit:L.create)),

    compareSet.length>=2&&h("div",{className:"compare-bar"},
      h("span",{style:{fontSize:".82rem",opacity:.6}},compareSet.length+" selected"),
      h("div",{className:"compare-items"},compareProfiles.map(p=>h("div",{key:pid(p),className:"compare-chip"},p.name.split(" ")[0],h("button",{onClick:()=>toggleCompare(pid(p)),"aria-label":"Remove"},"×")))),
      h("button",{className:"btn-compare-go",onClick:()=>setShowCompare(true)},"Compare →")),

    viewProfile&&h(ProfileModal,{profile:viewProfile,onClose:()=>setViewProfile(null),isSaved:be.saved.all.includes(pid(viewProfile)),onSave:setSaveTarget}),
    saveTarget&&h(SaveSheet,{profile:saveTarget,saved:be.saved,onChange:be.writeSaved,onClose:()=>setSaveTarget(null),onToast:toast,loggedIn:be.loggedIn}),
    showCompare&&compareProfiles.length>=2&&h(CompareModal,{profiles:compareProfiles,onClose:()=>setShowCompare(false)}),
    showLogin&&h(LoginModal,{onClose:()=>setShowLogin(false),signIn:be.signIn,configured:be.configured}),
    toastMsg&&h(Toast,{key:toastMsg.key,msg:toastMsg.msg,type:toastMsg.type,onDone:()=>setToastMsg(null)})
  );
}

createRoot(document.getElementById("root")).render(h(App));
