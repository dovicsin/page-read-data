/*
Az Adatok weboldalról - 3. rész a változás mentése (https://oa.webspecial.hu/posts/node-adatok-weboldalrol-3-resz-a-valtozas-mentese/) bejegyzéshez tartozó kód.
*/

const fs = require("fs");
const https = require("https");
const { JSDOM } = require("jsdom");

const url = require("url");

const pageArticleSize = 50;
const atricleURL = `https://akjournals.com/search?access=all&pageSize=${pageArticleSize}&q1=agricultural&sort=datedescending`;

const articles = [];
let articleCount = 50;

let lastLinks = [];
let isLast = false;
const lastLinksFileName = "lastLinks.txt";
const newLinksFileName = "articles.json";

if (fs.existsSync(lastLinksFileName)) {
	lastLinks = fs.readFileSync(lastLinksFileName, "utf8").split("\n");
}

function writeLastArticlesLink(articles, numberOfLinks = 10) {
	const lastAtricle = articles.slice(0, numberOfLinks);
	fs.writeFileSync(
		lastLinksFileName,
		lastAtricle.map((article) => url.parse(article.link).pathname).join("\n"),
		"utf8"
	);
}

async function getArticles(articleLink) {
	let page = 1;
	while (articleCount === pageArticleSize && isLast === false) {
		console.info(`\n${page}. oldal letöltése folyamatban`);
		await new Promise((resolve, reject) => {
			https.get(
				https
					.get(`${articleLink}&page=${page}`, (res) => {
						let data = "";
						res.on("data", (chunk) => {
							data += chunk;
						});
						res.on("end", () => {
							console.info(
								`Adatok sikeresen letöltve a(z) ${page}. oldalról: ${articleLink}&page=${page}`
							);
							page++;
							dataClear(data);
							resolve(true);
						});
					})
					.on("error", (err) => {
						console.error("Hiba a letöltés során!");
						console.error(err.message);
						resolve(false);
					})
			);
		});
		isLast = true;
	}
	writeArticles(articles);
}

function dataClear(data) {
	const dom = new JSDOM(data);
	const articleElements = dom.window.document.querySelectorAll(
		".type-search-result .title a"
	);
	articleElements.forEach((elem) => {
		const titleValue = elem.innerHTML;
		const linkValue = elem.getAttribute("href");

		//Remove junk query string paramters from the validataion
		const pathName = url.parse(linkValue).pathname;
		if (!isLast && !lastLinks.includes(pathName)) {
			articles.push({ title: titleValue, link: linkValue });
		} else {
			isLast = true;
			return;
		}
	});
	console.info("Adatok feldolgozva\n");
	articleCount = articleElements.length;
}

function writeArticles(articles) {
	if (articles.length > 0) {
		let oldArticles = [];
		if (fs.existsSync(newLinksFileName)) {
			oldArticles = JSON.parse(fs.readFileSync(newLinksFileName, "utf8"));
		}
		const allArticles = [...articles, ...oldArticles];
		const json = JSON.stringify(allArticles);
		fs.writeFileSync(newLinksFileName, json, "utf8");
		writeLastArticlesLink(allArticles);
		console.info(
			`${articles.length}db bejegyzés kiírása megtörtént az ${newLinksFileName} állományban.`
		);
	} else {
		console.info("Nem került be új bejegyzés a legutóbbi futattás óta.");
	}
}

console.info(`Adatok letöltése folyamatban...`);
getArticles(atricleURL);
