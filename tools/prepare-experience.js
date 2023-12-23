const fs = require('fs');
const issue = require('../issue.json');

const name = issue.name
const author = "https://github.com/" + issue.author;
const license = "MIT";
const categories = issue.categories.split(", ");

var experience = {
  $schema: "https://tools.gallery.any.coop/experience.schema.json",
  id: issue.id,
  name: name,
  author: author,
  license: license,
  title: issue.title,
  description: issue.description,
  categories: categories,
  language: issue.language,
  screenshots: [],
  downloadLink: "",
  fileSize: 0
}

if (!fs.existsSync('experiences')) {
  fs.mkdirSync('experiences');
}

const dir = `experiences/${name}`;
if (fs.existsSync(dir)) {
  console.log(`Experience with name ${name} already exists`);
} else {
  fs.mkdirSync(dir);
}

var regex = /https:\/\/github.com\/.*\/.*\/.*\/.*\.zip/g;
const zipLink = issue.experience.match(regex)[0];

if (!zipLink) {
  throw new Error(`Experience has no link to zip archive`);
}

(async () => {
  const response = await fetch(zipLink);
  const buffer = await response.arrayBuffer();
  fs.writeFileSync(`${dir}/${name}.zip`, Buffer.from(buffer));
})();

const testDownloadLink = "https://github.com/anyproto/gallery/raw/" + name + "/experiences/" + name + "/" + name + ".zip"
const prodDownloadLink = "https://storage.gallery.any.coop/" + name + "/" + name + ".zip"

var regex = /src\s*=\s*"(.+?)"/g;
const extension = "png";
var screenshotLinks = issue.screenshots.match(regex);
const screenshotsDir = `${dir}/screenshots`;

if (!screenshotLinks) {
  var regex = /\((.*?)\)/g;
  screenshotLinks = issue.screenshots.match(regex);
  screenshotLinks = screenshotLinks.map(link => link.replace(/\(|\)/g, ''));
}

var testScreenshotLinks = [];
var prodScreenshotLinks = [];
for (var i = 1; i <= screenshotLinks.length; i++) {
  testScreenshotLinks.push("https://github.com/anyproto/gallery/raw/" + name + "/experiences/" + name + "/screenshots/screenshot-" + i + "." + extension);
  prodScreenshotLinks.push("https://storage.gallery.any.coop/" + name + "/screenshots/screenshot-" + i + "." + extension);
}


if (fs.existsSync(screenshotsDir)) {
  console.log(`Screenshots for experience with name ${name} already exists`);
} else {
  fs.mkdirSync(screenshotsDir);
}

var count = 1;
screenshotLinks.forEach(async (link) => {
  const response = await fetch(link.replace(/src="/, '').replace(/"/, ''));
  const buffer = await response.arrayBuffer();
  fs.writeFileSync(`${screenshotsDir}/screenshot-${count}.${extension}`, Buffer.from(buffer));
  count++;
});


experience.downloadLink = testDownloadLink
experience.screenshots = testScreenshotLinks
fs.writeFileSync(`${dir}/test-manifest.json`, JSON.stringify(experience, null, 2));

experience.downloadLink = prodDownloadLink
experience.screenshots = prodScreenshotLinks
fs.writeFileSync(`${dir}/manifest.json`, JSON.stringify(experience, null, 2));