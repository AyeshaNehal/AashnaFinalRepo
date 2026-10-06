const fs = require('fs');
const file = 'frontend/src/data/tutorials.ts';
let code = fs.readFileSync(file, 'utf8');

const replacements = {
  'Welcome To Aashna': 'https://www.youtube.com/embed/2FlFkcJl7vM?autoplay=1',
  'Learn The ABCs': 'https://www.youtube.com/embed/v7DSycHBhPs?autoplay=1',
  'Learn The Numbers': 'https://www.youtube.com/embed/75RmtFBY1DA?autoplay=1',
  'The Duolingo Mode': 'https://www.youtube.com/embed/dJpX1key6W4?autoplay=1',
  'The Number Games': 'https://www.youtube.com/embed/lGqeCI1nYgw?autoplay=1',
  'The Spelling Bee Mode': 'https://www.youtube.com/embed/sAAT96HdTT8?autoplay=1',
  'The Reply Mode': 'https://www.youtube.com/embed/24LvgnXSmjE?autoplay=1'
};

code = code.replace(/videoUrl:\s*'\/videos\/Welcome To Aashna\.mp4'/, "videoUrl: '" + replacements['Welcome To Aashna'] + "'");
code = code.replace(/videoUrl:\s*\"\/videos\/Learn The ABC's\.mp4\"/, "videoUrl: '" + replacements['Learn The ABCs'] + "'");
code = code.replace(/videoUrl:\s*'\/videos\/Learn The Numbers\.mp4'/, "videoUrl: '" + replacements['Learn The Numbers'] + "'");
code = code.replace(/videoUrl:\s*'\/videos\/The Duolingo Mode\.mp4'/, "videoUrl: '" + replacements['The Duolingo Mode'] + "'");
code = code.replace(/videoUrl:\s*'\/videos\/The Number Games\.mp4'/, "videoUrl: '" + replacements['The Number Games'] + "'");
code = code.replace(/videoUrl:\s*'\/videos\/The Spelling Bee Mode\.mp4'/, "videoUrl: '" + replacements['The Spelling Bee Mode'] + "'");
code = code.replace(/videoUrl:\s*'\/videos\/The Reply Mode\.mp4'/, "videoUrl: '" + replacements['The Reply Mode'] + "'");

fs.writeFileSync(file, code);
