const fs = require('fs');
const issue = require('../issue.json');
const [issueExperience, issueTitle, issueScreenshot, issueDescription, issueCategories, issueLanguage, issueAuthor, name, id] = Object.values(issue);

const author = "https://github.com/" + issueAuthor;
const license = "MIT";
const categories = issueCategories.split(", ");

var experience = {
  $schema: "https://tools.gallery.any.coop/experience.schema.json",
  id: id,
  name: name,
  author: author,
  license: license,
  title: issueTitle,
  description: issueDescription,
  categories: categories,
  language: issueLanguage,
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
const zipLink = issueExperience.match(regex)[0];

if (!zipLink) {
  throw new Error(`Experience with name ${name} has no link to zip archive`);
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
const screenshotLinks = issueScreenshot.match(regex);
const screenshotsDir = `${dir}/screenshots`;

if (!screenshotLinks) {
  throw new Error(`Experience with name ${name} has no screenshots`);
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