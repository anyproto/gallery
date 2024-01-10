// 1. create an object where each key is a category name
// 2. fill keys based on the experience.schema.json
// 3. add "Featured" and "Made by Any"
// 4. go through each expierence's manifest and add it's name to the corresponding categories
// 5. save the object to index.json rewriting the old one

const fs = require('fs');
const schema = require('./experience.schema.json');
const featured = require('./featured.json');
const made_by_any = require('./made_by_any.json');

var categories = schema.$defs.category.enum;
categories.push("Featured");
categories.push("Made by Any");

var index = {
  "categories": {},
  "experiences": {}
};

for (var i = 0; i < categories.length; i++) {
  index.categories[categories[i]] = [];
}

index.categories["Featured"] = featured;
index.categories["Made by Any"] = made_by_any;

const experiences = fs.readdirSync('experiences').filter(file => fs.statSync(`experiences/${file}`).isDirectory());
for (var i = 0; i < experiences.length; i++) {
  const experienceName = experiences[i];
  const manifest = require(`../experiences/${experienceName}/manifest.json`);
  const experienceCategories = manifest.categories;
  for (var j = 0; j < experienceCategories.length; j++) {
    const category = experienceCategories[j];
    index.categories[category].push(experienceName);
  }
  index.experiences[experienceName] = manifest;
}

fs.writeFileSync('tools/index.json', JSON.stringify(index, null, 2));