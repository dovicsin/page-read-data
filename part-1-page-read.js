/*
Az Adatok weboldalról - 1. rész (https://oa.webspecial.hu/posts/node-adatok-weboldalrol-1-resz/) bejegyzéshez tartozó kód.
*/

const fs = require("fs");
const https = require("https");
const { JSDOM } = require("jsdom");

const url = "https://akjournals.com/search?access=all&pageSize=10&q1=agricultural&sort=datedescending";
const articles = [];

function getArticles(url) {
    https.get(url, (res) => {
        let data = "";
        res.on("data", (chunk) => {
            data += chunk;
        });
        res.on("end", () => {
            console.info(`Adatok sikeresen letöltve az alábbi oldalról: ${url}`);
            dataParser(data);
        });
    })
        .on("error", (err) => {
            console.error("Hiba a letöltés során!");
            console.log(err.message);
            process.exit(0);
        });
}

function dataParser(data) {
    const dom = new JSDOM(data);

    dom.window.document.querySelectorAll(".type-search-result .title a").forEach((elem) => {
        const titleValue = elem.innerHTML;
        const linkValue = elem.getAttribute("href");
        articles.push({ title: titleValue, link: linkValue });
    });
    console.info("Adatok feldolgozva");
    writeArticles(articles);
}

function writeArticles(articles) {
    const json = JSON.stringify(articles);
    fs.writeFileSync('articles.json', json, 'utf8');
    console.info(`A bejegyzések kiírása megtörtént a articles.json állományban.`);
}

console.info(`Adatok letöltése folyamatban...`)
getArticles(url);
