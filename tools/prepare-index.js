const fs = require("fs");
const schema = require("./experience.schema.json");
const featured = require("./featured.json");
const made_by_any = require("./made_by_any.json");

var categories = schema.$defs.category.enum;
categories.unshift("Made by Any");
categories.unshift("Featured");

var index = {
  categories: {},
  experiences: {},
};

var appIndex = {
  categories: [],
  experiences: [],
};

for (var i = 0; i < categories.length; i++) {
  index.categories[categories[i]] = [];
}

index.categories["Featured"] = featured;
index.categories["Made by Any"] = made_by_any;

const experiences = fs
  .readdirSync("experiences")
  .filter((file) => fs.statSync(`experiences/${file}`).isDirectory());
experiences.sort((a, b) => {
  if (made_by_any.includes(a) && !made_by_any.includes(b)) {
    return -1;
  }
  if (!made_by_any.includes(a) && made_by_any.includes(b)) {
    return 1;
  }
  return 0;
});
for (var i = 0; i < experiences.length; i++) {
  const experienceName = experiences[i];
  const manifest = require(`../experiences/${experienceName}/manifest.json`);
  const experienceCategories = manifest.categories;
  for (var j = 0; j < experienceCategories.length; j++) {
    const category = experienceCategories[j];
    index.categories[category].push(experienceName);
  }
  index.experiences[experienceName] = manifest;
  appIndex.experiences.push(manifest);
}

for (var i = 0; i < categories.length; i++) {
  let obj = {};
  obj.id = categories[i]
    .match(/[A-Z]{2,}(?=[A-Z][a-z0-9]*|\b)|[A-Z]?[a-z0-9]*|[A-Z]|[0-9]+/g)
    .filter(Boolean)
    .map((x) => x.toLowerCase())
    .join("-");
  obj.experiences = index.categories[categories[i]];
  appIndex.categories.push(obj);
}

appIndex.categories.find((x) => x.id === "made-by-any").icon = "any";
appIndex.categories.find((x) => x.id === "featured").icon = "heart";

fs.writeFileSync("tools/index.json", JSON.stringify(index, null, 2));
fs.writeFileSync("tools/app-index.json", JSON.stringify(appIndex, null, 2));
