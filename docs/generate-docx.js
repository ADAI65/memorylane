const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
        Header, Footer, AlignmentType, LevelFormat, ExternalHyperlink,
        HeadingLevel, BorderStyle, WidthType, ShadingType, PageNumber, PageBreak } = require('docx');
const fs = require('fs');

const border = { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" };
const borders = { top: border, bottom: border, left: border, right: border };

function h1(text) {
  return new Paragraph({ heading: HeadingLevel.HEADING_1, spacing: { before: 360, after: 200 }, children: [new TextRun(text)] });
}
function h2(text) {
  return new Paragraph({ heading: HeadingLevel.HEADING_2, spacing: { before: 280, after: 160 }, children: [new TextRun(text)] });
}
function h3(text) {
  return new Paragraph({ spacing: { before: 200, after: 120 }, children: [new TextRun({ text, bold: true, size: 24 })] });
}
function p(text) {
  return new Paragraph({ spacing: { after: 120 }, children: [new TextRun(text)] });
}
function bold(text) {
  return new Paragraph({ spacing: { after: 120 }, children: [new TextRun({ text, bold: true })] });
}
function code(text) {
  return new Paragraph({ spacing: { after: 80 }, shading: { fill: "F5F5F5", type: ShadingType.CLEAR },
    indent: { left: 360 }, children: [new TextRun({ text, font: "Courier New", size: 20 })] });
}
function emptyLine() {
  return new Paragraph({ spacing: { after: 60 }, children: [] });
}

function makeTable(headers, rows) {
  const colCount = headers.length;
  const colWidth = Math.floor(9360 / colCount);
  const columnWidths = headers.map(() => colWidth);
  return new Table({
    width: { size: colCount * colWidth, type: WidthType.DXA },
    columnWidths,
    rows: [
      new TableRow({
        children: headers.map(h => new TableCell({
          borders, width: { size: colWidth, type: WidthType.DXA },
          shading: { fill: "1A2E4A", type: ShadingType.CLEAR },
          margins: { top: 80, bottom: 80, left: 120, right: 120 },
          children: [new Paragraph({ children: [new TextRun({ text: h, bold: true, color: "FFFFFF", size: 20 })] })]
        }))
      }),
      ...rows.map(row => new TableRow({
        children: row.map(cell => new TableCell({
          borders, width: { size: colWidth, type: WidthType.DXA },
          margins: { top: 60, bottom: 60, left: 120, right: 120 },
          children: Array.isArray(cell) ? cell : [new Paragraph({ children: [new TextRun({ text: cell, size: 20 })] })]
        }))
      }))
    ]
  });
}

// ─── Doc 1: Brand Kit ───
const brandKit = new Document({
  styles: {
    default: { document: { run: { font: "Arial", size: 22 } } },
    paragraphStyles: [
      { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 32, bold: true, font: "Arial", color: "1A2E4A" },
        paragraph: { spacing: { before: 360, after: 200 }, outlineLevel: 0 } },
      { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 26, bold: true, font: "Arial", color: "D4AF37" },
        paragraph: { spacing: { before: 280, after: 160 }, outlineLevel: 1 } },
    ]
  },
  numbering: {
    config: [{
      reference: "bullets",
      levels: [{ level: 0, format: LevelFormat.BULLET, text: "\u2022", alignment: AlignmentType.LEFT,
        style: { paragraph: { indent: { left: 720, hanging: 360 } } } }]
    }]
  },
  sections: [{
    properties: {
      page: { size: { width: 12240, height: 15840 }, margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 } }
    },
    headers: { default: new Header({ children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: "MemoryLane Brand Kit", color: "999999", size: 18 })] })] }) },
    footers: { default: new Footer({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Page ", size: 18 }), new TextRun({ children: [PageNumber.CURRENT], size: 18 })] })] }) },
    children: [
      h1("MemoryLane \u793E\u5A92\u77E9\u9635\u54C1\u724C\u8D44\u6599\u5305"),
      p("\u54C1\u724C\uFF1AMemoryLane | \u7EDF\u4E00 ID\uFF1A@MemoryLaneAI | \u7F51\u5740\uFF1Amemorylane-web.vercel.app"),
      emptyLine(),

      h2("1. \u5934\u50CF\u89C4\u8303"),
      makeTable(["\u9879\u76EE", "\u8981\u6C42"], [
        ["\u5C3A\u5BF8", "512\u00D7512px\uFF08\u901A\u7528\uFF09\uFF0C\u5BFC\u51FA\u4E3A\u5706\u5F62"],
        ["\u5185\u5BB9", "MemoryLane Logo\uFF08Sparkles \u56FE\u6807 + \u6587\u5B57\uFF09"],
        ["\u4E3B\u8272\u8C03", "\u6DF1\u84DD #1a2e4a\uFF08primary-800\uFF09+ \u91D1\u8272 #d4af37\uFF08gold\uFF09"],
      ]),
      emptyLine(),

      h2("2. \u80CC\u666F\u56FE/\u5C01\u9762\u56FE\u89C4\u8303"),
      makeTable(["\u5E73\u53F0", "\u5C3A\u5BF8", "\u98CE\u683C\u5EFA\u8BAE"], [
        ["Twitter/X Header", "1500\u00D7500px", "\u6DF1\u84DD\u6E10\u53D8 + Before/After \u5BF9\u6BD4"],
        ["YouTube Banner", "2560\u00D71440px", "\u5B89\u5168\u533A 1546\u00D7423"],
        ["Facebook Cover", "820\u00D7312px", "\u6DF1\u84DD + \u91D1\u8272\u6807\u9898"],
      ]),
      emptyLine(),

      h2("3. \u6CE8\u518C\u94FE\u63A5"),
      makeTable(["\u5E73\u53F0", "\u6CE8\u518C\u94FE\u63A5", "\u5907\u6CE8"], [
        ["Twitter/X", "twitter.com/i/flow/signup", "\u4F18\u5148\u62A2\u6CE8\u54C1\u724C\u540D"],
        ["Instagram", "instagram.com/accounts/emailsignup", "\u9700\u624B\u673A\u53F7\u6216\u90AE\u7BB1"],
        ["TikTok", "tiktok.com/signup", "\u9700\u624B\u673A\u53F7"],
        ["YouTube", "youtube.com/create_channel", "\u9700 Google \u8D26\u53F7"],
        ["Pinterest", "pinterest.com/signup", "\u90AE\u7BB1\u6CE8\u518C"],
        ["Reddit", "reddit.com/register", "\u5148\u5EFA\u4E2A\u4EBA\u53F7\uFF0C\u518D\u5EFA r/MemoryLaneAI"],
        ["Facebook Page", "facebook.com/pages/create", "\u5EFA\u4E3B\u9875\uFF0C\u975E\u4E2A\u4EBA\u53F7"],
      ]),
      emptyLine(),

      h2("4. \u6CE8\u518C\u987A\u5E8F\u5EFA\u8BAE"),
      p("1. Twitter/X \u2014 \u6700\u5148\u6CE8\u518C\uFF0C\u54C1\u724C\u540D @MemoryLaneAI \u62A2\u6CE8"),
      p("2. Instagram \u2014 @MemoryLaneAI\uFF08\u5982\u88AB\u5360\u7528\u7528 @MemoryLane.app\uFF09"),
      p("3. TikTok \u2014 @MemoryLaneAI"),
      p("4. YouTube \u2014 MemoryLane AI\uFF08\u9891\u9053\u540D\uFF09"),
      p("5. Pinterest \u2014 MemoryLaneAI"),
      p("6. Reddit \u2014 \u5148\u6CE8\u518C\u4E2A\u4EBA\u53F7\uFF0C\u518D\u521B\u5EFA r/MemoryLaneAI"),
      p("7. Facebook \u2014 MemoryLane AI\uFF08\u4E3B\u9875\u540D\uFF09"),
      emptyLine(),

      h2("5. \u5404\u5E73\u53F0 Bio \u6587\u6848"),

      h3("Twitter/X\uFF08160 \u5B57\u7B26\uFF09"),
      code("AI-powered photo restoration \u2014 bring your old family photos back to life \u2728"),
      code("Free & unlimited basic restoration"),
      code("\u2193 Try now"),
      emptyLine(),

      h3("Instagram\uFF08150 \u5B57\u7B26\uFF09"),
      code("Restore, animate & relive your family history \uD83D\uDCF8\u2728"),
      code("AI photo restoration \u2014 100% free, no limits"),
      code("Link below \uD83D\uDC47"),
      emptyLine(),

      h3("TikTok\uFF0880 \u5B57\u7B26\uFF09"),
      code("Bring your old photos back to life \uD83D\uDCF8 AI restoration, free & unlimited \u2728"),
      emptyLine(),

      h3("YouTube \u9891\u9053\u63CF\u8FF0"),
      code("MemoryLane uses cutting-edge AI to restore, enhance, and animate"),
      code("your precious old family photos \u2014 completely free."),
      code("\u2728 Basic restoration: unlimited, free"),
      code("\uD83D\uDCAC Photo animation, historical dating, colorization..."),
      code("\uD83D\uDD17 Try it free: memorylane-web.vercel.app"),
      emptyLine(),

      h3("Pinterest"),
      code("AI photo restoration \u2014 restore, colorize & animate old family photos for free \u2728"),
      emptyLine(),

      h3("Reddit"),
      code("Building MemoryLane \u2014 free AI photo restoration for everyone."),
      code("Old photos deserve a second life \uD83D\uDCF8"),
      emptyLine(),

      h3("Facebook \u4E3B\u9875\u7B80\u4ECB"),
      code("MemoryLane is an AI-powered photo restoration platform that brings"),
      code("your old family photos back to life \u2014 completely free."),
      code("\u2705 Restore damaged, scratched, or faded photos"),
      code("\u2705 Colorize black & white photos"),
      code("\u2705 Animate old portraits"),
      code("\u2705 Date historical photos using AI"),
      code("\uD83D\uDD17 Try it free: memorylane-web.vercel.app"),
      emptyLine(),

      h2("6. \u7EDF\u4E00\u6807\u7B7E\u7B56\u7565"),
      bold("\u6838\u5FC3\u6807\u7B7E\uFF08\u6BCF\u7BC7\u5FC5\u5E26\uFF09\uFF1A"),
      code("#MemoryLaneAI #PhotoRestoration #OldPhotos #AI"),
      emptyLine(),
      bold("\u6D41\u91CF\u6807\u7B7E\uFF08\u8F6E\u6362\u4F7F\u7528\uFF09\uFF1A"),
      code("#FamilyHistory #Genealogy #VintagePhotos #PhotoColorization"),
      code("#PhotoEnhancement #RestorePhotos #HistoricalPhotos #BeforeAndAfter"),
      code("#OldPhotoRestoration #FamilyPhotos #Nostalgia #AIart"),
      emptyLine(),

      h2("7. \u793E\u5A92\u5185\u5BB9\u65E5\u5386\uFF08\u9996\u5468\uFF09"),
      makeTable(["\u5929\u6570", "\u5E73\u53F0", "\u5185\u5BB9\u7C7B\u578B", "\u8BF4\u660E"], [
        ["Day 1", "Twitter + Instagram", "Before/After \u5BF9\u6BD4", "\u6700\u76F4\u89C2\uFF0C\u6700\u5BB9\u6613\u4F20\u64AD"],
        ["Day 2", "TikTok + YouTube", "\u7167\u7247\u52A8\u753B\u5316\u89C6\u9891", "\u60C5\u7EEA\u611F\u67D3\u529B\u5F3A"],
        ["Day 3", "Reddit + Pinterest", "\u5386\u53F2\u5E74\u4EE3\u9274\u5B9A\u6848\u4F8B", "\u6280\u672F\u5C55\u793A"],
        ["Day 4", "Instagram + Twitter", "\u4F7F\u7528\u6559\u7A0B/How-to", "3\u6B65\u4FEE\u590D\u8001\u7167\u7247"],
        ["Day 5", "TikTok + YouTube", "\u60C5\u611F\u6545\u4E8B\u7C7B", "\u627E\u5230\u5976\u5976\u5E74\u8F7B\u65F6\u7684\u6837\u5B50"],
        ["Day 6", "Facebook + Pinterest", "\u4FEE\u590D\u524D\u540E\u62FC\u56FE\u5408\u96C6", "\u591A\u5F20\u5BF9\u6BD4\uFF0C\u89C6\u89C9\u51B2\u51FB"],
        ["Day 7", "\u5168\u5E73\u53F0", "\u7528\u6237\u8BC4\u4EF7/\u63A8\u8350", "\u5185\u6D4B\u53CD\u9988"],
      ]),
    ]
  }]
});

// ─── Doc 2: First Content ───
const firstContent = new Document({
  styles: {
    default: { document: { run: { font: "Arial", size: 22 } } },
    paragraphStyles: [
      { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 32, bold: true, font: "Arial", color: "1A2E4A" },
        paragraph: { spacing: { before: 360, after: 200 }, outlineLevel: 0 } },
      { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 26, bold: true, font: "Arial", color: "D4AF37" },
        paragraph: { spacing: { before: 280, after: 160 }, outlineLevel: 1 } },
    ]
  },
  sections: [{
    properties: {
      page: { size: { width: 12240, height: 15840 }, margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 } }
    },
    headers: { default: new Header({ children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: "MemoryLane \u9996\u6279\u5F15\u6D41\u5185\u5BB9", color: "999999", size: 18 })] })] }) },
    footers: { default: new Footer({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Page ", size: 18 }), new TextRun({ children: [PageNumber.CURRENT], size: 18 })] })] }) },
    children: [
      h1("MemoryLane \u9996\u6279\u5F15\u6D41\u5185\u5BB9\u6587\u6848"),
      p("\u9002\u7528\u5E73\u53F0\uFF1ATwitter/X, Instagram, TikTok, Reddit, Pinterest, Facebook, YouTube"),
      emptyLine(),

      h2("Post 1\uFF1ABefore/After \u5BF9\u6BD4\uFF08\u6700\u4F18\u5148\u53D1\u5E03\uFF09"),
      h3("Twitter/X"),
      code("This 1960s family photo was faded, scratched, and barely visible."),
      code("Our AI restored it in 10 seconds \u2014 completely free, no limits."),
      code("Old photos deserve a second life. \uD83D\uDCF8"),
      code("Try it \u2192 https://memorylane-web.vercel.app"),
      code("#MemoryLaneAI #PhotoRestoration #OldPhotos #AI"),
      emptyLine(),
      h3("Instagram"),
      code("\uD83D\uDD39\uD83C\uDFF3\uFE0F\uD83E\uDD0E\uD83D\uDD39 \uD83C\uDFF3\uFE0F\uD83D\uDD39\uD83E\uDD0E\uD83C\uDFF3\uFE0F\uD83C\uDFF3\uFE0F\u2728"),
      code("A 1960s family photo restored in 10 seconds by our AI."),
      code("No watermarks. No sign-up required. No limits."),
      code("Save this post for later \u2014 you never know when you'll need it \uD83E\uDD0E"),
      code("Link in bio to try free \u2193"),
      code("#MemoryLaneAI #PhotoRestoration #BeforeAndAfter #OldPhotos #FamilyHistory"),
      emptyLine(),
      h3("TikTok\uFF08\u89C6\u9891\u811A\u672C\uFF09"),
      code("[\u524D3\u79D2] \u5C55\u793A\u6A21\u7CCA\u8001\u7167\u7247"),
      code("POV: you found your grandma's photo from 1965..."),
      code("[3-6\u79D2] \u4FEE\u590D\u540E\u7167\u7247\uFF08transition\uFF09"),
      code("...and our AI turned it into THIS in 10 seconds"),
      code("[6-10\u79D2] \u53E6\u4E00\u5F20\u4FEE\u590D\u524D\u540E"),
      code("Best part? It's completely free. No limits. No catch."),
      code("[10-15\u79D2] \u5C4F\u5E55\u5F55\u5236\u6F14\u793A"),
      code("Link in bio \u2014 try it on your own family photos"),
      code("#photorestoration #oldphotos #beforeandafter #ai #fyp"),
      emptyLine(),

      new Paragraph({ children: [new PageBreak()] }),

      h2("Post 2\uFF1A\u7167\u7247\u52A8\u753B\u5316\uFF08\u60C5\u611F\u7C7B\uFF09"),
      h3("Twitter/X"),
      code("We animated this photo from 1943."),
      code("The woman in this picture passed away 30 years ago."),
      code("Her granddaughter saw her smile for the first time."),
      code("AI can't bring people back. But it can help us remember them. \uD83D\uDD4A\uFE0F"),
      code("Free to try \u2192 https://memorylane-web.vercel.app"),
      code("#MemoryLaneAI #PhotoAnimation #FamilyHistory"),
      emptyLine(),
      h3("Reddit\uFF08r/OldPhotos + r/Genealogy\uFF09"),
      bold("Title:"),
      code("I built a free AI tool that analyzes old photos and tells you when they were taken"),
      emptyLine(),
      bold("Body:"),
      code("I've been working on MemoryLane \u2014 a free AI photo restoration tool."),
      code("One feature uses GPT-4 Vision to analyze historical photos and estimate:"),
      code("- Approximate date range"),
      code("- Historical period"),
      code("- Photography method"),
      code("- Subject demographics"),
      code("No sign-up needed for basic restoration. Feedback welcome!"),
      code("Link: https://memorylane-web.vercel.app"),
      emptyLine(),

      new Paragraph({ children: [new PageBreak()] }),

      h2("Post 3\uFF1A\u4F7F\u7528\u6559\u7A0B\uFF08How-to \u7C7B\uFF09"),
      h3("Twitter/X\uFF08Thread\uFF09"),
      code("How to restore old family photos in 3 steps (it's free):"),
      code("1\uFE0F\u20E3 Go to memorylane-web.vercel.app"),
      code("2\uFE0F\u20E3 Upload your old photo (JPG, PNG, WebP up to 10MB)"),
      code("3\uFE0F\u20E3 Wait 10 seconds"),
      code("AI removes scratches, enhances faces, upscales to 4K"),
      code("That's it. Your restored photo downloads automatically."),
      code("Try it now \u2192 https://memorylane-web.vercel.app"),
      code("#MemoryLaneAI #PhotoRestoration #HowTo #AI"),
      emptyLine(),

      h2("Post 4\uFF1A\u7528\u6237\u4E92\u52A8/\u6295\u7968\u7C7B"),
      h3("Twitter/X"),
      code("Quick question: what's the OLDEST photo you have of your family?"),
      code("Drop the decade below \uD83D\uDC47"),
      code("\uD83C\uDFDB\uFE0F Before 1900"),
      code("\uD83D\uDCF8 1900-1920"),
      code("\uD83D\uDC54 1920-1940"),
      code("\uD83D\uDCF7 1940-1960"),
      code("\uD83C\uDFDE\uFE0F 1960-1980"),
      code("\uD83D\uDCF1 After 1980"),
      emptyLine(),

      h2("Post 5\uFF1ASEO \u957F\u6587/Pinterest \u535A\u5BA2\u578B"),
      h3("Pinterest Pin \u63CF\u8FF0"),
      code("How to Restore Old Photos for Free in 2026 \u2014 Complete Guide"),
      code("Discover how AI can restore your damaged, faded, or scratched family"),
      code("photos in seconds \u2014 completely free."),
      code("#PhotoRestoration #OldPhotos #Genealogy #FamilyHistory #AI"),
      emptyLine(),

      h2("\u53D1\u5E03\u987A\u5E8F\u5EFA\u8BAE"),
      makeTable(["\u987A\u5E8F", "Post", "\u5E73\u53F0", "\u539F\u56E0"], [
        ["1", "Before/After", "Twitter + Instagram", "\u6700\u76F4\u89C2\uFF0C\u5EFA\u7ACB\u54C1\u724C\u8BA4\u77E5"],
        ["2", "\u5386\u53F2\u9274\u5B9A", "Reddit", "\u6280\u672F\u5C55\u793A\uFF0C\u83B7\u53D6\u65E9\u671F\u53CD\u9988"],
        ["3", "\u7167\u7247\u52A8\u753B\u5316", "TikTok + Instagram", "\u60C5\u611F\u5185\u5BB9\u5BB9\u6613\u75C5\u6BD2\u4F20\u64AD"],
        ["4", "\u4F7F\u7528\u6559\u7A0B", "Twitter + IG Carousel", "\u6559\u80B2\u578B\u5185\u5BB9\uFF0C\u8F6C\u5316\u7387\u6700\u9AD8"],
        ["5", "\u4FEE\u590D\u5408\u96C6", "Facebook + Instagram", "\u591A\u56FE\u51B2\u51FB\uFF0C\u9002\u5408\u5468\u672B"],
        ["6", "\u6295\u7968\u4E92\u52A8", "Twitter + IG Story", "\u4F4E\u6210\u672C\u83B7\u53D6\u4E92\u52A8\u6570\u636E"],
        ["7", "SEO \u957F\u6587", "Pinterest + YouTube", "\u957F\u5C3E\u6D41\u91CF\uFF0C\u6301\u7EED\u5F15\u6D41"],
      ]),
    ]
  }]
});

// ─── Doc 3: Ad Plan ───
const adPlan = new Document({
  styles: {
    default: { document: { run: { font: "Arial", size: 22 } } },
    paragraphStyles: [
      { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 32, bold: true, font: "Arial", color: "1A2E4A" },
        paragraph: { spacing: { before: 360, after: 200 }, outlineLevel: 0 } },
      { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 26, bold: true, font: "Arial", color: "D4AF37" },
        paragraph: { spacing: { before: 280, after: 160 }, outlineLevel: 1 } },
    ]
  },
  sections: [{
    properties: {
      page: { size: { width: 12240, height: 15840 }, margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 } }
    },
    headers: { default: new Header({ children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: "MemoryLane \u5E7F\u544A\u6295\u6D41\u65B9\u6848", color: "999999", size: 18 })] })] }) },
    footers: { default: new Footer({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Page ", size: 18 }), new TextRun({ children: [PageNumber.CURRENT], size: 18 })] })] }) },
    children: [
      h1("MemoryLane \u5E7F\u544A\u6295\u6D41\u6D4B\u8BD5\u65B9\u6848"),
      p("\u9002\u7528\u9636\u6BB5\uFF1A\u51B7\u542F\u52A8\u671F\uFF080-1000 \u7528\u6237\uFF09"),
      p("\u524D\u7F6E\u6761\u4EF6\uFF1A\u793E\u5A92\u8D26\u53F7\u5DF2\u6CE8\u518C\u3001\u9996\u6279\u5185\u5BB9\u5DF2\u53D1\u5E03"),
      emptyLine(),

      h2("1. \u6295\u653E\u7B56\u7565\u6982\u8FF0"),
      bold("\u76EE\u6807\uFF1A"), p("\u4EE5\u6700\u4F4E\u6210\u672C\u83B7\u53D6\u9996\u6279\u771F\u5B9E\u7528\u6237\uFF0C\u9A8C\u8BC1\u4EA7\u54C1-\u5E02\u573A\u5339\u914D\u5EA6"),
      bold("\u9884\u7B97\u5EFA\u8BAE\uFF1A"), p("$50-100 \u6D4B\u8BD5\u671F\uFF08\u7EA6 \u00A5350-700\uFF09"),
      bold("\u6838\u5FC3\u539F\u5219\uFF1A"), p("\u5148\u6D4B\u7D20\u6750\uFF0C\u518D\u653E\u91CF\uFF1B\u5355\u5E73\u53F0\u8DD1\u901A\u518D\u6269\uFF1B\u8FFD\u8E2A\u6CE8\u518C\u8F6C\u5316\u7387 > \u8FFD\u8E2A\u70B9\u51FB\u91CF"),
      emptyLine(),

      h2("2. \u5E73\u53F0\u4F18\u5148\u7EA7"),
      makeTable(["\u4F18\u5148\u7EA7", "\u5E73\u53F0", "\u65E5\u9884\u7B97", "\u539F\u56E0"], [
        ["1\uFE0F\u20E3", "TikTok Ads", "$10-15/\u5929", "\u77ED\u89C6\u9891\u5929\u7136\u9002\u5408\uFF0CCPM \u4F4E"],
        ["2\uFE0F\u20E3", "Reddit Ads", "$5-10/\u5929", "\u7CBE\u51C6\u793E\u533A\u5B9A\u5411"],
        ["3\uFE0F\u20E3", "Meta (IG+FB)", "$10-15/\u5929", "\u53D7\u4F17\u5E7F\u6CDB\uFF0C\u5174\u8DA3\u5B9A\u5411"],
        ["\u23F8\uFE0F", "Google Ads", "\u6682\u7F13", "CPC \u504F\u9AD8 $1-3"],
      ]),
      emptyLine(),

      h2("3. \u53D7\u4F17\u5B9A\u4F4D"),
      h3("TikTok Ads"),
      code("\u5730\u533A\uFF1AUS, UK, Canada, Australia"),
      code("\u5E74\u9F84\uFF1A35-65\uFF08\u5BF9\u8001\u7167\u7247\u6709\u60C5\u611F\u5171\u9E23\u7684\u4EBA\u7FA4\uFF09"),
      code("\u5174\u8DA3\uFF1AFamily, History, Photography, Nostalgia"),
      emptyLine(),
      h3("Reddit Ads"),
      code("\u7248\u5757\uFF1Ar/OldPhotos, r/Colorization, r/Genealogy, r/FamilyHistory"),
      code("\u5730\u533A\uFF1AUS, UK, Canada"),
      code("\u683C\u5F0F\uFF1APromoted Post\uFF08\u770B\u8D77\u6765\u50CF\u666E\u901A\u5E16\u5B50\uFF09"),
      emptyLine(),
      h3("Meta Ads"),
      code("\u5730\u533A\uFF1AUS, UK, Canada, Australia"),
      code("\u5E74\u9F84\uFF1A30-60"),
      code("\u5174\u8DA3\uFF1AGenealogy, Family history, Photography, History, Vintage"),
      emptyLine(),

      h2("4. \u7D20\u6750\u89C4\u683C"),
      makeTable(["\u5E73\u53F0", "\u683C\u5F0F", "\u5C3A\u5BF8", "\u65F6\u957F"], [
        ["TikTok", "\u89C6\u9891", "1080\u00D71920 (9:16)", "15-30 \u79D2"],
        ["Reddit", "\u56FE\u6587", "1200\u00D7628px", "-"],
        ["Meta", "\u56FE\u7247", "1080\u00D71080 (1:1)", "-"],
        ["Meta", "\u89C6\u9891", "1080\u00D71080 (1:1)", "\u6700\u957F 60 \u79D2"],
      ]),
      emptyLine(),

      h2("5. A/B \u6D4B\u8BD5\u8BA1\u5212\uFF08$50 \u9884\u7B97\u5206\u914D\uFF09"),
      makeTable(["\u7EC4", "\u5E73\u53F0", "\u7D20\u6750", "\u6587\u6848", "\u65E5\u9884\u7B97", "\u6D4B\u8BD5\u5929\u6570"], [
        ["A1", "TikTok", "Before/After \u89C6\u9891", "Free photo restoration", "$5", "5 \u5929"],
        ["A2", "TikTok", "\u60C5\u611F\u6545\u4E8B \u89C6\u9891", "Bring photos to life", "$5", "5 \u5929"],
        ["B1", "Reddit", "\u4FEE\u590D\u524D\u540E \u56FE\u7247", "\u6280\u672F\u5C55\u793A\u6807\u9898", "$3", "5 \u5929"],
        ["B2", "Meta", "Before/After \u56FE\u6587", "Restore your old photos", "$5", "5 \u5929"],
      ]),
      emptyLine(),

      h2("6. \u5173\u952E\u6307\u6807"),
      makeTable(["\u6307\u6807", "\u76EE\u6807\u503C", "\u8BF4\u660E"], [
        ["CPM", "< $5", "\u5343\u6B21\u5C55\u793A\u6210\u672C"],
        ["CPC", "< $0.50", "\u70B9\u51FB\u6210\u672C"],
        ["CTR", "> 1.5%", "\u70B9\u51FB\u7387"],
        ["\u6CE8\u518C\u8F6C\u5316\u7387", "> 5%", "\u70B9\u51FB\u2192\u6CE8\u518C"],
        ["\u5B8C\u6210\u4FEE\u590D\u7387", "> 30%", "\u6CE8\u518C\u2192\u5B8C\u6210\u4E00\u6B21\u4FEE\u590D"],
      ]),
      emptyLine(),

      h2("7. \u51B3\u7B56\u89C4\u5219"),
      code("CPM > $10    \u2192 \u6362\u7D20\u6750\u6216\u6362\u53D7\u4F17"),
      code("CPC > $1      \u2192 \u4F18\u5316\u7D20\u6750\u524D3\u79D2"),
      code("CTR < 0.5%   \u2192 \u6362\u7D20\u6750\u65B9\u5411"),
      code("\u6CE8\u518C\u8F6C\u5316 < 2% \u2192 \u4F18\u5316\u843D\u5730\u9875\uFF08Signup \u2192 Upload \u8DEF\u5F84\uFF09"),
      emptyLine(),

      h2("8. 0\u6210\u672C\u66FF\u4EE3\u65B9\u6848\uFF08\u63A8\u8350\u5148\u505A\uFF09"),
      p("\u5728\u82B1\u5E7F\u544A\u8D39\u4E4B\u524D\uFF0C\u5148\u505A\u8FD9\u4E9B\u514D\u8D39\u6E20\u9053\u83B7\u53D6\u524D 100 \u4E2A\u7528\u6237\uFF1A"),
      makeTable(["\u6E20\u9053", "\u52A8\u4F5C", "\u9884\u671F\u6548\u679C"], [
        ["Reddit", "\u53D1\u5E16\u5230 r/OldPhotos, r/Genealogy", "10-50 \u6CE8\u518C/\u5E16"],
        ["Product Hunt", "\u4E0A\u67B6 MemoryLane", "100-500 \u8BBF\u95EE"],
        ["Hacker News", "Show HN \u5E16\u5B50", "50-200 \u8BBF\u95EE"],
        ["Indie Hackers", "\u5206\u4EAB\u6784\u5EFA\u8FC7\u7A0B", "10-30 \u6CE8\u518C"],
        ["Facebook \u7FA4\u7EC4", "Genealogy, Family History \u7FA4\u7EC4", "5-20 \u6CE8\u518C/\u7FA4"],
        ["YouTube Shorts", "\u53D1\u4FEE\u590D\u524D\u540E\u5BF9\u6BD4\u89C6\u9891", "100-1000 \u64AD\u653E"],
      ]),
      emptyLine(),

      h2("9. \u65F6\u95F4\u7EBF"),
      code("Week 1: \u6CE8\u518C\u793E\u5A92\u8D26\u53F7 + \u53D1\u5E03\u81EA\u7136\u5185\u5BB9\uFF08\u4E0D\u53D1\u5E7F\u544A\uFF09"),
      code("Week 2: \u5236\u4F5C\u5E7F\u544A\u7D20\u6750\uFF08Before/After \u89C6\u9891 + \u56FE\u7247\uFF09"),
      code("Week 3: \u542F\u52A8 A/B \u6D4B\u8BD5\uFF08TikTok + Reddit\uFF09"),
      code("Week 4: \u5206\u6790\u6570\u636E\uFF0C\u51B3\u5B9A\u662F\u5426\u6269\u91CF\u6216\u6362\u65B9\u5411"),
    ]
  }]
});

const outDir = "/Users/adai/WorkBuddy/2026-05-18-task-19/memorylane/docs/";

async function main() {
  for (const [name, doc] of [
    ["MemoryLane-\u793E\u5A92\u54C1\u724C\u8D44\u6599\u5305.docx", brandKit],
    ["MemoryLane-\u9996\u6279\u5F15\u6D41\u5185\u5BB9\u6587\u6848.docx", firstContent],
    ["MemoryLane-\u5E7F\u544A\u6295\u6D41\u6D4B\u8BD5\u65B9\u6848.docx", adPlan],
  ]) {
    const buffer = await Packer.toBuffer(doc);
    fs.writeFileSync(outDir + name, buffer);
    console.log("Created:", name);
  }
}

main().catch(console.error);
