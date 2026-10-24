const menuButton = document.querySelector(".menu-toggle");
const navigation = document.querySelector(".nav-links");

menuButton?.addEventListener("click", () => {
  const isOpen = menuButton.getAttribute("aria-expanded") === "true";
  menuButton.setAttribute("aria-expanded", String(!isOpen));
  menuButton.setAttribute("aria-label", isOpen ? "開啟選單" : "關閉選單");
  navigation?.classList.toggle("is-open", !isOpen);
});

navigation?.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    menuButton?.setAttribute("aria-expanded", "false");
    menuButton?.setAttribute("aria-label", "開啟選單");
    navigation.classList.remove("is-open");
  });
});

const privacyDisclosure = document.querySelector("#privacy");
const footerPrivacyLink = document.querySelector(".footer-privacy-link");

if (privacyDisclosure instanceof HTMLDetailsElement) {
  privacyDisclosure.addEventListener("toggle", () => {
    footerPrivacyLink?.setAttribute("aria-expanded", String(privacyDisclosure.open));
  });

  footerPrivacyLink?.addEventListener("click", (event) => {
    event.preventDefault();
    privacyDisclosure.open = true;
    privacyDisclosure.scrollIntoView({ behavior: "smooth", block: "start" });
    privacyDisclosure.querySelector("summary")?.focus({ preventScroll: true });
  });

  if (window.location.hash === "#privacy") {
    privacyDisclosure.open = true;
    requestAnimationFrame(() => privacyDisclosure.scrollIntoView({ block: "start" }));
  }
}

const listeningCat = document.querySelector(".listening-cat .cat-still");
const catMessage = document.querySelector("#cat-message");

if (catMessage) {
  const warmMessages = [
    "今天也辛苦了，先好好抱抱自己。",
    "不用急著變好，現在的你也很珍貴。",
    "累了就歇一會兒，我陪你聽聽心事。",
    "心情沒有對錯，讓它慢慢停靠也可以。",
    "今天不必完美，平安走到這裡就很好。",
    "每一步都算數，慢一點也沒關係。",
    "你值得被理解，也值得被好好照顧。",
    "把別人的期待放一旁，聽聽自己的聲音。",
    "不管今天如何，都記得留一點溫柔給自己。",
    "願你心裡的小雨，慢慢等到晴天。",
    "你已經很努力了，接下來也讓我陪著你。",
    "先深呼吸吧，答案可以慢慢來。",
  ];

  try {
    const storageKey = "emilyTarotLastCatMessage";
    const previousValue = window.localStorage.getItem(storageKey);
    const previousIndex = previousValue === null ? -1 : Number(previousValue);
    let nextIndex = Math.floor(Math.random() * warmMessages.length);
    if (warmMessages.length > 1 && nextIndex === previousIndex) {
      nextIndex = (nextIndex + 1 + Math.floor(Math.random() * (warmMessages.length - 1))) % warmMessages.length;
    }
    catMessage.textContent = warmMessages[nextIndex];
    window.localStorage.setItem(storageKey, String(nextIndex));
  } catch {
    catMessage.textContent = warmMessages[Math.floor(Math.random() * warmMessages.length)];
  }
}

if (listeningCat) {
  const framePaths = [1, 2, 3, 4].map((frame) => `./assets/animations/emily-listening-cat-frame-${frame}.png`);
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let animationTimer;
  let finishWait;
  let animationRun = 0;
  let frameImagesPromise;

  const wait = (duration, run) => new Promise((resolve) => {
    const finish = () => {
      window.clearTimeout(animationTimer);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      if (finishWait === finish) finishWait = null;
      resolve();
    };
    const onVisibilityChange = () => {
      if (document.hidden) {
        window.clearTimeout(animationTimer);
        animationTimer = null;
      } else if (!animationTimer && run === animationRun) {
        animationTimer = window.setTimeout(finish, duration);
      }
    };

    finishWait = finish;
    animationTimer = document.hidden ? null : window.setTimeout(finish, duration);
    document.addEventListener("visibilitychange", onVisibilityChange);
  });
  const randomBetween = (min, max) => Math.round(min + Math.random() * (max - min));

  function preloadFrames() {
    if (!frameImagesPromise) {
      frameImagesPromise = Promise.all(framePaths.map(async (src) => {
        const frame = new Image();
        frame.src = src;
        await frame.decode();
        return frame;
      }));
    }
    return frameImagesPromise;
  }

  async function animateListeningCat(run) {
    const frameImages = await preloadFrames();
    let lastAction = "blink";
    while (run === animationRun && !prefersReducedMotion.matches) {
      await wait(randomBetween(5000, 8500), run);
      if (run !== animationRun || document.hidden || prefersReducedMotion.matches) continue;

      const action = lastAction === "blink" ? "listen" : Math.random() < 0.62 ? "blink" : "playful";
      lastAction = action;

      if (action === "blink") {
        listeningCat.src = frameImages[1].src;
        await wait(150, run);
      } else {
        const frameIndex = action === "listen" ? 2 : 3;
        listeningCat.src = frameImages[frameIndex].src;
        await wait(action === "listen" ? randomBetween(850, 1200) : 650, run);
      }

      if (run !== animationRun || document.hidden || prefersReducedMotion.matches) continue;
      listeningCat.src = frameImages[0].src;
    }
  }

  function stopAnimation() {
    animationRun += 1;
    finishWait?.();
    listeningCat.src = framePaths[0];
  }

  function startAnimation() {
    if (document.hidden || prefersReducedMotion.matches) return;
    const run = ++animationRun;
    animateListeningCat(run).catch(() => {
      // Keep the still fallback if an optional animation frame cannot load.
    });
  }

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) stopAnimation();
    else startAnimation();
  });

  prefersReducedMotion.addEventListener("change", () => {
    if (prefersReducedMotion.matches) stopAnimation();
    else startAnimation();
  });

  startAnimation();
}

const tarotCards = [
  // 大阿爾克那
  { file: "00-愚者.webp", name: "0｜愚者", meaning: "新的旅程正等著你。帶著好奇心往前走，也記得留意腳下的路。" },
  { file: "01-魔術師.webp", name: "I｜魔術師", meaning: "你手上已有可以開始的資源。把心力放在最重要的一步，讓想法落地。" },
  { file: "02-女祭司.webp", name: "II｜女祭司", meaning: "先安靜一下，聽聽自己的直覺。答案或許正在心裡慢慢浮現。" },
  { file: "03-女皇.webp", name: "III｜女皇", meaning: "給自己多一點照顧與滋養。當你感到安穩，好的事物也更容易生長。" },
  { file: "04-皇帝.webp", name: "IV｜皇帝", meaning: "建立清楚的界線與計畫，穩穩地推進，會比一味著急更有力量。" },
  { file: "05-教皇.webp", name: "V｜教皇", meaning: "向值得信任的人請益，或回到熟悉的方法，能幫你找到踏實的方向。" },
  { file: "06-戀人.webp", name: "VI｜戀人", meaning: "重要的選擇，試著回到自己的價值與真心。真誠的連結需要彼此理解。" },
  { file: "07-戰車.webp", name: "VII｜戰車", meaning: "釐清想前往的方向，再把分散的心力收攏。你可以帶著決心前進。" },
  { file: "08-力量.webp", name: "VIII｜力量", meaning: "溫柔與耐心也是力量。相信自己能以柔軟的方式，安定眼前的局面。" },
  { file: "09-隱士.webp", name: "IX｜隱士", meaning: "留一點獨處的時間給自己。暫時遠離喧鬧，會更容易聽見真正的需要。" },
  { file: "10-命運之輪.webp", name: "X｜命運之輪", meaning: "變化正在發生。保持彈性，留意新的機會，也接受有些事需要時間。" },
  { file: "11-正義.webp", name: "XI｜正義", meaning: "回到事實與公平，仔細衡量每個選擇。清楚而誠實的決定會帶來平衡。" },
  { file: "12-吊人.webp", name: "XII｜吊人", meaning: "先停一停，換個角度看事情。暫時不急著行動，也可能帶來新的理解。" },
  { file: "13-死神.webp", name: "XIII｜死神", meaning: "一個階段正在告一段落。放下已不合適的部分，才能為新的開始留出空間。" },
  { file: "14-節制.webp", name: "XIV｜節制", meaning: "讓不同的需要慢慢找到平衡。一步一步調整，比急著求結果更適合現在。" },
  { file: "15-惡魔.webp", name: "XV｜惡魔", meaning: "留意讓自己感到受困的習慣或牽掛。看清它之後，你仍能重新選擇。" },
  { file: "16-高塔.webp", name: "XVI｜高塔", meaning: "突如其來的變化也許令人不安，但它能讓不穩固的部分被看見，重新整理。" },
  { file: "17-星星.webp", name: "XVII｜星星", meaning: "希望正在回來。給自己一些休息與信任，慢慢修復，也重新看見可能。" },
  { file: "18-月亮.webp", name: "XVIII｜月亮", meaning: "眼前仍有些不確定，先別急著下結論。照顧情緒，等資訊更清楚一些。" },
  { file: "19-太陽.webp", name: "XIX｜太陽", meaning: "讓喜悅與明朗進到生活裡。看見已經做到的事，也放心享受眼前的好時光。" },
  { file: "20-審判.webp", name: "XX｜審判", meaning: "回望走過的路，聽聽內心正在呼喚什麼。你可以帶著新的理解重新出發。" },
  { file: "21-世界.webp", name: "XXI｜世界", meaning: "一段旅程正逐漸完整。肯定自己的努力，並準備好迎接下一個階段。" },

  // 權杖
  { file: "22-權杖一.webp", name: "權杖一", meaning: "新的靈感或熱情正在萌芽。先做一個小小的開始，讓火花有機會延續。" },
  { file: "23-權杖二.webp", name: "權杖二", meaning: "你已看見新的可能。花點時間規劃方向，再選擇最想踏出的那一步。" },
  { file: "24-權杖三.webp", name: "權杖三", meaning: "努力已經開始往外延伸。保持耐心，留意接下來出現的合作與進展。" },
  { file: "25-權杖四.webp", name: "權杖四", meaning: "值得為一個小小的里程碑慶祝。與支持你的人分享，讓喜悅成為力量。" },
  { file: "26-權杖五.webp", name: "權杖五", meaning: "不同想法交會時，先把焦點放回共同目標。良性的磨合能帶來好點子。" },
  { file: "27-權杖六.webp", name: "權杖六", meaning: "你的努力有機會被看見。大方接受肯定，也記得感謝一路支持你的人。" },
  { file: "28-權杖七.webp", name: "權杖七", meaning: "守住對你重要的原則，同時保留彈性。你不必為每一件事都耗盡力氣。" },
  { file: "29-權杖八.webp", name: "權杖八", meaning: "事情可能開始加快。整理好優先順序，並留意重要訊息與溝通時機。" },
  { file: "30-權杖九.webp", name: "權杖九", meaning: "你已走過不少路，仍有能力完成眼前的事。記得休息，再穩穩地走下一步。" },
  { file: "31-權杖十.webp", name: "權杖十", meaning: "肩上的責任也許太多了。重新分配工作、適時求助，讓前進更輕一些。" },
  { file: "32-權杖侍者.webp", name: "權杖侍者", meaning: "一個新奇的念頭值得探索。用輕鬆的心情試試看，不必一開始就做到完美。" },
  { file: "33-權杖騎士.webp", name: "權杖騎士", meaning: "熱情能推著你前進。行動前稍作確認，讓勇氣與判斷一起上路。" },
  { file: "34-權杖皇后.webp", name: "權杖皇后", meaning: "相信自己的魅力與能力，也用溫暖的方式鼓勵身邊的人。" },
  { file: "35-權杖國王.webp", name: "權杖國王", meaning: "把眼光放遠，帶著清晰的願景採取行動。穩定的帶領能凝聚大家的力量。" },

  // 聖杯
  { file: "36-聖杯一.webp", name: "聖杯一", meaning: "新的情感或靈感正在流動。讓心保持開放，也記得照顧自己的感受。" },
  { file: "37-聖杯二.webp", name: "聖杯二", meaning: "真誠的交流能讓關係更靠近。試著坦白表達，也給對方被理解的空間。" },
  { file: "38-聖杯三.webp", name: "聖杯三", meaning: "友誼與陪伴值得珍惜。找個機會和喜歡的人分享近況與好消息。" },
  { file: "39-聖杯四.webp", name: "聖杯四", meaning: "你可能需要一點時間整理心情。稍微抬頭看看，也許有新的選項正靠近。" },
  { file: "40-聖杯五.webp", name: "聖杯五", meaning: "允許自己為失落感到難過，也別忘了仍在身邊的支持與可能。" },
  { file: "41-聖杯六.webp", name: "聖杯六", meaning: "回憶能帶來溫暖。把過去珍惜的善意帶到現在，也為新的連結留位置。" },
  { file: "42-聖杯七.webp", name: "聖杯七", meaning: "選項很多時，先分辨哪些是真正想要的。從一個可行的小步驟開始。" },
  { file: "43-聖杯八.webp", name: "聖杯八", meaning: "若某件事已無法滿足你，離開或轉向也可以是一種照顧自己的方式。" },
  { file: "44-聖杯九.webp", name: "聖杯九", meaning: "停下來感受已經擁有的滿足。允許自己享受努力累積而來的小幸福。" },
  { file: "45-聖杯十.webp", name: "聖杯十", meaning: "關係中的支持與共享值得珍惜。把心意說出來，讓彼此的連結更溫暖。" },
  { file: "46-聖杯侍者.webp", name: "聖杯侍者", meaning: "用好奇心接住細膩的感受。新的邀請或創意，可能帶來柔軟的驚喜。" },
  { file: "47-聖杯騎士.webp", name: "聖杯騎士", meaning: "跟隨真誠的心意表達善意。浪漫之外，也留意彼此實際的需要。" },
  { file: "48-聖杯皇后.webp", name: "聖杯皇后", meaning: "你的同理心能支持別人，也請為自己的情緒留下一個舒服的界線。" },
  { file: "49-聖杯國王.webp", name: "聖杯國王", meaning: "以成熟而平和的方式面對情緒。溫柔傾聽，也能保持內在的穩定。" },

  // 寶劍
  { file: "50-寶劍一.webp", name: "寶劍一", meaning: "新的理解讓事情更清楚。把想法說明白，並用誠實的資訊做決定。" },
  { file: "51-寶劍二.webp", name: "寶劍二", meaning: "面對兩難時，不必逼自己立刻選邊。先補足資訊，再聽聽內心的傾向。" },
  { file: "52-寶劍三.webp", name: "寶劍三", meaning: "如果心裡有受傷的地方，先承認它、照顧它。你可以慢慢找到修復的方法。" },
  { file: "53-寶劍四.webp", name: "寶劍四", meaning: "休息也是前進的一部分。暫時放下待辦，讓身心恢復一些餘裕。" },
  { file: "54-寶劍五.webp", name: "寶劍五", meaning: "遇到衝突時，想想什麼最值得守護。選擇能帶來長遠安定的溝通方式。" },
  { file: "55-寶劍六.webp", name: "寶劍六", meaning: "你正在離開一段較辛苦的狀態。帶著學到的經驗，慢慢走向平靜。" },
  { file: "56-寶劍七.webp", name: "寶劍七", meaning: "策略與獨立思考能幫上忙，也提醒自己對重要的人保持坦誠。" },
  { file: "57-寶劍八.webp", name: "寶劍八", meaning: "現在的限制或許沒有想像中牢固。試著找一個可信任的人，一起看見可行的出口。" },
  { file: "58-寶劍九.webp", name: "寶劍九", meaning: "擔憂可能在夜裡變得很大。先照顧當下的自己，並把重擔說給信任的人聽。" },
  { file: "59-寶劍十.webp", name: "寶劍十", meaning: "辛苦的一段正在走到盡頭。給自己喘息的空間，再慢慢決定新的方向。" },
  { file: "60-寶劍侍者.webp", name: "寶劍侍者", meaning: "保持好奇並查清事實。多問一個問題，能幫你少一些誤會。" },
  { file: "61-寶劍騎士.webp", name: "寶劍騎士", meaning: "清晰的目標能帶來行動力。說出想法之前，也留意語氣是否保留理解的空間。" },
  { file: "62-寶劍皇后.webp", name: "寶劍皇后", meaning: "用清楚的判斷整理局面。誠實表達界線，並保留對自己與他人的體諒。" },
  { file: "63-寶劍國王.webp", name: "寶劍國王", meaning: "以理性與公平處理問題。把複雜的事拆開來看，會更容易找到重點。" },

  // 錢幣
  { file: "64-錢幣一.webp", name: "錢幣一", meaning: "一個實際的新機會正在成形。先踏出可執行的一步，慢慢累積成果。" },
  { file: "65-錢幣二.webp", name: "錢幣二", meaning: "事情需要重新安排優先順序。保持彈性，在責任與休息之間找平衡。" },
  { file: "66-錢幣三.webp", name: "錢幣三", meaning: "合作能讓成果更完整。清楚交流各自的專長，一起把事情做好。" },
  { file: "67-錢幣四.webp", name: "錢幣四", meaning: "穩定感很重要，但不必緊抓每件事。適度分享與流動也會帶來安全感。" },
  { file: "68-錢幣五.webp", name: "錢幣五", meaning: "感到辛苦時，試著向可信任的人求助。你不需要獨自承擔所有事情。" },
  { file: "69-錢幣六.webp", name: "錢幣六", meaning: "留意付出與接受之間是否平衡。慷慨相助，也要記得照顧自己的需要。" },
  { file: "70-錢幣七.webp", name: "錢幣七", meaning: "成果需要時間熟成。看看目前的進展，再決定哪些努力值得繼續投入。" },
  { file: "71-錢幣八.webp", name: "錢幣八", meaning: "持續練習會讓能力更扎實。把注意力放回手邊的小事，專注做好一件。" },
  { file: "72-錢幣九.webp", name: "錢幣九", meaning: "肯定自己累積的成果。享受獨立與安定，也為生活留一點愉快的餘裕。" },
  { file: "73-錢幣十.webp", name: "錢幣十", meaning: "長久的支持與歸屬感值得珍惜。想想哪些基礎能讓你和重要的人更安穩。" },
  { file: "74-錢幣侍者.webp", name: "錢幣侍者", meaning: "新的實用技能或計畫值得投入。帶著耐心學習，先完成眼前的小目標。" },
  { file: "75-錢幣騎士.webp", name: "錢幣騎士", meaning: "穩定可靠的步伐能累積長遠成果。保持承諾，也別忘了適時調整節奏。" },
  { file: "76-錢幣皇后.webp", name: "錢幣皇后", meaning: "照料生活的同時，也照料自己。善用手邊資源，打造舒服而穩定的日常。" },
  { file: "77-錢幣國王.webp", name: "錢幣國王", meaning: "踏實的規劃能支持長期目標。分享經驗與資源，讓穩定也能照亮身邊的人。" },
];

const classroomGroups = [
  { label: "大阿爾克那", start: 0, end: 21, open: true },
  { label: "權杖", start: 22, end: 35 },
  { label: "聖杯", start: 36, end: 49 },
  { label: "寶劍", start: 50, end: 63 },
  { label: "錢幣", start: 64, end: 77 },
];
const classroomGroupsElement = document.querySelector("#classroom-groups");

if (classroomGroupsElement) {
  const lessonVideoUrls = {
    0: "https://vt.tiktok.com/ZSgS6kSmY/",
    1: "https://vt.tiktok.com/ZSgSXFRHr/",
    2: "https://vt.tiktok.com/ZSgA6oCFG/",
    3: "https://vt.tiktok.com/ZSgD9LeQ8/",
    4: "https://vt.tiktok.com/ZSgDHjVeb/",
    5: "https://vt.tiktok.com/ZSgDHBvVt/",
    6: "https://vt.tiktok.com/ZSgfDMdMc/",
    7: "https://vt.tiktok.com/ZSgfAv85B/",
    8: "https://vt.tiktok.com/ZSgfA3Qnv/",
    9: "https://vt.tiktok.com/ZSgfActjQ/",
    10: "https://vt.tiktok.com/ZSg5VHa1R/",
    11: "https://vt.tiktok.com/ZSg5Vbxxj/",
    12: "https://vt.tiktok.com/ZSg5Vmpo7/",
    13: "https://vt.tiktok.com/ZSg5fX6dd/",
    14: "https://vt.tiktok.com/ZSg5f5XmV/",
    15: "https://vt.tiktok.com/ZSg5fsTdW/",
    16: "https://vt.tiktok.com/ZSgHd8Df2/",
    17: "https://vt.tiktok.com/ZSgHdYnme/",
    18: "https://vt.tiktok.com/ZSgHdhowy/",
  };

  classroomGroups.forEach((group) => {
    const details = document.createElement("details");
    details.className = "classroom-group";
    details.open = Boolean(group.open);

    const summary = document.createElement("summary");
    summary.append(document.createTextNode(group.label));
    const count = document.createElement("span");
    count.className = "classroom-count";
    const cards = tarotCards.filter((card) => {
      const number = Number(card.file.match(/^\d+/)?.[0]);
      return number >= group.start && number <= group.end;
    });
    count.textContent = `${cards.length} 張`;
    summary.append(count);

    const list = document.createElement("div");
    list.className = "classroom-card-list";
    cards.forEach((card) => {
      const number = Number(card.file.match(/^\d+/)?.[0]);
      const title = number <= 21 ? `${number}｜${card.name.split("｜").at(-1)}` : card.name;
      const videoUrl = lessonVideoUrls[number];
      const item = document.createElement(videoUrl ? "a" : "button");
      item.className = "classroom-card";
      if (videoUrl) {
        item.href = videoUrl;
        item.target = "_blank";
        item.rel = "noopener noreferrer";
        item.setAttribute("aria-label", `${title}，在新分頁觀看 Emily 的短影片`);
      } else {
        item.type = "button";
        item.disabled = true;
        item.title = "這張牌的影片準備中";
      }

      const name = document.createElement("span");
      name.textContent = title;
      const badge = document.createElement("span");
      badge.className = "classroom-card-badge";
      badge.textContent = videoUrl ? "▶ 看短片" : "準備中";
      item.append(name, badge);
      list.append(item);
    });

    details.append(summary, list);
    classroomGroupsElement.append(details);
  });
}

const inquiryDialog = document.querySelector("#inquiry-dialog");
const orderLookupDialog = document.querySelector("#order-lookup-dialog");
const orderLookupForm = document.querySelector("#order-lookup-form");
const orderLookupIdentifier = document.querySelector("#order-lookup-identifier");
const orderLookupFeedback = document.querySelector("#order-lookup-feedback");
const orderLookupSubmit = document.querySelector("#lookup-order-submit");
const ORDER_LOOKUP_COOLDOWN_KEY = "emilyTarotOrderLookupNextAt";
const ORDER_LOOKUP_COOLDOWN_MS = 60_000;
const inquiryPlanLabel = document.querySelector("#inquiry-plan-label");
const inquiryOrderForm = document.querySelector("#inquiry-order-form");
const inquiryDetailsForm = document.querySelector("#inquiry-details-form");
const inquiryOrderNumber = document.querySelector("#inquiry-order-number");
const inquiryOrderConfirmed = document.querySelector("#inquiry-order-confirmed");
const inquiryTypeInput = document.querySelector("#inquiry-type");
const inquirySuccess = document.querySelector("#inquiry-success");
const inquiryOrderFeedback = document.querySelector("#inquiry-order-feedback");
const inquirySubmitFeedback = document.querySelector("#inquiry-submit-feedback");
const inquiryMathQuestion = document.querySelector("#inquiry-math-question");
const inquiryMathAnswer = document.querySelector("#inquiry-math-answer");
const verifyOrderButton = document.querySelector("#verify-order-button");
const sendInquiryButton = document.querySelector("#send-inquiry-button");
let selectedInquiryType = "";
let inquiryMathChallengeToken = "";
let orderLookupCooldownUntil = 0;
let orderLookupPending = false;
let orderLookupCooldownTimer = null;

function setInquiryBusy(button, busy, busyLabel) {
  if (!button) return;
  button.disabled = busy;
  if (busy) {
    button.dataset.originalLabel = button.textContent;
    button.textContent = busyLabel;
  } else if (button.dataset.originalLabel) {
    button.textContent = button.dataset.originalLabel;
    delete button.dataset.originalLabel;
  }
}

function getOrderLookupCooldownUntil() {
  try {
    return Math.max(orderLookupCooldownUntil, Number(localStorage.getItem(ORDER_LOOKUP_COOLDOWN_KEY)) || 0);
  } catch {
    return orderLookupCooldownUntil;
  }
}

function updateOrderLookupCooldown() {
  const remaining = Math.max(0, getOrderLookupCooldownUntil() - Date.now());
  orderLookupSubmit.disabled = orderLookupPending || remaining > 0;
  orderLookupSubmit.textContent = orderLookupPending
    ? "查詢中…"
    : remaining > 0
      ? `請稍候 ${Math.ceil(remaining / 1000)} 秒`
      : "查詢進度";

  if (remaining <= 0 && orderLookupCooldownTimer) {
    window.clearInterval(orderLookupCooldownTimer);
    orderLookupCooldownTimer = null;
  } else if (remaining > 0 && !orderLookupCooldownTimer) {
    orderLookupCooldownTimer = window.setInterval(updateOrderLookupCooldown, 1000);
  }
}

function startOrderLookupCooldown() {
  orderLookupCooldownUntil = Date.now() + ORDER_LOOKUP_COOLDOWN_MS;
  try {
    localStorage.setItem(ORDER_LOOKUP_COOLDOWN_KEY, String(orderLookupCooldownUntil));
  } catch {
    // Keep the cooldown in memory when browser storage is unavailable.
  }
  updateOrderLookupCooldown();
}

async function sendInquiryRequest(action, body) {
  const response = await fetch(`/api/inquiry/${action}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    credentials: "same-origin",
  });
  let result;
  try {
    result = await response.json();
  } catch {
    throw new Error("SERVICE_UNAVAILABLE");
  }
  if (!response.ok || result.ok !== true) throw new Error(result.code || "SERVICE_UNAVAILABLE");
  return result;
}

function inquiryErrorMessage(code) {
  const messages = {
    ORDER_NOT_ELIGIBLE: "目前無法驗證這筆訂單。請確認編號、訂單狀態與方案門檻，或聯繫 Emily。",
    ALREADY_USED: "這筆訂單已送出過詢問。如需協助，請聯繫 Emily。",
    EMAIL_MISMATCH: "Email 與訂單資料不符，請確認下單時使用的信箱。",
    INVALID_CHALLENGE: "算數答案不正確或已過期，請重新回答後再驗證訂單。",
    INVALID_INPUT: "請檢查欄位內容後再試一次。",
    RATE_LIMITED: "驗證次數較多，請一分鐘後再試。",
    SERVICE_UNAVAILABLE: "詢問服務暫時無法確認結果。若剛才正在送出，請先聯繫 Emily 確認是否收到，避免重複提交。",
  };
  return messages[code] || messages.SERVICE_UNAVAILABLE;
}

document.querySelectorAll("[data-inquiry-type]").forEach((button) => {
  button.addEventListener("click", async () => {
    if (!inquiryDialog || inquiryDialog.open) return;
    selectedInquiryType = button.dataset.inquiryType;
    const threshold = selectedInquiryType === "三張塔羅解讀" ? 300 : 100;
    inquiryPlanLabel.textContent = `${selectedInquiryType}｜需符合已結單且總金額滿 NT$${threshold} 的訂單資格。`;
    inquiryOrderForm.reset();
    inquiryDetailsForm.reset();
    inquiryOrderForm.hidden = false;
    inquiryDetailsForm.hidden = true;
    inquirySuccess.hidden = true;
    inquiryOrderFeedback.textContent = "";
    inquirySubmitFeedback.textContent = "";
    inquiryMathChallengeToken = "";
    inquiryDialog.showModal();
    try {
      const result = await sendInquiryRequest("challenge", {});
      if (!result.challenge?.token) throw new Error("SERVICE_UNAVAILABLE");
      inquiryMathChallengeToken = result.challenge.token;
      inquiryMathQuestion.textContent = `驗證訂單前小確認：${result.challenge.left} + ${result.challenge.right} = ?`;
    } catch (error) {
      inquiryOrderFeedback.textContent = inquiryErrorMessage(error.message);
    }
    window.setTimeout(() => inquiryOrderNumber?.focus(), 0);
  });
});

document.querySelector("#open-order-lookup")?.addEventListener("click", () => {
  if (!orderLookupDialog || orderLookupDialog.open) return;
  orderLookupForm.reset();
  orderLookupFeedback.textContent = "";
  updateOrderLookupCooldown();
  orderLookupDialog.showModal();
  orderLookupIdentifier.focus();
});

document.querySelector("#close-order-lookup")?.addEventListener("click", () => {
  orderLookupDialog?.close();
  inquiryOrderNumber?.focus();
});

orderLookupDialog?.addEventListener("close", () => {
  orderLookupForm?.reset();
  orderLookupFeedback.textContent = "";
});

orderLookupForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!orderLookupForm.reportValidity()) return;

  const identifier = orderLookupIdentifier.value.trim();
  const isOrderNumber = /^EH\d{6}[A-Z0-9]{6}$/i.test(identifier);
  const isPhoneNumber = /^[0-9+()\-\s]{8,20}$/.test(identifier);
  if (!isOrderNumber && !isPhoneNumber) {
    orderLookupFeedback.textContent = "請輸入正確的訂單編號或手機號碼。";
    return;
  }

  if (getOrderLookupCooldownUntil() > Date.now()) {
    updateOrderLookupCooldown();
    return;
  }

  orderLookupFeedback.textContent = "正在查詢訂單…";
  orderLookupPending = true;
  updateOrderLookupCooldown();
  startOrderLookupCooldown();
  try {
    const endpoint = "https://script.google.com/macros/s/AKfycbznfe1QNkopwYdjHJJPHmKdqHovAblVYnm1lajTwpi87aLC1erVkxuyYv9kX-akli6W8w/exec";
    const params = new URLSearchParams({ action: "lookupOrder", identifier, t: String(Date.now()) });
    const response = await fetch(`${endpoint}?${params}`, { cache: "no-store" });
    const result = await response.json();
    if (result.ok && Array.isArray(result.orders)) {
      orderLookupFeedback.textContent = result.orders.length
        ? result.orders.map((order) => `訂單編號：${order.orderNumber}｜目前進度：${order.status}`).join("\n")
        : "目前查無符合的訂單資料，請確認輸入內容。";
    } else {
      orderLookupFeedback.textContent = String(result.error || "查詢失敗，請稍後再試。");
    }
  } catch {
    orderLookupFeedback.textContent = "目前無法查詢，請稍後再試。";
  } finally {
    orderLookupPending = false;
    updateOrderLookupCooldown();
  }
});

window.addEventListener("storage", (event) => {
  if (event.key === ORDER_LOOKUP_COOLDOWN_KEY) updateOrderLookupCooldown();
});

inquiryOrderForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!inquiryOrderForm.reportValidity()) return;
  if (!inquiryMathChallengeToken) {
    inquiryOrderFeedback.textContent = "算數題尚未準備好，請關閉後重新開始。";
    return;
  }
  inquiryOrderFeedback.textContent = "";
  setInquiryBusy(verifyOrderButton, true, "核對中…");
  try {
    const orderNumber = inquiryOrderNumber.value.trim();
    const result = await sendInquiryRequest("verify", {
      orderNumber,
      type: selectedInquiryType,
      challengeToken: inquiryMathChallengeToken,
      challengeAnswer: inquiryMathAnswer.value.trim(),
    });
    inquiryMathChallengeToken = "";
    inquiryOrderConfirmed.value = orderNumber;
    inquiryTypeInput.value = selectedInquiryType;
    inquiryOrderForm.hidden = true;
    inquiryDetailsForm.hidden = false;
    inquiryDetailsForm.querySelector("[name='name']")?.focus();
  } catch (error) {
    inquiryOrderFeedback.textContent = inquiryErrorMessage(error.message);
    inquiryMathChallengeToken = "";
    inquiryMathAnswer.value = "";
    try {
      const result = await sendInquiryRequest("challenge", {});
      if (!result.challenge?.token) throw new Error("SERVICE_UNAVAILABLE");
      inquiryMathChallengeToken = result.challenge.token;
      inquiryMathQuestion.textContent = `驗證訂單前小確認：${result.challenge.left} + ${result.challenge.right} = ?`;
    } catch {
      inquiryOrderFeedback.textContent += " 算數題更新失敗，請關閉後重新開始。";
    }
  } finally {
    setInquiryBusy(verifyOrderButton, false);
  }
});

inquiryDetailsForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!inquiryDetailsForm.reportValidity()) return;
  inquirySubmitFeedback.textContent = "";
  setInquiryBusy(sendInquiryButton, true, "送出中…");
  try {
    const formData = new FormData(inquiryDetailsForm);
    await sendInquiryRequest("submit", {
      orderNumber: inquiryOrderConfirmed.value,
      type: selectedInquiryType,
      name: String(formData.get("name") || "").trim(),
      email: String(formData.get("email") || "").trim(),
      question: String(formData.get("question") || "").trim(),
    });
    inquiryOrderForm.hidden = true;
    inquiryDetailsForm.hidden = true;
    inquirySuccess.hidden = false;
    inquirySuccess.focus();
  } catch (error) {
    inquirySubmitFeedback.textContent = inquiryErrorMessage(error.message);
  } finally {
    setInquiryBusy(sendInquiryButton, false);
  }
});

document.querySelector("#back-to-order")?.addEventListener("click", () => {
  inquiryDetailsForm.hidden = true;
  inquiryOrderForm.hidden = false;
  inquiryMathChallengeToken = "";
  inquirySubmitFeedback.textContent = "";
  inquiryMathAnswer.value = "";
  sendInquiryRequest("challenge", {}).then((result) => {
    if (!result.challenge?.token) throw new Error("SERVICE_UNAVAILABLE");
    inquiryMathChallengeToken = result.challenge.token;
    inquiryMathQuestion.textContent = `驗證訂單前小確認：${result.challenge.left} + ${result.challenge.right} = ?`;
  }).catch((error) => {
    inquiryOrderFeedback.textContent = inquiryErrorMessage(error.message);
  });
  inquiryOrderNumber?.focus();
});

document.querySelector("#cancel-inquiry")?.addEventListener("click", () => inquiryDialog?.close());
document.querySelector("#finish-inquiry")?.addEventListener("click", () => inquiryDialog?.close());
inquiryDialog?.addEventListener("close", () => {
  inquiryOrderForm?.reset();
  inquiryDetailsForm?.reset();
  inquiryOrderForm.hidden = false;
  inquiryDetailsForm.hidden = true;
  inquirySuccess.hidden = true;
  inquiryMathChallengeToken = "";
  inquiryOrderFeedback.textContent = "";
  inquirySubmitFeedback.textContent = "";
  selectedInquiryType = "";
});

const reversedMeanings = new Map([
  // 大阿爾克那
  ["00-愚者.webp", "想開始新事物時，先確認現實條件與安全感。稍作準備，能讓冒險走得更安心。"],
  ["01-魔術師.webp", "心力可能分散，或暫時不太相信自己的能力。先選一件最重要的事，把手邊資源用起來。"],
  ["02-女祭司.webp", "外界聲音可能蓋過內心感受。分辨直覺與焦慮，給自己安靜整理的時間。"],
  ["03-女皇.webp", "你可能太忙著照顧別人，忘了自己的需要。先補充能量，也為付出設下舒服的界線。"],
  ["04-皇帝.webp", "規則或控制感可能太緊，也可能缺少清楚安排。找回有彈性的秩序，讓每個人都有空間。"],
  ["05-教皇.webp", "熟悉的規則未必完全適合現在。理解傳統的用意後，也可以選擇更貼近自己的做法。"],
  ["06-戀人.webp", "關係或選擇中可能出現不一致。先釐清彼此真正重視的事，別只為了避免衝突而決定。"],
  ["07-戰車.webp", "方向或步調有些分散。先停下來重新確認目標，穩住自己再往前，不必硬闖。"],
  ["08-力量.webp", "你可能對自己太嚴格，或把情緒壓得太深。允許脆弱存在，用耐心而非勉強回應。"],
  ["09-隱士.webp", "獨處若變成封閉，試著向可信任的人伸出手；若一直被打擾，也為自己留一點安靜。"],
  ["10-命運之輪.webp", "變化或延遲讓你感到受限。先處理能掌握的小事，保持彈性，等待局勢更明朗。"],
  ["11-正義.webp", "事情可能失去平衡，或有重要資訊尚未看見。檢視事實與自己的立場，再做公平的判斷。"],
  ["12-吊人.webp", "等待可能已經變成停滯。試著換個角度，找出一個小小的行動，讓局面重新流動。"],
  ["13-死神.webp", "你可能還捨不得放下已結束的階段。給自己時間道別，也慢慢整理哪些部分可以留下。"],
  ["14-節制.webp", "生活中有些地方失去平衡，可能太急或太用力。調整步調，回到適合自己的分寸。"],
  ["15-惡魔.webp", "某種習慣或牽掛可能正在消耗你。看清它帶來的影響，從一個可行的小改變找回選擇權。"],
  ["16-高塔.webp", "你也許正在逃避已浮現的問題。先面對可以確認的事實，逐步修補，比勉強維持表面更穩。"],
  ["17-星星.webp", "希望感暫時變得微弱。先照顧身心、完成一件小事，讓信心從日常慢慢長回來。"],
  ["18-月亮.webp", "不安可能讓想像跑在事實前面。先查證資訊、安頓情緒，等看清楚後再做決定。"],
  ["19-太陽.webp", "疲憊或壓力暫時遮住了喜悅。試著找回簡單的樂趣，也肯定自己已做到的部分。"],
  ["20-審判.webp", "你可能拖延回應內心的需要，或對過去過度責備自己。用較寬容的眼光整理經驗，再選擇下一步。"],
  ["21-世界.webp", "一段事情還有未完成的收尾。確認最後需要處理的細節，允許自己完成後好好慶祝。"],

  // 權杖
  ["22-權杖一.webp", "熱情或靈感暫時卡住，也可能同時想做太多事。先清出空間，從最有感的一件小事開始。"],
  ["23-權杖二.webp", "擔心選錯可能讓你遲遲無法決定。把大方向拆成可嘗試的小步驟，邊走邊確認。"],
  ["24-權杖三.webp", "外在進展比預期慢一些。重新檢視計畫與等待的部分，適度調整，而不是只靠著急推動。"],
  ["25-權杖四.webp", "團體或家庭氣氛可能有些緊繃。先照顧彼此的感受，創造一個簡單舒服的相聚時刻。"],
  ["26-權杖五.webp", "競爭或爭辯可能消耗過多心力。放下非贏不可的念頭，回到真正想一起解決的問題。"],
  ["27-權杖六.webp", "肯定或成果可能來得較慢。別把自我價值交給掌聲決定，持續看見自己的努力。"],
  ["28-權杖七.webp", "一直防守可能讓你筋疲力盡。分辨哪些事值得堅持，哪些可以放下，保留力氣給重要目標。"],
  ["29-權杖八.webp", "溝通或進度可能延遲、混亂。確認訊息是否完整，安排好順序，避免急著同時處理所有事。"],
  ["30-權杖九.webp", "累積的疲憊正在提醒你需要休息。暫停不是放棄，先恢復體力再決定要如何繼續。"],
  ["31-權杖十.webp", "責任可能已經超出負荷。重新分工、說出限制，別把所有事情都默默扛在自己身上。"],
  ["32-權杖侍者.webp", "新點子不少，卻可能難以持續。選一個最想試的方向，訂下簡單步驟，讓熱情落地。"],
  ["33-權杖騎士.webp", "衝得太快容易忽略後果。先確認方向與時間，再讓熱情成為穩定的推力。"],
  ["34-權杖皇后.webp", "信心可能暫時下降，或過度迎合他人的期待。重新肯定自己的需求，溫暖也可以帶著界線。"],
  ["35-權杖國王.webp", "領導或計畫可能太強勢，也可能願景尚不清楚。先聽聽團隊與自己的真實需要，再重新定向。"],

  // 聖杯
  ["36-聖杯一.webp", "情緒可能被壓住，或你還沒準備好接納新的感受。給自己安全的空間，慢慢打開心房。"],
  ["37-聖杯二.webp", "關係裡可能有誤會或付出失衡。坦白說出需要，也聽聽對方真正想表達的意思。"],
  ["38-聖杯三.webp", "社交或團體關係可能帶來疲累。留意流言與過度迎合，選擇讓你感到安心的陪伴。"],
  ["39-聖杯四.webp", "冷淡或無聊感可能來自疲倦，也可能是需要改變。先照顧身心，再看看有哪些新選擇。"],
  ["40-聖杯五.webp", "你可能仍困在失落裡。不要急著振作，先看見尚存的支持，讓悲傷有空間慢慢流動。"],
  ["41-聖杯六.webp", "懷舊可能讓過去看起來比現在更美好。珍惜回憶的同時，也把注意力帶回此刻的生活。"],
  ["42-聖杯七.webp", "想像或選項太多，容易讓人失去方向。確認資訊與實際條件，再選擇真正可行的路。"],
  ["43-聖杯八.webp", "害怕改變可能讓你留在不再適合的地方。先釐清內心缺少什麼，再決定是否轉身。"],
  ["44-聖杯九.webp", "短暫滿足可能掩蓋更深的需要。留意過度消費或追求外在肯定，回到真正讓自己安心的事。"],
  ["45-聖杯十.webp", "親近關係可能有未說出口的期待。用平和的方式談談彼此重視的事，重新建立共享感。"],
  ["46-聖杯侍者.webp", "情感表達可能有些猶豫或不成熟。先弄清自己感受，再用簡單真誠的方式說出來。"],
  ["47-聖杯騎士.webp", "理想化的期待可能和現實有落差。欣賞浪漫與善意，也觀察承諾是否落實在行動。"],
  ["48-聖杯皇后.webp", "你可能吸收了太多別人的情緒。溫柔對待自己，分清哪些責任其實不必由你承擔。"],
  ["49-聖杯國王.webp", "情緒可能被壓得太深，或表面平靜、內心起伏。找安全的方式表達，讓感受與理性並存。"],

  // 寶劍
  ["50-寶劍一.webp", "思緒可能混亂，或重要資訊還不完整。暫緩下定論，確認事實後再表達立場。"],
  ["51-寶劍二.webp", "猶豫可能已經拖得太久。補足缺少的資訊，承認自己的顧慮，再選一個能承擔的方向。"],
  ["52-寶劍三.webp", "過去的傷仍在影響現在。不要逼自己立刻原諒或忘記，先尋求支持並照顧自己的界線。"],
  ["53-寶劍四.webp", "你可能一直沒有真正休息，或把休息一再往後延。先安排恢復時間，讓身心有機會回穩。"],
  ["54-寶劍五.webp", "爭執的代價可能高過一時的勝負。適時停戰、澄清或道歉，保護更重要的關係與自己。"],
  ["55-寶劍六.webp", "離開困難狀態的過程可能還有波折。接受陪伴，別要求自己一次就完全放下。"],
  ["56-寶劍七.webp", "逃避或過度防備可能讓事情更複雜。把重要資訊說清楚，選擇坦誠而安全的策略。"],
  ["57-寶劍八.webp", "受限感可能來自某些尚未檢視的想法。找可信任的人一起看看，從一個可行的選擇鬆開困局。"],
  ["58-寶劍九.webp", "焦慮可能把最壞的想像放得很大。回到眼前能確認的事，也向信任的人求助，不必獨自熬著。"],
  ["59-寶劍十.webp", "低潮正在慢慢退去，但復原需要時間。先放下責備，專注於今天能照顧自己的小事。"],
  ["60-寶劍侍者.webp", "急著評論或傳話可能造成誤解。先查證來源與細節，再決定是否分享或回應。"],
  ["61-寶劍騎士.webp", "急於證明觀點可能讓言語太尖銳。放慢一點，確認目標，也給對話留下理解彼此的空間。"],
  ["62-寶劍皇后.webp", "清晰可能變成冷硬，或防備讓你難以靠近別人。保留判斷力，也練習表達柔軟的一面。"],
  ["63-寶劍國王.webp", "過度依賴規則或理性，可能忽略人的感受。重新檢視判斷是否公平，並聽取不同觀點。"],

  // 錢幣
  ["64-錢幣一.webp", "新的計畫可能延遲，或機會還需要更多準備。整理預算與步驟，先打好實際基礎。"],
  ["65-錢幣二.webp", "同時兼顧太多事，讓生活失去平衡。重新排序，必要時婉拒一件暫時不重要的事。"],
  ["66-錢幣三.webp", "合作中的分工或期待可能不一致。把標準、責任與時程說清楚，再一起調整做法。"],
  ["67-錢幣四.webp", "害怕失去可能讓你抓得太緊。確認哪些需要真正保護，也試著讓資源與信任流動。"],
  ["68-錢幣五.webp", "困難時可能不容易開口求助。試著聯絡一位可信任的人，或尋找能實際提供的支持。"],
  ["69-錢幣六.webp", "付出與接受可能不太對等。檢視金錢、時間或情感的交換，清楚表達自己的界線。"],
  ["70-錢幣七.webp", "急著看到成果可能讓你投入錯方向。重新評估目前的方法與回報，決定要調整還是等待。"],
  ["71-錢幣八.webp", "分心或追求完美可能拖慢進度。回到基本功，設定合理標準，持續完成眼前的工作。"],
  ["72-錢幣九.webp", "自我價值可能過度依賴外在成就或他人眼光。看見真正屬於自己的能力與滿足。"],
  ["73-錢幣十.webp", "家庭、團隊或長期安排可能出現不安。從一次坦誠對話開始，重新確認彼此的支持方式。"],
  ["74-錢幣侍者.webp", "學習或計畫可能缺少耐心與實際步驟。回到基礎，把大目標拆成每天能完成的小事。"],
  ["75-錢幣騎士.webp", "一成不變可能讓你停滯，過度固執也會增加負擔。檢視習慣是否仍有用，再調整節奏。"],
  ["76-錢幣皇后.webp", "照顧生活與他人時可能忽略自己。把休息、健康與個人需要也排進日常安排。"],
  ["77-錢幣國王.webp", "對成果或物質安全感的追求可能過了頭。回頭確認真正重要的價值，讓穩定不變成控制。"],
]);

const drawButton = document.querySelector("#draw-card-button");
const drawThreeButton = document.querySelector("#draw-three-button");
const drawAgainButton = document.querySelector("#draw-again-button");
const ritualDialog = document.querySelector("#ritual-dialog");
const startDrawButton = document.querySelector("#start-draw-button");
const cancelRitualButton = document.querySelector("#cancel-ritual-button");
const drawExperience = document.querySelector("#draw-experience");
const exitDrawExperienceButton = document.querySelector("#exit-draw-experience");
const cardFanStage = document.querySelector("#card-fan-stage");
const cardFan = document.querySelector("#card-fan");
const cardFanHint = document.querySelector("#card-fan-hint");
const drawResult = document.querySelector("#draw-result");
const drawImage = document.querySelector("#draw-card-image");
const drawName = document.querySelector("#draw-card-name");
const drawMeaning = document.querySelector("#draw-card-meaning");
const drawPosition = document.querySelector("#draw-card-position");
const drawCardFrame = drawImage?.closest(".draw-card-wrap");
const drawExperienceTitle = document.querySelector("#draw-experience-title");
const drawExperiencePrompt = drawExperience?.querySelector(".draw-experience-copy > p:last-child");
const spreadSlots = document.querySelector("#spread-slots");
const spreadRevealButton = document.querySelector("#spread-reveal-button");
const spreadResult = document.querySelector("#spread-result");
const spreadResultCards = document.querySelector("#spread-result-cards");
const spreadAgainButton = document.querySelector("#spread-again-button");
let previousCardIndex = -1;
let isCardRevealPending = false;
let fanResizeTimer = 0;
let drawMode = "single";
let spreadPicks = [];
const spreadPositions = ["過去", "現在", "未來"];

function shuffleCardIndexes() {
  const indexes = tarotCards.map((_, index) => index);
  for (let index = indexes.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [indexes[index], indexes[swapIndex]] = [indexes[swapIndex], indexes[index]];
  }
  return indexes;
}

function getVisibleFanCount() {
  if (window.innerWidth <= 640) return 15;
  if (window.innerWidth <= 1024) return 29;
  return 39;
}

function renderCardFan() {
  if (!cardFan || !cardFanStage || tarotCards.length === 0) return;
  const pickedIndexes = new Set(spreadPicks.map((pick) => pick.index));
  const availableIndexes = shuffleCardIndexes().filter((index) => drawMode === "three"
    ? !pickedIndexes.has(index)
    : index !== previousCardIndex);
  const visibleIndexes = availableIndexes.slice(0, Math.min(getVisibleFanCount(), availableIndexes.length));
  const fanWidth = cardFanStage.clientWidth || window.innerWidth;
  const fanHeight = cardFanStage.clientHeight || 300;
  const maxOffset = fanWidth * (window.innerWidth <= 640 ? 0.34 : 0.4);
  const maxDrop = window.innerWidth <= 640 ? Math.min(42, fanHeight * 0.16) : Math.min(74, fanHeight * 0.23);
  const middle = (visibleIndexes.length - 1) / 2;

  cardFan.replaceChildren();
  cardFan.classList.remove("has-selection");
  isCardRevealPending = false;

  visibleIndexes.forEach((cardIndex, index) => {
    const normalized = middle === 0 ? 0 : (index - middle) / middle;
    const button = document.createElement("button");
    button.type = "button";
    button.className = "fan-card";
    button.dataset.cardIndex = String(cardIndex);
    button.setAttribute("aria-label", drawMode === "three"
      ? `選擇扇形第 ${index + 1} 張牌，放入${spreadPositions[spreadPicks.length]}`
      : `選擇第 ${index + 1} 張牌`);
    button.style.setProperty("--fan-x", `${normalized * maxOffset}px`);
    button.style.setProperty("--fan-y", `${Math.pow(Math.abs(normalized), 1.7) * maxDrop}px`);
    button.style.setProperty("--fan-angle", `${normalized * 39}deg`);
    button.style.bottom = `${maxDrop}px`;
    button.style.zIndex = String(visibleIndexes.length - Math.round(Math.abs(normalized) * visibleIndexes.length));

    const inner = document.createElement("span");
    inner.className = "fan-card-inner";
    const back = document.createElement("span");
    back.className = "fan-card-back";
    back.setAttribute("aria-hidden", "true");
    inner.append(back);
    button.append(inner);
    button.addEventListener("click", () => {
      if (drawMode === "three") selectSpreadCard(button, cardIndex);
      else revealSelectedCard(button, cardIndex);
    });
    cardFan.append(button);
  });
}

function selectSpreadCard(button, selectedIndex) {
  if (isCardRevealPending || !drawExperience?.open || spreadPicks.length >= spreadPositions.length) return;
  if (!tarotCards[selectedIndex]) return;

  isCardRevealPending = true;
  button.classList.add("is-picked");
  cardFan?.querySelectorAll(".fan-card").forEach((fanCard) => { fanCard.disabled = true; });
  if (cardFanHint) cardFanHint.textContent = `選擇${spreadPositions[spreadPicks.length]}的位置……`;
  const delay = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 520;
  window.setTimeout(() => {
    if (!drawExperience?.open) return;
    spreadPicks.push({ index: selectedIndex, isReversed: Math.random() < 0.5 });
    updateSpreadSlots();
    isCardRevealPending = false;
    if (spreadPicks.length === spreadPositions.length) {
      cardFanStage.hidden = true;
      if (cardFanHint) cardFanHint.textContent = "三張牌已選好，準備翻牌看看。";
      spreadRevealButton.hidden = false;
      spreadRevealButton.focus({ preventScroll: true });
    } else {
      if (cardFanHint) cardFanHint.textContent = `已選 ${spreadPicks.length}/3 張，請憑直覺選擇${spreadPositions[spreadPicks.length]}。`;
      renderCardFan();
      window.requestAnimationFrame(() => cardFan?.querySelector(".fan-card")?.focus({ preventScroll: true }));
    }
  }, delay);
}

function updateSpreadSlots() {
  if (!spreadSlots) return;
  spreadSlots.querySelectorAll(".spread-slot").forEach((slot, index) => {
    slot.classList.toggle("is-filled", Boolean(spreadPicks[index]));
    slot.setAttribute("aria-label", spreadPicks[index]
      ? `${spreadPositions[index]}，已選牌`
      : `${spreadPositions[index]}，待選`);
  });
}

function renderSpreadResult() {
  if (!spreadResultCards) return;
  spreadResultCards.replaceChildren();
  spreadPicks.forEach(({ index, isReversed }, positionIndex) => {
    const card = tarotCards[index];
    const article = document.createElement("article");
    article.className = "spread-reading-card";
    const position = document.createElement("p");
    position.className = "draw-position";
    position.textContent = `${spreadPositions[positionIndex]}・${isReversed ? "逆位" : "正位"}`;
    const frame = document.createElement("div");
    frame.className = "spread-reading-image";
    const image = document.createElement("img");
    image.src = getCardImageUrl(card).href;
    image.alt = `${card.name}${isReversed ? "逆位" : "正位"}，暖暖貓咪塔羅牌`;
    image.classList.toggle("is-reversed", isReversed);
    frame.append(image);
    const title = document.createElement("h4");
    title.textContent = card.name;
    const meaning = document.createElement("p");
    meaning.className = "spread-reading-meaning";
    meaning.textContent = isReversed ? reversedMeanings.get(card.file) : card.meaning;
    article.append(position, frame, title, meaning);
    spreadResultCards.append(article);
  });
}

function revealSpread() {
  if (spreadPicks.length !== spreadPositions.length || !drawExperience?.open) return;
  renderSpreadResult();
  spreadResult.hidden = false;
  drawExperience.classList.add("is-revealed");
  spreadAgainButton?.focus({ preventScroll: true });
}

function getCardImageUrl(card) {
  const cardImageUrl = new URL(`./assets/tarot-cards/${card.file}`, document.baseURI);
  if (["00-愚者.webp", "08-力量.webp", "19-太陽.webp"].includes(card.file)) {
    cardImageUrl.searchParams.set("v", "20261020-1");
  }
  return cardImageUrl;
}

function revealSelectedCard(button, selectedIndex) {
  if (isCardRevealPending || !drawExperience?.open || !Number.isInteger(selectedIndex)) return;
  const card = tarotCards[selectedIndex];
  if (!card) return;

  isCardRevealPending = true;
  const isReversed = Math.random() < 0.5;
  cardFan?.classList.add("has-selection");
  cardFan?.querySelectorAll(".fan-card").forEach((fanCard) => { fanCard.disabled = true; });
  button.classList.add("is-picked");
  if (cardFanHint) cardFanHint.textContent = "牌正在為你揭曉……";

  const front = document.createElement("span");
  front.className = "fan-card-front";
  const image = document.createElement("img");
  image.alt = "";
  image.src = getCardImageUrl(card).href;
  if (isReversed) image.classList.add("is-reversed");
  front.append(image);
  button.querySelector(".fan-card-inner")?.append(front);

  const delay = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 760;
  window.setTimeout(() => {
    if (!drawExperience?.open) return;
    if (cardFanStage) cardFanStage.hidden = true;
    if (cardFanHint) cardFanHint.hidden = true;
    drawExperience.classList.add("is-revealed");
    drawOneCard(selectedIndex, isReversed);
    drawName?.focus({ preventScroll: true });
    isCardRevealPending = false;
  }, delay);
}

function openDrawExperience() {
  if (!drawExperience || !drawButton || !drawThreeButton) return;
  drawButton.hidden = true;
  drawThreeButton.hidden = true;
  drawResult.hidden = true;
  spreadResult.hidden = true;
  spreadPicks = [];
  updateSpreadSlots();
  spreadRevealButton.hidden = true;
  drawExperience.classList.remove("is-revealed");
  drawExperience.classList.toggle("is-three-card", drawMode === "three");
  if (drawExperienceTitle) drawExperienceTitle.textContent = drawMode === "three" ? "抽三張牌" : "抽一張牌";
  if (drawExperiencePrompt) drawExperiencePrompt.textContent = drawMode === "three"
    ? "依序選出三張牌，看看過去、現在與未來的流動。"
    : "看看現在的你，內在狀態如何？";
  if (spreadSlots) spreadSlots.hidden = drawMode !== "three";
  if (cardFan) cardFan.setAttribute("aria-label", drawMode === "three" ? "選擇三張貓咪塔羅牌" : "選擇一張貓咪塔羅牌");
  if (cardFanStage) cardFanStage.hidden = false;
  if (cardFanHint) {
    cardFanHint.hidden = false;
    cardFanHint.textContent = drawMode === "three" ? "先為「過去」憑直覺選一張牌" : "憑直覺，點選一張牌";
  }
  if (!drawExperience.open) drawExperience.showModal();
  renderCardFan();
  window.requestAnimationFrame(() => cardFan?.querySelector(".fan-card")?.focus({ preventScroll: true }));
}

function drawOneCard(selectedIndex, isReversed = Math.random() < 0.5) {
  if (!drawResult || !drawImage || !drawName || !drawMeaning || tarotCards.length === 0) return;

  const availableIndexes = tarotCards.map((_, index) => index).filter((index) => index !== previousCardIndex);
  const resolvedIndex = Number.isInteger(selectedIndex) && selectedIndex !== previousCardIndex
    ? selectedIndex
    : availableIndexes[Math.floor(Math.random() * availableIndexes.length)];
  const card = tarotCards[resolvedIndex];
  if (!card) return;
  previousCardIndex = resolvedIndex;

  drawImage.src = getCardImageUrl(card).href;
  drawImage.alt = `${card.name}${isReversed ? "逆位" : "正位"}，暖暖貓咪塔羅牌`;
  drawCardFrame?.classList.toggle("is-reversed", isReversed);
  drawName.textContent = card.name;
  drawMeaning.textContent = isReversed ? reversedMeanings.get(card.file) : card.meaning;
  if (drawPosition) drawPosition.textContent = isReversed ? "逆位" : "正位";
  drawResult.hidden = false;
  if (drawButton) drawButton.hidden = true;
}

function openRitual(mode = "single") {
  drawMode = mode;
  const ritualTitle = document.querySelector("#ritual-title");
  if (ritualTitle) ritualTitle.textContent = mode === "three" ? "抽三張牌前的小小儀式" : "抽牌前的小小儀式";
  if (startDrawButton) startDrawButton.innerHTML = mode === "three"
    ? "開始抽三張 <span aria-hidden=\"true\">✦</span>"
    : "開始抽 <span aria-hidden=\"true\">✦</span>";
  if (ritualDialog && !ritualDialog.open) ritualDialog.showModal();
}

drawButton?.addEventListener("click", () => openRitual("single"));
drawThreeButton?.addEventListener("click", () => openRitual("three"));
drawAgainButton?.addEventListener("click", () => openRitual("single"));
spreadAgainButton?.addEventListener("click", () => openRitual("three"));
spreadRevealButton?.addEventListener("click", revealSpread);
cancelRitualButton?.addEventListener("click", () => ritualDialog?.close());
startDrawButton?.addEventListener("click", () => {
  if (!ritualDialog?.open) return;
  ritualDialog.close();
  openDrawExperience();
});
exitDrawExperienceButton?.addEventListener("click", () => drawExperience?.close());
drawExperience?.addEventListener("close", () => {
  drawExperience.classList.remove("is-revealed");
  drawResult.hidden = true;
  spreadResult.hidden = true;
  drawButton.hidden = false;
  drawThreeButton.hidden = false;
  drawExperience.classList.remove("is-three-card");
  spreadPicks = [];
  spreadRevealButton.hidden = true;
  if (spreadSlots) spreadSlots.hidden = true;
  if (cardFanStage) cardFanStage.hidden = false;
  if (cardFanHint) cardFanHint.hidden = false;
  isCardRevealPending = false;
  window.setTimeout(() => (drawMode === "three" ? drawThreeButton : drawButton)?.focus({ preventScroll: true }), 0);
});
window.addEventListener("resize", () => {
  if (!drawExperience?.open || cardFanStage?.hidden || isCardRevealPending) return;
  window.clearTimeout(fanResizeTimer);
  fanResizeTimer = window.setTimeout(renderCardFan, 120);
});
