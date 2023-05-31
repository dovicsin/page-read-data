/*
Az Adatok weboldalról - 2. rész lapozás (https://oa.webspecial.hu/posts/node-adatok-weboldalrol-2-resz-lapozas/) bejegyzéshez tartozó kód.
*/

const fs = require("fs");
const https = require("https");
const { JSDOM } = require("jsdom");

const atricleURL = 'https://akjournals.com/search?access=all&pageSize=50&q1=agricultural&sort=datedescending';
const articles = [];
let articleCount = 50;

async function getArticles(url) {

    let page = 1;
    while (articleCount === 50) {
   	 console.info(`\n${page}. oldal letöltése folyamatban`);
   	 await new Promise((resolve, reject) => {
   		 https.get(https.get(`${url}&page=${page}`, (res) => {
   			 let data = "";
   			 res.on("data", (chunk) => {
   				 data += chunk;
   			 });
   			 res.on("end", () => {
   				 console.info(`Adatok sikeresen letöltve a(z) ${page}. oldalról: ${url}&page=${page}`);
   				 dataClear(data);
   				 resolve(true);
   			 });
   		 })
   			 .on("error", (err) => {
   				 console.error("Hiba a letöltés során!");
   				 console.log(err.message);
   				 resolve(false);
   			 })
   		 );
   	 });
   	 page++;
    };
    writeArticles(articles);

}

function dataClear(data) {
    const dom = new JSDOM(data);
    const articleElements = dom.window.document.querySelectorAll(".type-search-result .title a");
    articleElements.forEach((elem) => {
   	 const titleValue = elem.innerHTML;
   	 const linkValue = elem.getAttribute("href");
   	 articles.push({ title: titleValue, link: linkValue });
    });
    console.info("Adatok feldolgozva");
    articleCount = articleElements.length;
}

function writeArticles(articles) {
    const json = JSON.stringify(articles);
    fs.writeFileSync('articles.json', json, 'utf8');
    console.log(`A bejegyzések kiírása megtörtént a articles.json állományban.`)
}

console.info(`Adatok letöltése folyamatban...`)
getArticles(atricleURL);
