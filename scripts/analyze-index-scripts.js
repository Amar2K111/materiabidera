const fs = require("fs");
const h = fs.readFileSync("index.html", "utf8");
console.log("static h1:", h.includes("Le logiciel IA de réponse"));
console.log("next h1:", h.includes("Transformez vos appels"));
const remote = h.match(/<script[^>]*src="https:\/\/www\.materiabtp\.ai[^"]+"[^>]*>/g) || [];
console.log("remote scripts:", remote.length);
const selfNext = h.includes("self.__next_f");
console.log("RSC flight:", selfNext);
